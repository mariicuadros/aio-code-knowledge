import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { captureAccount, captureMedia } from '../lib/meta-instagram.mjs';
import { normalizeMediaSnapshot, verifyMediaCandidate } from '../lib/media-candidate.mjs';
import { normalize, verify } from '../lib/account-observation.mjs';
import { GET as collectRoute, previousDayColombia } from '../api/collect-instagram.mjs';
import { POST as dashboardLogin } from '../api/dashboard-session.mjs';

const originalFetch = globalThis.fetch;
const oldEnv = { ...process.env };
let calls;

beforeEach(() => {
  Object.assign(process.env, {
    IG_BUSINESS_ID: '123456789',
    IG_LONG_TOKEN: 'test-meta-token',
    META_GRAPH_API_VERSION: 'v22.0',
    AIO_COLLECTION_ENABLED: '0',
    CRON_SECRET: 'test-cron',
    AIO_DASHBOARD_ADMIN_TOKEN: 'test-admin',
  });
  calls = [];
  globalThis.fetch = async (url, options = {}) => {
    const u = new URL(url);
    calls.push({ url: u, options });
    assert.equal(u.searchParams.has('access_token'), false);
    assert.equal(options.headers.authorization, 'Bearer test-meta-token');
    if (u.pathname.endsWith('/insights')) {
      return Response.json({ data: [
        { name: 'reach', period: 'day', description: 'reach definition', total_value: { value: 11 } },
        { name: 'views', period: 'day', description: 'views definition', total_value: { value: 22 } },
        { name: 'total_interactions', period: 'day', description: 'interactions definition', total_value: { value: 3 } },
      ] });
    }
    if (u.pathname.endsWith('/media')) {
      return Response.json({ data: [{
        id: '18010095092949559',
        caption: 'VOID MODE',
        like_count: 50,
        comments_count: 9,
        timestamp: '2026-08-24T20:00:02+0000',
        media_type: 'CAROUSEL_ALBUM',
        permalink: 'https://www.instagram.com/p/example/',
      }] });
    }
    return Response.json({
      id: '123456789',
      username: 'mariicuadros',
      name: 'Marii Cuadros',
      followers_count: 3363,
      media_count: 1,
    });
  };
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...oldEnv };
});

test('Meta client keeps token out of URLs and captures explicit account window', async () => {
  const body = await captureAccount({ since: 1791176400, until: 1791262800 });
  assert.equal(body.status, 'ok');
  assert.equal(body.account.username, 'mariicuadros');
  assert.equal(body.request.since, 1791176400);
  assert.equal(body.measurement_window.status, 'explicit_requested');
  assert.equal(body.insights[1].total_value.value, 22);
  assert.equal(calls.length, 2);
});

test('Meta media capture returns real-shape platform fields without inventing content metadata', async () => {
  const body = await captureMedia({ limit: 25 });
  assert.equal(body.media.length, 1);
  assert.equal(body.media[0].id, '18010095092949559');
  assert.equal(body.media[0].media_type, 'CAROUSEL_ALBUM');
});

test('account snapshot normalizes to immutable account observation', async () => {
  const body = await captureAccount({ since: 1791176400, until: 1791262800 });
  body.fetched_at = '2026-10-06T21:50:20.509Z';
  const raw = JSON.stringify(body);
  const source = 'phase-2/analytics/snapshots/instagram/account/test.json';
  const record = normalize(raw, source, 'MC-001', 'MC-001', '2026-10-06T22:00:00Z');
  assert.equal(record.metrics.views.value, 22);
  assert.equal(record.visibility, 'private');
  assert.equal(verify(record, raw).observation_id, record.observation_id);
});

test('media snapshot creates stable proposed Content ID but stays pending human mapping', async () => {
  const body = await captureMedia({ limit: 25 });
  body.fetched_at = '2026-10-11T04:28:31.455Z';
  const raw = JSON.stringify(body);
  const source = 'phase-2/analytics/snapshots/instagram/media/test.json';
  const rows = normalizeMediaSnapshot(raw, source, 'MC-001', 'MC-001', '2026-10-11T04:29:00Z');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].proposed_content_id, 'MC-001-IG-18010095092949559');
  assert.equal(rows[0].mapping_status, 'pending_human_mapping');
  assert.equal(rows[0].counters.like_count.value, 50);
  assert.equal(verifyMediaCandidate(rows[0], raw).candidate_id, rows[0].candidate_id);
});

test('Colombia previous-day boundaries remain stable', () => {
  assert.deepEqual(previousDayColombia(new Date('2026-10-11T13:00:00Z')),
    { since: 1791608400, until: 1791694800 });
});

test('collector rejects unauthenticated and disabled calls before touching providers', async () => {
  calls.length = 0;
  let response = await collectRoute(new Request('https://example.test/api/collect-instagram'));
  assert.equal(response.status, 401);
  response = await collectRoute(new Request('https://example.test/api/collect-instagram', {
    headers: { authorization: 'Bearer test-cron' },
  }));
  assert.equal(response.status, 503);
  assert.equal(calls.length, 0);
});

test('dashboard login uses dedicated admin header and same-origin check', async () => {
  const good = new Request('https://example.test/api/dashboard-session', {
    method: 'POST',
    headers: { origin: 'https://example.test', 'x-aio-admin-token': 'test-admin' },
  });
  const ok = await dashboardLogin(good);
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);

  const wrongOrigin = new Request('https://example.test/api/dashboard-session', {
    method: 'POST',
    headers: { origin: 'https://evil.test', 'x-aio-admin-token': 'test-admin' },
  });
  assert.equal((await dashboardLogin(wrongOrigin)).status, 403);
});


test('dashboard access code creates a session without granting API admin header access', async () => {
  process.env.AIO_DASHBOARD_ACCESS_CODE = 'test-dashboard-access-code';
  const request = code => new Request('https://example.test/api/dashboard-session', {
    method: 'POST', headers: {origin: 'https://example.test', 'x-aio-dashboard-code': code},
  });
  const ok = await dashboardLogin(request('test-dashboard-access-code'));
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Strict/);
  assert.equal((await dashboardLogin(request('wrong-code'))).status, 401);
  const { adminHeaderAuthorized } = await import('../lib/private-auth.mjs');
  assert.equal(adminHeaderAuthorized(new Request('https://example.test/api/collect-instagram', {
    headers: {'x-aio-admin-token': 'test-dashboard-access-code'},
  })), false);
});

test('dashboard code login fails closed when code is missing or too short', async () => {
  process.env.AIO_DASHBOARD_ACCESS_CODE = 'short';
  const request = new Request('https://example.test/api/dashboard-session', {
    method: 'POST', headers: {origin:'https://example.test','x-aio-dashboard-code':'short'},
  });
  assert.equal((await dashboardLogin(request)).status, 503);
});


test('dashboard separates authentication from rejected vault credentials', async () => {
  const { GET: dashboard } = await import('../api/dashboard.mjs');
  process.env.AIO_VAULT_READ_TOKEN = 'test-private-vault-token';
  calls.length = 0;
  assert.equal((await dashboard(new Request('https://example.test/api/dashboard'))).status, 401);
  assert.equal(calls.length, 0);
  globalThis.fetch = async () => new Response('{}', {status:403});
  const result = await dashboard(new Request('https://example.test/api/dashboard', {
    headers:{'x-aio-admin-token':'test-admin'},
  }));
  assert.equal(result.status, 503);
  assert.deepEqual(await result.json(), {status:'vault_access_denied'});
});


test('vault accepts the exact legacy terminal LF transformation and rejects altered evidence', async () => {
  const {recordEvidence} = await import('../lib/vault-client.mjs');
  const body=await captureAccount({since:1791176400,until:1791262800});body.fetched_at='2026-10-06T21:50:20.509Z';
  const raw=JSON.stringify(body),source='phase-2/analytics/snapshots/instagram/account/test.json';
  const row=normalize(raw,source,'MC-001','MC-001','2026-10-06T22:00:00Z'),notes=[];
  assert.equal(recordEvidence(raw,row,notes),raw);assert.equal(notes.length,0);
  assert.equal(recordEvidence(raw+'\n',row,notes),raw);assert.equal(notes[0].kind,'legacy_terminal_lf');
  assert.equal(verify(row,recordEvidence(raw+'\n',row)).observation_id,row.observation_id);
  assert.throws(()=>recordEvidence(raw+'\n\n',row),/Evidence digest mismatch/);
  assert.throws(()=>recordEvidence(raw.replace('mariicuadros','altered-account')+'\n',row),/Evidence digest mismatch/);
  const body2=await captureMedia({limit:25});body2.fetched_at='2026-10-11T04:28:31.455Z';
  const mediaRaw=JSON.stringify(body2),mediaSource='phase-2/analytics/snapshots/instagram/media/test.json';
  const media=normalizeMediaSnapshot(mediaRaw,mediaSource,'MC-001','MC-001','2026-10-11T04:29:00Z')[0];
  assert.equal(verifyMediaCandidate(media,recordEvidence(mediaRaw+'\n',media)).candidate_id,media.candidate_id);
  const future=normalize(raw+'\n',source,'MC-001','MC-001','2026-10-06T22:00:00Z'),futureNotes=[];
  assert.equal(recordEvidence(raw+'\n',future,futureNotes),raw+'\n');assert.equal(futureNotes.length,0);
});
