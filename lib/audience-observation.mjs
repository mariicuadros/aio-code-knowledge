import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { require, safeObject } from './account-observation.mjs';

export function normalizeAudience(raw, source, recordedAt = new Date().toISOString()) {
  const body = JSON.parse(raw); safeObject(body);
  require(body.status === 'ok' && /^\d+$/.test(body.account_id), 'Audience account required');
  require(/^phase-2\/analytics\/snapshots\/instagram\/audience\/[A-Za-z0-9_.-]+\.json$/.test(source), 'Private audience source required');
  require(Number.isFinite(Date.parse(body.fetched_at)) && Date.parse(body.fetched_at) <= Date.parse(recordedAt), 'Audience capture time invalid');
  require(/^v\d+\.\d+$/.test(body.graph_api_version || ''), 'Audience Graph version invalid');
  require(Array.isArray(body.results) && body.results.length === 5, 'Audience requests missing');
  const keys = new Set();
  for (const result of body.results) {
    require(['views_follow_type','country','city','age','gender'].includes(result.key) && !keys.has(result.key), 'Audience key invalid'); keys.add(result.key);
    require(['ok','provider_rejected'].includes(result.status) && Array.isArray(result.data), 'Audience response invalid');
    require(result.request?.breakdown === (result.key === 'views_follow_type' ? 'follow_type' : result.key), 'Audience breakdown mismatch');
    require(result.request.metric === (result.key === 'views_follow_type' ? 'views' : 'follower_demographics'), 'Audience metric mismatch');
    require(result.request.metric_type === 'total_value', 'Audience aggregation invalid');
    if (result.key === 'views_follow_type') require(result.request.period === 'day' && Number.isInteger(result.request.since) && Number.isInteger(result.request.until) && result.request.since < result.request.until && result.request.until * 1000 <= Date.parse(body.fetched_at), 'Audience interval invalid');
    else require(result.request.period === 'lifetime' && result.request.timeframe === 'last_30_days', 'Audience timeframe invalid');
    for (const entry of result.data) {
      require(entry.name === result.request.metric, 'Unexpected audience metric');
      for (const breakdown of entry.total_value?.breakdowns || []) {
        require(Array.isArray(breakdown.results), 'Audience results missing');
        for (const row of breakdown.results) require(Array.isArray(row.dimension_values) && row.dimension_values.every(x => typeof x === 'string') && typeof row.value === 'number' && Number.isFinite(row.value) && row.value >= 0, 'Audience aggregate invalid');
      }
    }
  }
  const digest = createHash('sha256').update(raw).digest('hex');
  return { record_type: 'account_audience_observation', schema_version: 'phase2-1.0.0', observation_id: 'AUDIENCE-' + digest,
    entity_id: 'MC-001', visibility: 'private', account_id: body.account_id, captured_at: body.fetched_at, recorded_at: recordedAt,
    source_ref: source, source_sha256: digest, graph_api_version: body.graph_api_version, results: body.results, limitations: body.limitations };
}

export function verifyAudience(record, raw) {
  require(isDeepStrictEqual(record, normalizeAudience(raw, record.source_ref, record.recorded_at)), 'Audience differs from evidence');
  return record;
}
