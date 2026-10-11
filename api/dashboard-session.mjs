import { adminHeaderAuthorized, adminSecret, cookie, json, sameOrigin, session } from '../lib/private-auth.mjs';

export async function POST(request) {
  if (!sameOrigin(request)) return json({ status: 'forbidden' }, 403);
  if (!adminSecret()) return json({ status: 'admin_not_configured' }, 503);
  if (!adminHeaderAuthorized(request)) return json({ status: 'unauthorized' }, 401);
  return json({ status: 'ok' }, 200, { 'set-cookie': cookie(session()) });
}

export async function DELETE(request) {
  if (!sameOrigin(request)) return json({ status: 'forbidden' }, 403);
  return json({ status: 'signed_out' }, 200, { 'set-cookie': cookie('', 0) });
}
