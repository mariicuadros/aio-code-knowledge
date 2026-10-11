import { normalize } from '../lib/account-observation.mjs';
import { normalizeMediaSnapshot } from '../lib/media-candidate.mjs';
import { captureAccount, captureMedia, configuredAccountId, metaFailure } from '../lib/meta-instagram.mjs';
import { commitFiles } from '../lib/vault-client.mjs';
import { cronAuthorized, json } from '../lib/private-auth.mjs';

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

export async function collect(now = new Date()) {
  const vaultToken = process.env.AIO_VAULT_WRITE_TOKEN;
  if (!vaultToken) throw new Error('Vault write credential missing');
  const accountId = configuredAccountId();
  const { since, until } = previousDayColombia(now);
  const marker = `phase-2/analytics/jobs/instagram/account-${accountId}-${until}.json`;

  const [accountBody, mediaBody] = await Promise.all([
    captureAccount({ since, until }),
    captureMedia({ limit: 25 }),
  ]);

  if (accountBody.account?.id !== accountId || mediaBody.account?.id !== accountId) {
    throw new Error('Unexpected Instagram account');
  }

  const accountSource = `phase-2/analytics/snapshots/instagram/account/${stamp(accountBody.fetched_at)}.json`;
  const mediaSource = `phase-2/analytics/snapshots/instagram/media/${stamp(mediaBody.fetched_at)}.json`;
  const accountRaw = JSON.stringify(accountBody);
  const mediaRaw = JSON.stringify(mediaBody);
  const accountRecord = normalize(accountRaw, accountSource, 'MC-001', 'MC-001');
  const mediaRows = normalizeMediaSnapshot(mediaRaw, mediaSource, 'MC-001', 'MC-001');

  const files = [
    { path: accountSource, content: accountRaw + '\n' },
    { path: mediaSource, content: mediaRaw + '\n' },
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

  const result = await commitFiles(
    vaultToken,
    files,
    'Record daily authorized Instagram account and media snapshot',
    marker,
  );

  return {
    status: result.status === 'already_collected' ? 'already_collected' : 'collected',
    since,
    until,
    account_observation_id: accountRecord.observation_id,
    media_candidate_count: mediaRows.length,
    commit: result.commit || result.head || null,
  };
}

export async function GET(request) {
  if (!cronAuthorized(request)) return json({ status: 'unauthorized' }, 401);
  if (process.env.AIO_COLLECTION_ENABLED !== '1') return json({ status: 'disabled' }, 503);
  try {
    return json(await collect());
  } catch (error) {
    return json({
      status: 'collection_failed',
      upstream: error?.meta ? metaFailure(error) : undefined,
    }, 503);
  }
}
