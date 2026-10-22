import test from 'node:test';
import assert from 'node:assert/strict';
import {runDemo} from './orchestrator.mjs';
import {syntheticCase} from './fixtures.mjs';
const fresh=()=>structuredClone(syntheticCase);

test('one assistant coordinates four specialized steps',()=>{
  const result=runDemo(fresh());
  assert.deepEqual(result.trace.map(t=>t.role),['research','creative','governance','supervisor']);
  assert.deepEqual(Object.keys(result.specialists),['research','creative','governance']);
  assert.equal(result.human_review_required,true);
});
test('research retains provenance and reports conflicting synthetic evidence',()=>{
  const result=runDemo(fresh());
  assert.deepEqual(result.response.evidence_refs,['SYN-SRC-01','SYN-SRC-02']);
  assert.deepEqual(result.specialists.research.conflicts[0].values,['2024','2025']);
  assert.deepEqual(result.specialists.research.conflicts[0].source_ids,['SYN-SRC-01','SYN-SRC-02']);
});
test('demo produces no external model calls, cost, identifier, Vault or publication authority',()=>{
  const r=runDemo(fresh());
  assert.equal(r.api_cost_usd,0);
  assert.equal(r.provider_calls,0);
  assert.deepEqual(r.model_calls,[]);
  assert.equal(r.canonical_entity_id,null);
  assert.equal(r.publication,'not_authorized');
  assert.equal(r.specialists.governance.may_access_vault,false);
  assert.equal(r.specialists.governance.may_assign_id,false);
  assert.equal(r.specialists.governance.may_publish,false);
  assert.ok(Object.values(r.integrations).every(x=>x==='not_connected'));
});
test('strict synthetic allowlist rejects private fields, live URLs and operations',()=>{
  for(const input of [
    {...fresh(),case_id:'ENT-123'},
    {...fresh(),demo:false},
    {...fresh(),private_documents:['anything']},
    {...fresh(),canonical_entity_id:'SER-001'},
    {...fresh(),entity:{...fresh().entity,passport:'private'}},
    {...fresh(),sources:[{...fresh().sources[0],uri:'https://example.org/real'}]},
    {...fresh(),sources:[fresh().sources[0],fresh().sources[0]]},
    {...fresh(),sources:[]},
    {...fresh(),intent:'publish'}
  ])assert.throws(()=>runDemo(input),{code:'demo_invalid_input'});
});
test('mock roles produce stable, repeatable output without altering input',()=>{
  const input=fresh(),snapshot=structuredClone(input);
  assert.deepEqual(runDemo(input),runDemo(input));
  assert.deepEqual(input,snapshot);
});
test('content remains draft and governance never certifies legal rights',()=>{
  const r=runDemo(fresh());
  assert.equal(r.specialists.creative.status,'draft_only');
  assert.equal(r.specialists.governance.status,'human_review_required');
  assert.ok(r.specialists.governance.blockers.includes('public_consent_not_verified'));
  assert.match(r.specialists.governance.scope,/no asesoría legal/);
});
