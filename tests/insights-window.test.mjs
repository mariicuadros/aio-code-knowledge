import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { GET } from '../api/insights.mjs';
const oldEnv = { ...process.env };
const originalFetch = globalThis.fetch;
let calls;
beforeEach(() => {
  process.env.AIO_INSIGHTS_ENABLED = '1';
  process.env.AIO_INSIGHTS_ADMIN_TOKEN = 'test-admin';
  process.env.IG_BUSINESS_ID = 'test-account';
  process.env.IG_LONG_TOKEN = 'test-meta';
  calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: new URL(url), options });
    return Response.json(String(url).includes('/insights')
      ? { data: [{ name: 'reach', total_value: { value: 0 } }] }
      : { id: 'test-account', followers_count: 10 });
  };
});
afterEach(() => { process.env = { ...oldEnv }; globalThis.fetch = originalFetch; });
const request = (query = '', auth = true) => new Request('https://example.test/api/insights' + query,
  { headers: auth ? { authorization: 'Bearer test-admin' } : {} });
test('forwards explicit seconds only to insights and retains zeros', async () => {
  const response = await GET(request('?since=1791176400&until=1791262800'));
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(calls[0].url.searchParams.has('since'), false);
  assert.equal(calls[1].url.searchParams.get('since'), '1791176400');
  assert.equal(calls[1].url.searchParams.get('until'), '1791262800');
  assert.equal(body.measurement_window.status, 'explicit_requested');
  assert.equal(body.measurement_window.requested.start_utc, '2026-10-05T05:00:00.000Z');
  assert.equal(body.insights[0].total_value.value, 0);
  assert.equal(JSON.stringify(body).includes('test-meta'), false);
});
test('omitted window preserves provider default without inventing dates', async () => {
  const body = await (await GET(request())).json();
  assert.equal(body.measurement_window.status, 'provider_default_unconfirmed');
  assert.equal(body.measurement_window.requested, null);
  assert.equal(calls[1].url.searchParams.has('since'), false);
});
for (const query of ['?since=1', '?until=2', '?since=&until=2',
  '?since=1000.5&until=2000', '?since=1791176400000&until=1791262800000',
  '?since=2&until=1', '?since=2&until=2', '?since=1&until=9999999999',
  '?since=1&since=2&until=3']) {
  test('rejects invalid range without Meta call: ' + query, async () => {
    const response = await GET(request(query));
    assert.equal(response.status, 400);
    assert.equal(calls.length, 0);
  });
}
test('authorization remains required', async () => {
  assert.equal((await GET(request('?since=1&until=2', false))).status, 401);
  assert.equal(calls.length, 0);
});
test('disabled endpoint never calls Meta', async () => {
  process.env.AIO_INSIGHTS_ENABLED = '0';
  assert.equal((await GET(request())).status, 503);
  assert.equal(calls.length, 0);
});
test('missing credentials never calls Meta', async () => {
  delete process.env.IG_LONG_TOKEN;
  assert.equal((await GET(request())).status, 503);
  assert.equal(calls.length, 0);
});
test('retains provider end times separately from requested range', async () => {
  globalThis.fetch = async url => Response.json(String(url).includes('/insights')
    ? { data: [{ name: 'reach', values: [{value: 5, end_time: '2026-10-06T07:00:00+0000'}] }] }
    : { id: 'test-account' });
  const body = await (await GET(request('?since=1791176400&until=1791262800'))).json();
  assert.deepEqual(body.measurement_window.provider_end_times, ['2026-10-06T07:00:00+0000']);
});
test('upstream errors remain sanitized', async () => {
  globalThis.fetch = async () => Response.json({error: {code: 100, message: 'test-meta'}}, {status:400});
  const response = await GET(request('?since=1&until=2'));
  assert.equal(response.status, 502);
  assert.equal((await response.text()).includes('test-meta'), false);
});
