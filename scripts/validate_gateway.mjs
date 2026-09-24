import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { POST, retrieve } from '../api/answer.mjs';

const cases = JSON.parse(readFileSync(new URL('../rag/evaluation-v0.json', import.meta.url))).cases;
let count = 0;
for (const c of cases) {
  if (!c.gold_source_paths.length) continue;
  count++;
  assert(c.gold_source_paths.some(path => retrieve(c.query).some(s => s.source_path === path)), c.case_id);
}
assert.equal(count, 21);
delete process.env.AIO_RAG_ENABLED;
let res = await POST(new Request('http://localhost/api/answer', { method:'POST' }));
assert.equal(res.status, 503);
process.env.AIO_RAG_ENABLED = '1';
process.env.AIO_RAG_ADMIN_TOKEN = 'test-only-secret';
res = await POST(new Request('http://localhost/api/answer', { method:'POST' }));
assert.equal(res.status, 401);
console.log(`Gateway guardrails valid; source recall@5 ${count}/${count}. No model invocation.`);
