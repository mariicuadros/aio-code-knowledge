import test from 'node:test';
import assert from 'node:assert/strict';
import { proposeCanonicalId } from '../lib/canonical-id-allocation.mjs';

const sample=()=>({cases:[],events:[],reservations:[]});
test('candidate selection does not mutate snapshot or reserve ID',()=>{
  const snapshot=sample(),blocked=new Set(['MC-001']);
  const result=proposeCanonicalId(snapshot,'MC',blocked);
  assert.equal(result.candidate,'MC-002');
  assert.equal(result.reserved,false);
  assert.equal(result.authority,'none');
  assert.deepEqual(snapshot,sample());
  assert.deepEqual([...blocked],['MC-001']);
  assert.ok(Object.isFrozen(result));
});
test('selection protects current, archived, historical and withdrawn IDs',()=>{
  const snapshot={cases:[
    {status:'archived',data:{canonicalEntityId:'SER-001'}},
    {status:'active',data:{canonicalEntityId:'SER-004'}},
    {status:'current',data:{canonicalEntityId:null}}],
    events:[{status:'withdrawn',canonical_id:'SER-002'}],
    reservations:['SER-003']};
  assert.equal(proposeCanonicalId(snapshot,'SER',new Set()).candidate,'SER-005');
});
test('gaps can be used only when not occupied by any recorded history',()=>{
  const snapshot={cases:[],events:[{canonical_id:'UGE-002'}],reservations:['UGE-001']};
  assert.equal(proposeCanonicalId(snapshot,'UGE',new Set(['UGE-004'])).candidate,'UGE-003');
});
test('invalid or incomplete snapshots fail closed',()=>{
  for(const snapshot of [null,{}, {cases:[],events:[]},
    {cases:[{}],events:[],reservations:[]},
    {cases:[],events:[{}],reservations:[]},
    {cases:[],events:[],reservations:['not-an-id']}]) {
    assert.throws(()=>proposeCanonicalId(snapshot,'SER',new Set()),{code:'registry_sources_invalid'});
  }
  for(const ns of ['ser','A','SER-','SER_TOO_LONG_123'])assert.throws(
    ()=>proposeCanonicalId(sample(),ns,new Set()),{code:'registry_invalid_contract'});
});
test('exhausted three digit namespace never wraps or replaces',()=>{
  const snapshot=sample();
  for(let i=1;i<=999;i++)snapshot.reservations.push('PILOT-'+String(i).padStart(3,'0'));
  assert.throws(()=>proposeCanonicalId(snapshot,'PILOT',new Set()),{code:'registry_namespace_exhausted'});
});
