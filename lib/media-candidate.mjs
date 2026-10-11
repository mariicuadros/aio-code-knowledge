import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';

const SECRET = /^(access_token|ig_long_token|authorization|password|api_key|secret|aio_.*token)$/i;
const ID = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,159}$/;

function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function safeObject(value) {
  if (Array.isArray(value)) {
    value.forEach(safeObject);
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      requireValue(!SECRET.test(key), 'Credential field forbidden');
      safeObject(item);
    }
  }
}

function utc(value) {
  requireValue(typeof value === 'string' && Number.isFinite(Date.parse(value)), 'Valid timestamp required');
  return new Date(value).toISOString();
}

function counter(value, definition, source) {
  const present = value !== undefined;
  if (present) requireValue(Number.isInteger(value) && value >= 0, 'Counter must be a nonnegative integer');
  return {
    value: present ? value : null,
    state: present ? 'observed' : 'not_collected',
    unit: 'count',
    definition,
    source_ref: source,
  };
}

export function normalizeMediaSnapshot(raw, source, entityId, owner, recordedAt = new Date().toISOString()) {
  const body = JSON.parse(raw);
  safeObject(body);
  requireValue(body.status === 'ok', 'Successful media snapshot required');
  requireValue(ID.test(entityId) && ID.test(owner), 'Entity mapping required');
  requireValue(/^phase-2\/analytics\/snapshots\/instagram\/media\/[A-Za-z0-9_.-]+\.json$/.test(source),
    'Private media evidence path required');
  requireValue(typeof body.account?.id === 'string' && /^\d+$/.test(body.account.id), 'Account ID required');
  requireValue(typeof body.account?.username === 'string' && body.account.username.trim(), 'Username required');
  const capturedAt = utc(body.fetched_at);
  const recorded = utc(recordedAt);
  requireValue(Date.parse(capturedAt) <= Date.parse(recorded), 'Record predates capture');
  requireValue(typeof body.graph_api_version === 'string' && /^v\d+\.\d+$/.test(body.graph_api_version),
    'Graph version required');
  requireValue(Array.isArray(body.media), 'Media array required');

  const sourceSha256 = createHash('sha256').update(raw).digest('hex');
  const seen = new Set();

  return body.media.map(item => {
    requireValue(typeof item?.id === 'string' && /^\d+$/.test(item.id), 'Media ID required');
    requireValue(!seen.has(item.id), 'Duplicate media ID');
    seen.add(item.id);
    requireValue(typeof item.media_type === 'string' && item.media_type.trim(), 'Media type required');
    const publishedAt = utc(item.timestamp);
    requireValue(Date.parse(publishedAt) <= Date.parse(capturedAt), 'Media publication after capture');
    if (item.permalink !== undefined) {
      const link = new URL(item.permalink);
      requireValue(link.protocol === 'https:', 'HTTPS permalink required');
    }
    if (item.caption !== undefined) requireValue(typeof item.caption === 'string', 'Caption must be text');

    const candidateId = `IGMEDIA-${item.id}-${sourceSha256.slice(0, 12)}`;
    const proposedContentId = `${entityId}-IG-${item.id}`;
    requireValue(ID.test(candidateId) && ID.test(proposedContentId), 'Generated content identity invalid');

    return {
      record_type: 'platform_content_candidate',
      schema_version: 'phase2-1.0.0',
      candidate_id: candidateId,
      proposed_content_id: proposedContentId,
      entity_id: entityId,
      owner,
      visibility: 'private',
      platform: 'instagram',
      account_id: body.account.id,
      username: body.account.username,
      platform_media_id: item.id,
      media_type: item.media_type,
      published_at: publishedAt,
      permalink: item.permalink ?? null,
      caption: item.caption ?? null,
      captured_at: capturedAt,
      recorded_at: recorded,
      source_ref: source,
      source_sha256: sourceSha256,
      graph_api_version: body.graph_api_version,
      counters: {
        like_count: counter(item.like_count, 'Current Instagram like_count observed for this media at capture.', source),
        comments_count: counter(item.comments_count, 'Current Instagram comments_count observed for this media at capture.', source),
      },
      mapping_status: 'pending_human_mapping',
      limitations: [
        'Platform media identity is observed; proposed_content_id is an internal stable mapping candidate.',
        'This record is not a content_provenance record and does not establish rights, authorship, commercial status or creative classification.',
        'Counters are point-in-time platform fields and are not account-level reach or views.',
      ],
    };
  });
}

export function verifyMediaCandidate(record, raw) {
  const rows = normalizeMediaSnapshot(raw, record.source_ref, record.entity_id, record.owner, record.recorded_at);
  const expected = rows.find(row => row.candidate_id === record.candidate_id);
  requireValue(expected && isDeepStrictEqual(record, expected), 'Media candidate differs from raw evidence');
  return record;
}
