import test from 'node:test';
import assert from 'node:assert/strict';
import { createOrchestrator } from './orchestrator.mjs';
import { mockAdapters, createMockAdapter } from './mock-adapter.mjs';
import { demoRequest } from './fixtures.mjs';
import { ROLES, hash } from './protocol.mjs';
const run = (options, request=demoRequest) => createOrchestrator(options).run(request);
const altered = (role, change) => {
  const adapters=mockAdapters(), original=adapters[role];
  adapters[role]={...original, async generate(task,context) {return change(await original.generate(task,context),task,context);}};
  return adapters;
};
test('four coordinated roles, reproducible trace, no authority or external cost', async () => {
  const a=await run(), b=await run(); assert.deepEqual(a,b); assert.equal(a.complete,true);
  assert.deepEqual(a.trace.map(t=>t.role),ROLES); assert.equal(a.usage.mock_calls,4);
  assert.equal(a.usage.provider_calls,0); assert.equal(a.usage.api_cost_usd,0);
  assert.equal(a.policy.canonical_entity_id,null); assert.equal(a.policy.link_canonical,false);
  assert.equal(a.policy.publication,'not_authorized'); assert.equal(a.policy.rights,'not_granted');
  const {approval,...content}=a; assert.equal(approval.content_hash,await hash(content));
});
test('swap a specialist without changing orchestrator',async()=>{
  const adapters=mockAdapters(); adapters.creative=createMockAdapter('creative','questions');
  const a=await run(),b=await run({adapters});
  assert.equal(b.outputs.creative.recommendation,'draft_questions');
  assert.notEqual(a.approval.content_hash,b.approval.content_hash);
});
test('contradictory sources remain attributed, never resolved by voting',async()=>{
  const a=await run(); assert.deepEqual(a.conflicts[0].values,['2024','2025']);
  assert.deepEqual(a.conflicts[0].source_ids,['SYN-SRC-01','SYN-SRC-02']);
  assert.ok(a.sources.every(s=>s.hash.length===64&&s.uri.startsWith('https://example.invalid/')));
});
test('homonyms do not become evidence for the selected subject',async()=>{
  const r=await run({}, {...demoRequest,fixture_id:'homonym'});
  assert.equal(r.claims.length,1); assert.equal(r.conflicts.length,0);
  assert.ok(!r.claims.some(c=>c.source_id==='SYN-SRC-03'));
});
test('source injection remains data and cannot grant privileges',async()=>{
  const r=await run({}, {...demoRequest,fixture_id:'injection'});
  assert.equal(r.complete,true); assert.equal(r.policy.link_canonical,false);
  assert.equal(r.outputs.governance.recommendation,'document_review_only');
  assert.ok(!JSON.stringify(r).includes('Ignore previous instructions'));
});
test('private fixture is rejected before any adapter sees it',async()=>{
  let calls=0; const adapters=mockAdapters();
  for(const role of ROLES) adapters[role]={...adapters[role],generate(){calls++;throw Error('must not run');}};
  const r=await run({adapters},{...demoRequest,fixture_id:'private'});
  assert.equal(calls,0); assert.equal(r.complete,false); assert.equal(r.errors[0].code,'private_input');
  assert.ok(!JSON.stringify(r).includes('CANARY')); assert.deepEqual(r.sources,[]);
});
for(const [label,change,code] of [
  ['invented citation',o=>{o.claims[0].source_id='SYN-SRC-404';return o;},'unknown_source'],
  ['wrong identity',o=>{o.claims[0].subject='SYN-SUBJECT-B';return o;},'identity_mismatch'],
  ['unsupported fact',o=>{o.claims[0].value='2030';return o;},'unsupported_claim'],
  ['hidden contradiction',o=>{o.claims.pop();return o;},'incomplete_evidence'],
  ['duplicate citation',o=>{o.claims.push(o.claims[0]);return o;},'duplicate_claim'],
  ['private output field',o=>({...o,private_document:'synthetic secret'}),'invalid_contract'],
  ['provider instructions',o=>({...o,recommendation:'link_canonical'}),'forbidden_recommendation'],
  ['invalid accounting',o=>({...o,usage:{kind:'simulated',output_tokens:Infinity}}),'invalid_contract'],
  ['foreign version',o=>({...o,version:'provider/v2'}),'invalid_contract']
]) test(label+' fails closed',async()=>{
  const r=await run({adapters:altered('research',change)});
  assert.equal(r.complete,false); assert.equal(r.errors[0].code,code); assert.equal(r.usage.mock_calls,1);
});
for(const action of ['grant_rights','certify_compliance','approve_contract','assign_canonical_id','publish'])
  test('document governance denies '+action,async()=>{
    const r=await run({adapters:altered('governance',o=>({...o,recommendation:action}))});
    assert.equal(r.complete,false); assert.equal(r.errors.at(-1).code,'forbidden_recommendation');
  });
for(const bad of [{...demoRequest,text:'customer input'}, {...demoRequest,fixture_id:'real-customer'},
  {...demoRequest,revision:NaN}, {...demoRequest,request_id:'client-123'}])
  test('closed input rejects '+JSON.stringify(bad),async()=>{await assert.rejects(run({},bad));});
test('provider mode and invalid budgets rejected before dispatch',()=>{
  const adapters=mockAdapters(); adapters.research={...adapters.research,mode:'live'};
  assert.throws(()=>createOrchestrator({adapters}));
  for(const limits of [{max_calls:Infinity},{max_attempts:4},{timeout_ms:0},{api_key:'fake'}])
    assert.throws(()=>createOrchestrator({limits}));
});
test('budget exhaustion before dispatch and between roles',async()=>{
  const a=await run({limits:{max_tokens:1}}); assert.equal(a.usage.mock_calls,0);
  const b=await run({limits:{max_calls:1}}); assert.equal(b.usage.mock_calls,1);
  assert.equal(b.complete,false); assert.equal(b.errors.at(-1).code,'budget_exhausted');
});
test('transient retry is bounded, attributed and conservatively charged',async()=>{
  let n=0; const adapters=mockAdapters(), original=adapters.research;
  adapters.research={...original,generate(t,c){if(++n===1)throw {code:'transient'};return original.generate(t,c);}};
  const r=await run({adapters}); assert.equal(r.complete,true); assert.equal(n,2);
  assert.equal(r.usage.mock_calls,5); assert.equal(r.errors[0].code,'transient');
  assert.equal(r.usage.reserved_tokens,r.trace.reduce((n,t)=>n+t.reserved_tokens,0));
});
test('retries cannot bypass budget; unknown error text is never exposed',async()=>{
  const adapters=mockAdapters(); adapters.research={...adapters.research,generate(){throw {code:'transient'};}};
  const r=await run({adapters,limits:{max_calls:1}});
  assert.equal(r.errors.at(-1).code,'budget_exhausted'); assert.equal(r.usage.mock_calls,1);
  adapters.research={...adapters.research,generate(){throw Error('SYNTHETIC SECRET');}};
  const s=await run({adapters}); assert.equal(s.usage.mock_calls,1);
  assert.ok(!JSON.stringify(s).includes('SECRET')); assert.equal(s.errors[0].code,'adapter_error');
});
test('timeouts abort, stop retrying, and ignore late completion',async()=>{
  let signals=[], resolve; const adapters=mockAdapters();
  adapters.research={...adapters.research,generate(t,{signal}){signals.push(signal);return new Promise(r=>{resolve=r;});}};
  const r=await run({adapters,limits:{timeout_ms:5}}), before=structuredClone(r);
  assert.equal(r.usage.mock_calls,2); assert.ok(signals.every(s=>s.aborted));
  resolve({injected:'late'}); await new Promise(r=>setTimeout(r,10)); assert.deepEqual(r,before);
});
test('cancelled runs cannot be approved',async()=>{
  const engine=createOrchestrator(), c=new AbortController(); c.abort();
  const r=await engine.run(demoRequest,{signal:c.signal}); assert.equal(r.usage.mock_calls,0);
  assert.throws(()=>engine.approve(r.approval,{humanConfirmed:true}));
});
test('human approval binds entity/revision/action/content and is one-use',async()=>{
  const engine=createOrchestrator(), r=await engine.run(demoRequest);
  assert.throws(()=>engine.approve(r.approval));
  for(const key of ['entity','revision','action','content_hash','request_id'])
    assert.throws(()=>engine.approve({...r.approval,[key]:'changed'},{humanConfirmed:true}));
  const receipt=engine.approve(r.approval,{humanConfirmed:true});
  assert.equal(receipt.publication,'not_authorized');
  assert.throws(()=>engine.approve(r.approval,{humanConfirmed:true}));
});
test('revision changes and explicit invalidation revoke old review',async()=>{
  const engine=createOrchestrator(), a=await engine.run(demoRequest);
  await assert.rejects(engine.run(demoRequest),/stale_revision/);
  const b=await engine.run({...demoRequest,revision:2,fixture_id:'normal'});
  assert.throws(()=>engine.approve(a.approval,{humanConfirmed:true}));
  engine.invalidate(demoRequest.request_id);
  assert.throws(()=>engine.approve(b.approval,{humanConfirmed:true}));
  await engine.run({...demoRequest,revision:3,fixture_id:'private'});
  assert.throws(()=>engine.approve(b.approval,{humanConfirmed:true}));
});
test('returned objects cannot mutate internal approval record',async()=>{
  const engine=createOrchestrator(), r=await engine.run(demoRequest), binding=structuredClone(r.approval);
  r.approval.action='publish';r.policy.publication='authorized';
  assert.throws(()=>engine.approve(r.approval,{humanConfirmed:true}));
  assert.equal(engine.approve(binding,{humanConfirmed:true}).publication,'not_authorized');
});
test('one run at a time, and adapters cannot mutate shared context',async()=>{
  const adapters=altered('research',(o,t)=>{assert.throws(()=>{t.fixture.subject='changed';});return o;});
  const engine=createOrchestrator({adapters}); const pending=engine.run(demoRequest);
  await assert.rejects(engine.run({...demoRequest,revision:2}),/run_in_progress/);
  assert.equal((await pending).complete,true);
});
