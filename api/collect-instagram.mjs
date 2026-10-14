import { normalize } from '../lib/account-observation.mjs';
import { normalizeAudience } from '../lib/audience-observation.mjs';
import { normalizeMediaSnapshot } from '../lib/media-candidate.mjs';
import { captureAccount, captureMedia, captureAudience, configuredAccountId, metaFailure } from '../lib/meta-instagram.mjs';
import { commitFiles, state } from '../lib/vault-client.mjs';
import { authorized, sameOrigin, cronAuthorized, json } from '../lib/private-auth.mjs';

export function previousDayColombia(now = new Date()) {
  const shifted = new Date(now.getTime() - 5 * 3600000);
  const until = Date.UTC(
    shifted.getUTCFullYear(),
    shifted.getUTCMonth(),
    shifted.getUTCDate(),
    5, 0, 0, 0
  ) / 1000;
  return { since: until - 86400, until };
}

function stamp(value) {
  return value.replace(/[-:.]/g, '');
}

const SAFE_CONFIGURATION_CODES = {
  'Vault write credential missing': 'vault_write_token_missing',
  'Instagram Business ID missing or invalid': 'instagram_business_id_missing_or_invalid',
  'Instagram access token missing': 'instagram_access_token_missing',
  'Graph API version invalid': 'meta_graph_api_version_invalid',
};

export async function collect(now = new Date()) {
  let stage = 'vault_configuration';
  try {
    const vaultToken = process.env.AIO_VAULT_WRITE_TOKEN;
    if (!vaultToken) throw new Error('Vault write credential missing');

    stage = 'meta_configuration';
    const accountId = configuredAccountId();
    stage = 'time_window';
    const { since, until } = previousDayColombia(now);
    const marker = `phase-2/analytics/jobs/instagram/account-v2-${accountId}-${until}.json`;

    stage = 'vault_idempotency';
    const current = await state(vaultToken);
    if (current.entries.some(entry => entry.path === marker)) return { status: 'already_collected', since, until, commit: current.head };

    stage = 'meta_capture';
    const [accountBody, mediaBody, audienceBody] = await Promise.all([
      captureAccount({ since, until }),
      captureMedia({ limit: 25 }),
      captureAudience({ since, until }),
    ]);

    stage = 'account_validation';
    if (accountBody.account?.id !== accountId || mediaBody.account?.id !== accountId || audienceBody.account_id !== accountId) {
      throw new Error('Unexpected Instagram account');
    }

    stage = 'normalization';
    const accountSource = `phase-2/analytics/snapshots/instagram/account/${stamp(accountBody.fetched_at)}.json`;
    const mediaSource = `phase-2/analytics/snapshots/instagram/media/${stamp(mediaBody.fetched_at)}.json`;
    const accountRaw = JSON.stringify(accountBody) + '\n';
    const mediaRaw = JSON.stringify(mediaBody) + '\n';
    const accountRecord = normalize(accountRaw, accountSource, 'MC-001', 'MC-001');
    const mediaRows = normalizeMediaSnapshot(mediaRaw, mediaSource, 'MC-001', 'MC-001');

    const audienceSource = `phase-2/analytics/snapshots/instagram/audience/${stamp(audienceBody.fetched_at)}.json`;
    const audienceRaw = JSON.stringify(audienceBody) + '\n';
    const audienceRecord = normalizeAudience(audienceRaw, audienceSource);

    const files = [
      { path: audienceSource, content: audienceRaw },
      { path: 'commercial-data/audience-ledger/' + audienceRecord.observation_id + '.json', content: JSON.stringify(audienceRecord, null, 2) + '\n' },
      { path: accountSource, content: accountRaw },
      { path: mediaSource, content: mediaRaw },
      {
        path: 'commercial-data/account-ledger/' + accountRecord.observation_id + '.json',
        content: JSON.stringify(accountRecord, null, 2) + '\n',
      },
      ...mediaRows.map(row => ({
        path: 'commercial-data/content-intake/' + row.candidate_id + '.json',
        content: JSON.stringify(row, null, 2) + '\n',
      })),
      {
        path: marker,
        content: JSON.stringify({
          status: 'collected',
          platform: 'instagram',
          entity_id: 'MC-001',
          account_id: accountId,
          since,
          until,
          captured_at: accountBody.fetched_at,
          account_source_ref: accountSource,
          account_observation_ref: 'commercial-data/account-ledger/' + accountRecord.observation_id + '.json',
          media_source_ref: mediaSource,
          audience_source_ref: audienceSource,
          media_paging: mediaBody.paging,
          media_candidate_count: mediaRows.length,
          proposed_content_ids: [...new Set(mediaRows.map(row => row.proposed_content_id))],
          limitations: [
            'Account metrics and media counters are stored separately.',
            'Media candidates are not approved content_provenance records.',
            'No causal effect, recommendation effect or external AI recognition is inferred.',
          ],
        }, null, 2) + '\n',
      },
    ];

    stage = 'vault_commit';
    const result = await commitFiles(
      vaultToken,
      files,
      'Record daily authorized Instagram account and media snapshot',
      marker,
    );

    console.info(JSON.stringify({ event: 'instagram_collection', status: result.status, since, until, media_count: mediaRows.length, media_truncated: mediaBody.paging.truncated }));
    return {
      status: result.status === 'already_collected' ? 'already_collected' : 'collected',
      since,
      until,
      account_observation_id: accountRecord.observation_id,
      media_candidate_count: mediaRows.length,
      media_truncated: mediaBody.paging.truncated,
      commit: result.commit || result.head || null,
    };
  } catch (error) {
    if (error && typeof error === 'object') {
      error.collectionStage = stage;
      if (typeof error.message === 'string' && SAFE_CONFIGURATION_CODES[error.message]) {
        error.collectionCode = SAFE_CONFIGURATION_CODES[error.message];
      }
    }
    throw error;
  }
}

export async function GET(request) {
  if (!cronAuthorized(request)) return json({ status: 'unauthorized' }, 401);
  if (process.env.AIO_COLLECTION_ENABLED !== '1') return json({ status: 'disabled' }, 503);
  return collectionResponse();
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ status: 'forbidden' }, 403);
  if (!authorized(request)) return json({ status: 'unauthorized' }, 401);
  if (process.env.AIO_COLLECTION_ENABLED !== '1') return json({ status: 'disabled' }, 503);
  return collectionResponse();
}

async function collectionResponse() {
  try {
    return json(await collect());
  } catch (error) {
    console.error(JSON.stringify({ event: 'instagram_collection_failed', stage: error?.collectionStage || 'unknown', meta_code: error?.meta?.code ?? null, configuration_code: error?.collectionCode ?? null }));
    const upstreamStatus = Number.isInteger(error?.status) ? error.status : undefined;
    return json({
      status: 'collection_failed',
      diagnostic: {
        stage: error?.collectionStage || 'unknown',
        kind: error?.meta ? 'meta' : upstreamStatus !== undefined ? 'vault' : 'internal',
        ...(error?.collectionCode ? { code: error.collectionCode } : {}),
        ...(upstreamStatus !== undefined ? { upstream_status: upstreamStatus } : {}),
      },
      upstream: error?.meta ? metaFailure(error) : undefined,
    }, 503);
  }
}
