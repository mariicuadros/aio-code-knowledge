/** Verify shared retrieval, casing invariance and pageview privacy without live calls. */
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';
import { createRetriever } from '../rag/retriever.mjs';
const read = path => readFileSync(new URL('../'+path, import.meta.url),'utf8');
const index=JSON.parse(read('rag/public-index-v0.json'));
const retrieve=createRetriever(index.passages);
const cases=JSON.parse(read('rag/evaluation-v1.json')).cases;
let applicable=0;
for(const c of cases){
  const gold=c.gold_source_paths || c.gold_sources || [];
  if(!gold.length)continue;
  const hits=retrieve(c.question || c.query || c.prompt_text).map(p=>p.source_path);
  assert(gold.some(path=>hits.includes(path)), `Shared browser retrieval failed ${c.case_id}`);
  applicable++;
}
assert.equal(applicable,21);
assert.deepEqual(retrieve('¿Qué es AIO CODE?'),retrieve('¿Qué es aio code?'));
assert(read('rag/index.html').includes('createRetriever(data.passages)'));
assert(read('api/answer.mjs').includes('createRetriever(index.passages)'));
const analytics=read('assets/web-analytics.js');
const loaded=[],queue=[];
const sandbox={location:{hostname:'aio-code.vercel.app'},window:{va:(...args)=>queue.push(args)},URL,document:{createElement:()=>({}),head:{append:s=>loaded.push(s)}}};
runInNewContext(analytics,sandbox);
assert.equal(loaded.length,1);
assert.equal(loaded[0].src,'/_vercel/insights/script.js');
const before=queue.find(([name])=>name==='beforeSend')[1];
const event=before({type:'pageview',url:'https://aio-code.vercel.app/rag/?question=private#secret'});
assert.equal(event.url,'https://aio-code.vercel.app/rag/');
assert.equal(before({type:'event',url:'https://aio-code.vercel.app/',payload:{name:'question',data:{text:'private'}}}),null);
assert.equal(before({type:'pageview',url:'invalid'}),null);
runInNewContext(analytics,{location:{hostname:'preview.vercel.app'}});
for(const path of ['index.html','entities/marii-cuadros/index.html','entities/nux/index.html','rag/index.html','checker/index.html'])assert.equal(read(path).split('/assets/web-analytics.js').length-1,1);
console.log('Pre-content checks valid: shared source recall 21/21; name-case invariance; pageviews redact queries/fragments and reject custom data. No external calls.');
