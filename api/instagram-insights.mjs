/**
 * Preview-only Instagram account insights check.
 * Minimal clean restart: no custom app auth layer yet; Vercel Preview protection is the access boundary.
 * Credentials stay server-side and are never returned.
 */
const respond = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const safeGraphError = payload => ({
  code: typeof payload?.error?.code === 'number' ? payload.error.code : null,
  type: typeof payload?.error?.type === 'string' ? payload.error.type : null,
  message: 'Meta Graph API request failed',
});

export async function GET() {
  if (process.env.VERCEL_ENV !== 'preview') {
    return respond({ status: 'preview_only' }, 404);
  }

  const igId = process.env.IG_BUSINESS_ID;
  const token = process.env.IG_LONG_TOKEN;
  if (!igId || !token) {
    return respond({ status: 'missing_meta_configuration' }, 503);
  }

  const version = process.env.META_GRAPH_API_VERSION || 'v22.0';
  const base = `https://graph.facebook.com/${version}/${encodeURIComponent(igId)}`;
  const headers = {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
  };

  const accountUrl = new URL(base);
  accountUrl.searchParams.set('fields', 'id,username,name,followers_count,media_count');

  const insightsUrl = new URL(`${base}/insights`);
  insightsUrl.searchParams.set('metric', 'reach,views,total_interactions');
  insightsUrl.searchParams.set('period', 'day');
  insightsUrl.searchParams.set('metric_type', 'total_value');

  try {
    const [accountResponse, insightsResponse] = await Promise.all([
      fetch(accountUrl, { headers }),
      fetch(insightsUrl, { headers }),
    ]);

    const [account, insights] = await Promise.all([
      accountResponse.json(),
      insightsResponse.json(),
    ]);

    if (!accountResponse.ok || !insightsResponse.ok) {
      return respond({
        status: 'meta_request_failed',
        graph_api_version: version,
        account: accountResponse.ok ? 'ok' : safeGraphError(account),
        insights: insightsResponse.ok ? 'ok' : safeGraphError(insights),
      }, 502);
    }

    return respond({
      status: 'ok',
      checked_at: new Date().toISOString(),
      graph_api_version: version,
      account: {
        id: account.id ?? null,
        username: account.username ?? null,
        name: account.name ?? null,
        followers_count: account.followers_count ?? null,
        media_count: account.media_count ?? null,
      },
      request: {
        metrics: ['reach', 'views', 'total_interactions'],
        period: 'day',
        metric_type: 'total_value',
      },
      insights: insights.data || [],
    });
  } catch {
    return respond({ status: 'upstream_unreachable' }, 502);
  }
}
