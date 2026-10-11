import { createHash, createHmac, timingSafeEqual, randomBytes } from 'node:crypto';

const COOKIE = '__Host-aio_brain';

const digest = value => createHash('sha256').update(String(value)).digest();
const equal = (a, b) => timingSafeEqual(digest(a), digest(b));

export const json = (body, status = 200, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...extra,
    },
  });

export function cronAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get('authorization') || '';
  return Boolean(secret && header.startsWith('Bearer ') && equal(header.slice(7), secret));
}

export function adminSecret() {
  return process.env.AIO_DASHBOARD_ADMIN_TOKEN || process.env.AIO_INSIGHTS_ADMIN_TOKEN || '';
}

export function adminHeaderAuthorized(request) {
  const supplied = request.headers.get('x-aio-admin-token') || '';
  const expected = adminSecret();
  return Boolean(expected && supplied && equal(supplied, expected));
}

const signingKey = () => adminSecret();

export function cookie(value, maxAge = 3600) {
  return COOKIE + '=' + value + '; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=' + maxAge;
}

export function session(now = Date.now()) {
  const key = signingKey();
  if (!key) throw new Error('Dashboard admin secret is not configured');
  const body = Buffer.from(JSON.stringify({
    exp: Math.floor(now / 1000) + 3600,
    nonce: randomBytes(16).toString('hex'),
  })).toString('base64url');
  return body + '.' + createHmac('sha256', key).update(body).digest('base64url');
}

export function authorized(request, now = Date.now()) {
  if (adminHeaderAuthorized(request)) return true;
  const key = signingKey();
  if (!key) return false;
  const token = (request.headers.get('cookie') || '')
    .split(';').map(value => value.trim())
    .find(value => value.startsWith(COOKIE + '='))?.slice(COOKIE.length + 1);
  if (!token || token.length > 1024) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const expected = createHmac('sha256', key).update(parts[0]).digest('base64url');
  if (!equal(parts[1], expected)) return false;
  try {
    const value = JSON.parse(Buffer.from(parts[0], 'base64url'));
    return Number.isInteger(value.exp) && value.exp > now / 1000 && value.exp <= now / 1000 + 3600;
  } catch {
    return false;
  }
}

export function sameOrigin(request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}
