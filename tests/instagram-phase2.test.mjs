import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { captureAccount, captureMedia } from '../lib/meta-instagram.mjs';
import { normalizeMediaSnapshot, verifyMediaCandidate } from '../lib/media-candidate.mjs';
import { normalize, verify } from '../lib/account-observation.mjs';
import { GET as collectRoute, previousDayColombia } from '../api/collect-instagram.mjs';
import { POST as dashboardLogin } from '../api/dashboard-session.mjs';
import { linkPerformanceLedger } from '../lib/performance-ledger-view.mjs';

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

test('performance ledger links only matching private publication and capture evidence', () => {
  const source = 'phase-2/analytics/snapshots/instagram/media/capture.json';
  const candidate = {
    proposed_content_id: 'MC-001-IG-18010095092949559', candidate_id: 'IGMEDIA-test', owner: 'MC-001', entity_id: 'MC-001',
    source_ref: source, platform: 'instagram', permalink: 'https://www.instagram.com/p/Dcb3wZrGXnV/',
    media_type: 'CAROUSEL_ALBUM', published_at: '2026-08-24T20:00:02.000Z',
    captured_at: '2026-10-11T18:38:22.282Z',
    counters: {
      like_count: { value: 50, state: 'observed', source_ref: source },
      comments_count: { value: 9, state: 'observed', source_ref: source },
    },
  };
  const provenance = {
    record_type: 'content_provenance', content_id: candidate.proposed_content_id, owner: 'MC-001', entity_ids: ['MC-001'], visibility: 'private',
    status: 'published', source_evidence_refs: [source], published_at: '2026-08-24T20:00:02Z',
    platform: 'Instagram', publication_ref: candidate.permalink, content_type: 'EDITORIAL',
    rights_status: 'unknown', commercial_relationship: 'unknown', source_ref: 'commercial-data/content-intake/IGMEDIA.json',
  };
  const observation = {
    record_type: 'performance_observation', content_id: candidate.proposed_content_id, owner: 'MC-001', visibility: 'private',
    observation_id: 'IGOBS-test', source_ref: source, platform: 'Instagram',
    captured_at: candidate.captured_at,
    measurement_window: { start: '2026-08-24T20:00:02Z', end: candidate.captured_at },
    metrics: {
      like_count: { value: 50, state: 'observed', source_ref: source },
      comments_count: { value: 9, state: 'observed', source_ref: source },
    },
  };
  const linked = linkPerformanceLedger([candidate], [provenance, observation]);
  assert.equal(linked[0].provenance.rights_status, 'unknown');
  assert.equal(linked[0].latest_observation.observation_id, 'IGOBS-test');
  assert.equal(linked[0].observation_count, 1);
  assert.throws(() => linkPerformanceLedger([candidate], [
    { ...provenance, owner: 'OTHER' }, observation,
  ]), /owner or entity mismatch/);
  assert.throws(() => linkPerformanceLedger([candidate], [
    provenance, { ...observation, metrics: { ...observation.metrics, like_count: { ...observation.metrics.like_count, value: 51 } } },
  ]), /Like count does not reconcile/);
});
test('performance ledger supports a later immutable capture for the same content ID', () => {
  const firstRef = 'phase-2/analytics/snapshots/instagram/media/first.json';
  const secondRef = 'phase-2/analytics/snapshots/instagram/media/second.json';
  const makeCandidate = (source_ref, captured_at, likes) => ({
    proposed_content_id: 'MC-001-IG-123', candidate_id: 'IGMEDIA-' + captured_at, owner: 'MC-001', entity_id: 'MC-001',
    source_ref, platform: 'instagram', permalink: 'https://www.instagram.com/p/example/',
    media_type: 'IMAGE', published_at: '2026-08-24T20:00:02.000Z', captured_at,
    counters: {
      like_count: { value: likes, state: 'observed', source_ref },
      comments_count: { value: 2, state: 'observed', source_ref },
    },
  });
  const first = makeCandidate(firstRef, '2026-10-11T18:38:22.282Z', 50);
  const second = makeCandidate(secondRef, '2026-10-12T18:38:22.282Z', 57);
  const provenance = {
    record_type: 'content_provenance', content_id: first.proposed_content_id, owner: 'MC-001', entity_ids: ['MC-001'], visibility: 'private',
    status: 'published', source_evidence_refs: [firstRef], published_at: '2026-08-24T20:00:02Z',
    platform: 'Instagram', publication_ref: first.permalink, content_type: 'EDITORIAL',
    rights_status: 'unknown', commercial_relationship: 'unknown', source_ref: 'intake.json',
  };
  const observation = {
    record_type: 'performance_observation', content_id: first.proposed_content_id, owner: 'MC-001', visibility: 'private',
    observation_id: 'IGOBS-next', source_ref: secondRef, platform: 'Instagram',
    captured_at: second.captured_at,
    measurement_window: { start: '2026-08-24T20:00:02Z', end: second.captured_at },
    metrics: {
      like_count: { value: 57, state: 'observed', source_ref: secondRef },
      comments_count: { value: 2, state: 'observed', source_ref: secondRef },
    },
  };
  const linked = linkPerformanceLedger([first, second], [provenance, observation]);
  assert.equal(linked.length, 1);
  assert.equal(linked[0].captured_at, second.captured_at);
  assert.equal(linked[0].latest_observation.observation_id, 'IGOBS-next');
});
