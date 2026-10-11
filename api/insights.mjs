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

// Unix seconds only: reject partial, duplicate, reversed and future ranges.
function requestedWindow(params, nowSeconds) {
  const sinceValues = params.getAll('since');
  const untilValues = params.getAll('until');
  if (!sinceValues.length && !untilValues.length) return { value: null };
  if (sinceValues.length !== 1 || untilValues.length !== 1) {
    return { error: 'Provide exactly one since and one until, in Unix seconds.' };
  }
  const values = [sinceValues[0], untilValues[0]];
  if (values.some(value => !/^[0-9]{1,10}$/.test(value))) {
    return { error: 'since and until must be integer Unix timestamps in seconds.' };
  }
  const [since, until] = values.map(Number);
  if (since >= until || until > nowSeconds) {
    return { error: 'Require since < until, with neither boundary in the future.' };
  }
  return { value: {
    since, until,
    start_utc: new Date(since * 1000).toISOString(),
    end_utc: new Date(until * 1000).toISOString(),
  } };
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

  const windowResult = requestedWindow(url.searchParams, Math.floor(Date.now() / 1000));
  if (windowResult.error) {
    return json({ status: 'invalid_window', message: windowResult.error }, 400);
  }
  const window = windowResult.value;

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

  if (window) {
    insightsUrl.searchParams.set('since', String(window.since));
    insightsUrl.searchParams.set('until', String(window.until));
  }

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
      request: {
        metrics, period, metric_type: metricType,
        since: window?.since ?? null, until: window?.until ?? null,
      },
      measurement_window: {
        status: window ? 'explicit_requested' : 'provider_default_unconfirmed',
        requested: window,
        provider_end_times: [...new Set((insightsBody.data || [])
          .flatMap(metric => (metric.values || []).map(value => value.end_time))
          .filter(value => typeof value === 'string'))],
        scope: 'account',
      },
      insights: insightsBody.data || [],
    });
  } catch {
    return json({ status: 'upstream_unreachable' }, 502);
  }
}
