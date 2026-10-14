const GRAPH_HOST = 'https://graph.facebook.com';

export const ACCOUNT_METRICS = ['reach', 'views', 'total_interactions'];
export const MEDIA_METRICS = ['reach', 'views', 'saved', 'shares', 'total_interactions'];

export function requireValue(condition, message) {
  if (!condition) throw new Error(message);
}

function graphConfig() {
  const accountId = process.env.IG_BUSINESS_ID;
  const token = process.env.IG_LONG_TOKEN;
  const version = process.env.META_GRAPH_API_VERSION || 'v22.0';
  requireValue(accountId && /^\d+$/.test(accountId), 'Instagram Business ID missing or invalid');
  requireValue(token, 'Instagram access token missing');
  requireValue(/^v\d+\.\d+$/.test(version), 'Graph API version invalid');
  return { accountId, token, version };
}

function safeGraphError(payload, status) {
  const error = payload?.error;
  return {
    status,
    code: typeof error?.code === 'number' ? error.code : null,
    type: typeof error?.type === 'string' ? error.type : null,
    message: 'Meta Graph API request failed',
  };
}

async function graph(path, params = {}) {
  const { token, version } = graphConfig();
  const url = new URL(`${GRAPH_HOST}/${version}/${path.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    redirect: 'error',
    signal: AbortSignal.timeout(15000),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const failure = new Error('Meta Graph API request failed');
    failure.meta = safeGraphError(payload, response.status);
    throw failure;
  }
  return payload;
}

export function graphVersion() {
  return graphConfig().version;
}

export function configuredAccountId() {
  return graphConfig().accountId;
}

export async function fetchAccount() {
  const { accountId } = graphConfig();
  return graph(accountId, {
    fields: 'id,username,name,followers_count,media_count',
  });
}

export async function fetchAccountInsights({ since = null, until = null } = {}) {
  const { accountId } = graphConfig();
  const params = {
    metric: ACCOUNT_METRICS.join(','),
    period: 'day',
    metric_type: 'total_value',
  };
  if (since !== null || until !== null) {
    requireValue(Number.isInteger(since) && Number.isInteger(until) && since >= 0 && since < until,
      'Explicit insights window requires integer since < until');
    params.since = since;
    params.until = until;
  }
  return graph(`${accountId}/insights`, params);
}

export async function fetchMedia({ limit = 25, after = null } = {}) {
  const { accountId } = graphConfig();
  requireValue(Number.isInteger(limit) && limit >= 1 && limit <= 100, 'Media limit must be 1..100');
  return graph(`${accountId}/media`, {
    fields: 'id,caption,like_count,comments_count,timestamp,media_type,permalink',
    limit,
    after,
  });
}

export async function captureAccount({ since = null, until = null } = {}) {
  const [account, insights] = await Promise.all([
    fetchAccount(),
    fetchAccountInsights({ since, until }),
  ]);
  const fetchedAt = new Date().toISOString();
  const requested = since === null ? null : {
    since,
    until,
    start_utc: new Date(since * 1000).toISOString(),
    end_utc: new Date(until * 1000).toISOString(),
  };
  return {
    status: 'ok',
    fetched_at: fetchedAt,
    graph_api_version: graphVersion(),
    account,
    request: {
      metrics: [...ACCOUNT_METRICS],
      period: 'day',
      metric_type: 'total_value',
      since,
      until,
    },
    measurement_window: {
      status: requested ? 'explicit_requested' : 'provider_default_unconfirmed',
      requested,
      provider_end_times: [...new Set((insights.data || [])
        .flatMap(metric => (metric.values || []).map(value => value.end_time))
        .filter(value => typeof value === 'string'))],
      scope: 'account',
    },
    insights: insights.data || [],
  };
}

// Optional metrics preserve the provider rejection instead of inventing zero.
async function optionalInsight(path, params) {
  try { return { status: 'ok', data: (await graph(path, params)).data || [] }; }
  catch (error) {
    if (![10, 100, 200].includes(error?.meta?.code)) throw error;
    return { status: 'provider_rejected', diagnostic: error.meta, data: [] };
  }
}

export async function fetchMediaInsights(mediaId) {
  requireValue(typeof mediaId === 'string' && /^\d+$/.test(mediaId), 'Media ID invalid');
  const combined = await optionalInsight(`${mediaId}/insights`, { metric: MEDIA_METRICS.join(',') });
  if (combined.status === 'ok') return { requested_metrics: [...MEDIA_METRICS], ...combined };
  // One unsupported metric must not discard other supported media metrics.
  const results = await Promise.all(MEDIA_METRICS.map(async metric => ({ metric,
    ...await optionalInsight(`${mediaId}/insights`, { metric }) })));
  return { requested_metrics: [...MEDIA_METRICS], status: 'partial',
    data: results.flatMap(r => r.data), rejected: results.filter(r => r.status !== 'ok')
      .map(r => ({ metric: r.metric, diagnostic: r.diagnostic })) };
}

export async function captureMedia({ limit = 25, maxPages = 4 } = {}) {
  requireValue(Number.isInteger(maxPages) && maxPages >= 1 && maxPages <= 4, 'Media pages must be 1..4');
  const account = await fetchAccount();
  const rows = [], seen = new Set();
  let after = null, hasNext = false, pages = 0;
  do {
    const page = await fetchMedia({ limit, after }); pages++;
    for (const row of page.data || []) {
      if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); }
    }
    hasNext = Boolean(page.paging?.next);
    const next = page.paging?.cursors?.after;
    if (!hasNext) break;
    requireValue(typeof next === 'string' && next && next !== after, 'Media pagination cursor missing');
    after = next;
  } while (pages < maxPages);
  const mediaInsights = [];
  // Bound upstream concurrency to avoid fan-out against the entire catalogue.
  for (let i = 0; i < rows.length; i += 4) {
    mediaInsights.push(...await Promise.all(rows.slice(i, i + 4).map(async row => ({
      media_id: row.id, ...await fetchMediaInsights(row.id) }))));
  }
  return { status: 'ok', fetched_at: new Date().toISOString(), graph_api_version: graphVersion(),
    account: { id: account.id, username: account.username }, media: rows,
    media_insights: mediaInsights,
    paging: { has_next: hasNext, pages, max_pages: maxPages, truncated: hasNext },
    measurement_window: { scope: 'media', period: 'lifetime', status: 'provider_lifetime_at_capture' } };
}

export async function captureAudience({ since, until }) {
  const accountId = configuredAccountId();
  const requests = [
    { key: 'views_follow_type', metric: 'views', period: 'day', metric_type: 'total_value', breakdown: 'follow_type', since, until },
    ...['country', 'city', 'age', 'gender'].map(breakdown => ({ key: breakdown,
      metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', timeframe: 'last_30_days', breakdown })),
  ];
  const results = await Promise.all(requests.map(async ({ key, ...params }) => ({ key, request: params,
    ...await optionalInsight(`${accountId}/insights`, params) })));
  return { status: 'ok', account_id: accountId, fetched_at: new Date().toISOString(),
    graph_api_version: graphVersion(), results,
    limitations: ['Account-level aggregated audience; never attribute geography to an individual publication.',
      'Demographic availability and privacy thresholds are controlled by Meta.',
      'Follower demographics use last_30_days; view breakdown uses the requested account day.'] };
}

export function metaFailure(error) {
  if (error?.meta) return error.meta;
  return { status: null, code: null, type: null, message: 'Meta Graph API request failed' };
}
