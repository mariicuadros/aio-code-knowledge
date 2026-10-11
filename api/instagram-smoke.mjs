/**
 * Preview-only Meta/Instagram connectivity check.
 * This route is intentionally minimal and cannot run in production.
 * It reads server-side Vercel environment variables and never returns credentials.
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

  const mediaUrl = new URL(`${base}/media`);
  mediaUrl.searchParams.set('fields', 'id,caption,like_count,comments_count,timestamp,media_type');
  mediaUrl.searchParams.set('limit', '3');

  try {
    const [accountResponse, mediaResponse] = await Promise.all([
      fetch(accountUrl, { headers }),
      fetch(mediaUrl, { headers }),
    ]);

    const [account, media] = await Promise.all([
      accountResponse.json(),
      mediaResponse.json(),
    ]);

    if (!accountResponse.ok || !mediaResponse.ok) {
      return respond({
        status: 'meta_request_failed',
        graph_api_version: version,
        account: accountResponse.ok ? 'ok' : safeGraphError(account),
        media: mediaResponse.ok ? 'ok' : safeGraphError(media),
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
      media: (media.data || []).map(item => ({
        id: item.id ?? null,
        media_type: item.media_type ?? null,
        timestamp: item.timestamp ?? null,
        like_count: item.like_count ?? null,
        comments_count: item.comments_count ?? null,
        caption: typeof item.caption === 'string' ? item.caption.slice(0, 120) : null,
      })),
    });
  } catch {
    return respond({ status: 'upstream_unreachable' }, 502);
  }
}
