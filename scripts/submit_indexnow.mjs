/**
 * Submit only URLs that were added, updated, or deleted after IndexNow adoption.
 * A successful HTTP 200 means the submission was accepted; it does not guarantee
 * crawling, indexing, ranking, AI retrieval, attribution, or citation.
 */
const endpoint = 'https://api.indexnow.org/indexnow';
const host = 'aio-code.vercel.app';
const key = '2000427ca5d64970a33991c02e493ab4';
const keyLocation = `https://${host}/${key}.txt`;

const rawArgs = process.argv.slice(2);
const dryRun = rawArgs.includes('--dry-run');
const inputs = rawArgs.filter((arg) => arg !== '--dry-run');

if (!inputs.length) {
  console.error('Usage: npm run indexnow -- [--dry-run] https://aio-code.vercel.app/path/');
  process.exit(2);
}
if (inputs.length > 10000) {
  console.error('IndexNow accepts at most 10,000 URLs per POST request.');
  process.exit(2);
}

const urlList = [...new Set(inputs)].map((value) => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== host) {
    throw new Error(`Only https://${host}/ URLs are allowed: ${value}`);
  }
  return url.href;
});

const payload = { host, key, keyLocation, urlList };

if (dryRun) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    mode: 'dry-run',
    endpoint,
    ...payload
  }, null, 2));
  process.exit(0);
}

const keyResponse = await fetch(keyLocation, { redirect: 'follow' });
const keyBody = (await keyResponse.text()).trim();
if (!keyResponse.ok || keyBody !== key) {
  throw new Error(`Public IndexNow key verification failed at ${keyLocation} (HTTP ${keyResponse.status}).`);
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload)
});
const responseBody = await response.text();

console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  endpoint,
  host,
  keyLocation,
  urlList,
  http_status: response.status,
  accepted: response.status === 200,
  response_body: responseBody || null,
  interpretation: response.status === 200
    ? 'Submission accepted by IndexNow; this is not proof of crawling or indexing.'
    : 'Submission not accepted; review the HTTP status before retrying.'
}, null, 2));

if (!response.ok) process.exitCode = 1;
