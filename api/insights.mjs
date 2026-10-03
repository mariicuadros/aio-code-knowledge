/** Private Instagram account + insights diagnostic endpoint.
 * Disabled unless AIO_INSIGHTS_ENABLED=1 and protected by AIO_INSIGHTS_ADMIN_TOKEN.
 * Secrets are never returned, logged, or placed in URLs.
 * Preview-only smoke test before merge; production remains disabled by default.
 */

import { createHash, timingSafeEqual } from 'node:crypto';

const APPROVED_METRICS = new Set(['reach', 'views', 'total_interactions']);

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const hash = value => createHash('sha256').update(value).digest();

function authorized(request) {
  const expected = process.env.AIO_INSIGHTS_ADMIN_TOKEN;
  const header = request.headers.get('authorization') || '';
  if (!expected || !header.startsWith('Bearer ')) return false;
  const supplied = hash(header.slice(7));
  const configured = hash(expected);
  return timingSafeEqual(supplied, configured);
}

function graphError(payload) {
  const error = payload?.error;
  return {
    code: typeof error?.code === 'number' ? error.code : null,
    type: typeof error?.type === 'string' ? error.type : null,
    message: 'Meta Graph API request failed',
  };
}

function allowedList(value, fallback) {
  if (!value) return fallback;
  const requested = value.split(',').map(item => item.trim()).filter(Boolean);
  if (!requested.length || requested.length > 20 || requested.some(metric => !APPROVED_METRICS.has(metric))) {
    return null;
  }
  return requested;
}

export async function GET(request) {
  if (process.env.AIO_INSIGHTS_ENABLED !== '1') {
    return json({ status: 'disabled' }, 503);
  }

  if (!authorized(request)) {
    return json({ status: 'unauthorized' }, 401);
  }

  const businessId = process.env.IG_BUSINESS_ID;
  const accessToken = process.env.IG_LONG_TOKEN;
  if (!businessId || !accessToken) {
    return json({ status: 'meta_credentials_not_configured' }, 503);
  }

  const url = new URL(request.url);
  const version = process.env.META_GRAPH_API_VERSION || 'v22.0';
  const period = ['day', 'week', 'days_28', 'month', 'lifetime'].includes(url.searchParams.get('period'))
    ? url.searchParams.get('period')
    : 'day';
  const metricType = ['total_value', 'time_series', 'default'].includes(url.searchParams.get('metric_type'))
    ? url.searchParams.get('metric_type')
    : 'total_value';
  const metrics = allowedList(
    url.searchParams.get('metric'),
    ['reach', 'views', 'total_interactions']
  );

  if (!metrics) {
    return json({ status: 'invalid_metric' }, 400);
  }

  const base = `https://graph.facebook.com/${version}/${encodeURIComponent(businessId)}`;
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${accessToken}`,
  };
  const accountUrl = new URL(base);
  accountUrl.searchParams.set('fields', 'id,username,name,followers_count,media_count');

  const insightsUrl = new URL(`${base}/insights`);
  insightsUrl.searchParams.set('metric', metrics.join(','));
  insightsUrl.searchParams.set('period', period);
  insightsUrl.searchParams.set('metric_type', metricType);

  try {
    const [accountResponse, insightsResponse] = await Promise.all([
      fetch(accountUrl, { headers }),
      fetch(insightsUrl, { headers }),
    ]);

    const [accountBody, insightsBody] = await Promise.all([
      accountResponse.json(),
      insightsResponse.json(),
    ]);

    if (!accountResponse.ok || !insightsResponse.ok) {
      return json({
        status: 'meta_request_failed',
        account: accountResponse.ok ? 'ok' : graphError(accountBody),
        insights: insightsResponse.ok ? 'ok' : graphError(insightsBody),
        graph_api_version: version,
      }, 502);
    }

    return json({
      status: 'ok',
      fetched_at: new Date().toISOString(),
      graph_api_version: version,
      account: accountBody,
      request: { metrics, period, metric_type: metricType },
      insights: insightsBody.data || [],
    });
  } catch {
    return json({ status: 'upstream_unreachable' }, 502);
  }
}
