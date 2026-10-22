import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { preparePublicSnapshot } from './public-rag.mjs';
const commit='a'.repeat(40), path='synthetic/public.md';
const passage={text:'Aurora synthetic evidence',section_or_record_locator:'synthetic section',source_path:path,
  source_url:'https://github.com/mariicuadros/aio-code-knowledge/blob/'+commit+'/'+path,
  commit_sha:commit,visibility:'public',canonical_or_historical:'canonical_current'};
async function make(change=p=>p) {
  const m=JSON.stringify({allowlist:[{path,visibility:'public'}]}),i=JSON.stringify({source_commit:commit,passages:[change({...passage})]});
  const digest=s=>createHash('sha256').update(s).digest('hex');
  return preparePublicSnapshot(m,i,{index_source_commit:commit,manifest_sha256_lf:digest(m),index_sha256_lf:digest(i)});
}
test('public retrieval preserves provenance, is detached and bounded',async()=>{
  const r=await make();const a=r.search('Aurora');assert.equal(a.length,1);assert.equal(a[0].passage_hash.length,64);
  a[0].text='changed';assert.equal(r.search('Aurora')[0].text,passage.text);
  assert.throws(()=>r.search('a'.repeat(501)));assert.throws(()=>r.search('Aurora',6));
});
for(const [name,change] of [
  ['private',p=>({...p,visibility:'private'})],['unknown source',p=>({...p,source_path:'vault/document'})],
  ['different commit',p=>({...p,commit_sha:'b'.repeat(40)})],['external URL',p=>({...p,source_url:'https://example.invalid/'})]
]) test('RAG rejects '+name,async()=>{await assert.rejects(make(change));});
test('RAG does not mix historical or unknown with current',async()=>{
  for(const state of ['historical','superseded','unknown']) {
    const r=await make(p=>({...p,canonical_or_historical:state}));assert.equal(r.count,0);
  }
});
test('RAG rejects unpinned bytes',async()=>{
  await assert.rejects(preparePublicSnapshot('{}','{}',{manifest_sha256_lf:'bad',index_sha256_lf:'bad'}),/snapshot_hash_mismatch/);
});
