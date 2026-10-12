import { createHash, timingSafeEqual } from 'node:crypto';
import { adminHeaderAuthorized, adminSecret, cookie, json, sameOrigin, session } from '../lib/private-auth.mjs';

const digest = value => createHash('sha256').update(value).digest();
let loginWindow = { start: 0, attempts: 0 };

export async function POST(request) {
  if (!sameOrigin(request)) return json({ status: 'forbidden' }, 403);
  if (!adminSecret()) return json({ status: 'admin_not_configured' }, 503);
  const now = Date.now();
  if (now - loginWindow.start >= 60000) loginWindow = { start: now, attempts: 0 };
  if (++loginWindow.attempts > 10) return json({ status: 'rate_limited' }, 429, { 'retry-after': '60' });
  const suppliedCode = request.headers.get('x-aio-dashboard-code');
  if (suppliedCode !== null) {
    const expected = process.env.AIO_DASHBOARD_ACCESS_CODE || '';
    if (expected.length < 16) return json({ status: 'access_code_not_configured' }, 503);
    if (!suppliedCode || suppliedCode.length > 256 || !timingSafeEqual(digest(suppliedCode), digest(expected)))
      return json({ status: 'unauthorized' }, 401);
  } else if (!adminHeaderAuthorized(request)) return json({ status: 'unauthorized' }, 401);
  return json({ status: 'ok' }, 200, { 'set-cookie': cookie(session()) });
}

export async function DELETE(request) {
  if (!sameOrigin(request)) return json({ status: 'forbidden' }, 403);
  return json({ status: 'signed_out' }, 200, { 'set-cookie': cookie('', 0) });
}
