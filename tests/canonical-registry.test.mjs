import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { hash } from '../lib/entity-domain.mjs';
import { EntityService } from '../lib/entity-service.mjs';
import { VaultStore } from '../lib/entity-store.mjs';
import { CanonicalRegistry } from '../lib/canonical-registry-service.mjs';
import { CanonicalRegistryVaultStore } from '../lib/canonical-registry-store.mjs';
import { validateCommand, validateHistory } from '../lib/canonical-registry-domain.mjs';
import { publicReleaseCandidate } from '../lib/entity-public-release-gate.mjs';
import { fixture, request, next, reviewed, approve } from './canonical-registry-fixtures.mjs';
const rejection=async(f,command,code,capability=f.capability(command))=>{
  const before=f.git.contents(),head=f.git.head;
  await assert.rejects(f.registry.change(command,capability),{code});
  assert.deepEqual(f.git.contents(),before);assert.equal(f.git.head,head);
};

test('versioned REQUEST → REVIEW → RESERVE → BIND → WITHDRAW is private, atomic and append-only',async t=>{
  const f=fixture(t),original=f.git.addCase();let c=request(original),e=await f.run(c);
  assert.equal(e.status,'requested');assert.equal(e.canonical_id,null);
  c=next(c,e,'review',reviewed);e=await f.run(c);assert.equal(e.status,'approved');
  c=next(c,e,'reserve',{canonical_id:'DEMO-001'});e=await f.run(c);assert.equal(e.publication_authorized,false);
  const caseBefore=await new EntityService(new VaultStore('synthetic-read','')).get(original.id);assert.equal(caseBefore.version,1);assert.equal(caseBefore.data.canonicalEntityId,null);
  c=next(c,e,'bind');const oldFiles=f.git.contents();e=await f.run(c);
  assert.equal(e.status,'bound');const service=new EntityService(new VaultStore('synthetic-read',''));
  const bound=await service.get(original.id);assert.equal(bound.version,2);assert.equal(bound.data.canonicalEntityId,'DEMO-001');assert.equal(bound.status,'draft');assert.equal(bound.approvedVersion,null);assert.equal(bound.packageData,null);
  assert.throws(()=>publicReleaseCandidate(bound),{code:'public_release_requires_current_approval'});
  for(const [p,v] of Object.entries(oldFiles))assert.equal(f.git.contents()[p],v);
  c={...next(c,e,'withdraw'),case_revision:bound.version,case_hash:hash(bound.data)};e=await f.run(c);
  const withdrawn=await service.get(original.id);assert.equal(e.status,'withdrawn');assert.equal(withdrawn.status,'archived');assert.equal(withdrawn.data.canonicalEntityId,'DEMO-001');
  assert.equal(withdrawn.packageData,null);assert.equal(withdrawn.publicUrl,null);
  const all=f.git.contents();assert.ok(Object.keys(all).some(p=>p==='canonical-registrations/v1/ids/DEMO-001.json'));
  assert.equal(Object.keys(all).filter(p=>p.includes('/requests/')).length,5);
  assert.equal(Object.keys(all).filter(p=>p.startsWith('entity-console/')).length,3);
  for(const p of Object.keys(all))assert.match(p,/^(canonical-registrations\/v1\/|entity-console\/v1\/)/);
  const history=Object.entries(all).filter(([p])=>p.includes('/requests/')).map(([,raw])=>JSON.parse(raw));validateHistory(history);
  assert.equal(history.at(-1).actor.subject,'synthetic-registrar');assert.equal(history.at(-1).publication_authorized,false);
});

test('ordinary admin token, absent/forged/expired/wrong-scope capabilities fail before any private read',async t=>{
  const f=fixture(t),c=request(f.git.addCase());let reads=0;globalThis.fetch=async()=>{reads++;throw Error('No read permitted');};
  const bad=['ordinary-dashboard-token',undefined,f.capability(c,{expires_at:0}),f.capability(c,{audience:'wrong'}),f.capability(c,{scope:'canonical:bind'}),f.capability(c,{issued_at:Math.floor(Date.now()/1000)+100}),f.capability(c,{role:'registrar'}),f.capability(c)+'bad'];
  for(const token of bad)await assert.rejects(f.registry.change(c,token),{code:'registry_forbidden'});
  assert.equal(reads,0);
  assert.throws(()=>new CanonicalRegistry(),{code:'registry_authority_unconfigured'});
});

test('operator cannot review, reserve, bind or withdraw; requester cannot self-review',async t=>{
  const f=fixture(t),c=request(f.git.addCase()),e=await f.run(c);
  for(const action of ['review','reserve','bind','withdraw']) {
    const cmd=next(c,e,action,action==='review'?reviewed:action==='reserve'?{canonical_id:'DEMO-001'}:{});
    await rejection(f,cmd,'registry_forbidden',f.capability(cmd,{role:'operator',subject:'synthetic-operator'}));
  }
  const review=next(c,e,'review',reviewed);
  await rejection(f,review,'registry_independent_review_required',f.capability(review,{subject:'synthetic-operator'}));
});

test('missing evidence, unreviewed homonyms/rights and name mismatch cannot be approved',async t=>{
  const f=fixture(t),c=request(f.git.addCase());
  await rejection(f,{...c,payload:{...c.payload,name:'Different fictitious identity'}},'registry_case_mismatch');
  await rejection(f,{...c,payload:{...c.payload,evidence_refs_private:[]}},'registry_invalid_contract');
  const e=await f.run(c);
  for(const key of ['identity_checked','sources_checked','homonyms_resolved','rights_authorized'])await rejection(f,next(c,e,'review',{...reviewed,[key]:false}),'registry_review_incomplete');
  await rejection(f,next(c,e,'reserve',{canonical_id:'DEMO-001'}),'registry_review_required');
  await rejection(f,next(c,e,'bind'),'registry_invalid_transition');
});

test('rejected human review is audited, cannot reserve, and can be withdrawn',async t=>{
  const f=fixture(t),c=request(f.git.addCase()),e=await f.run(c);
  const cmd=next(c,e,'review',{...reviewed,decision:'rejected',homonyms_resolved:false});const rejected=await f.run(cmd);
  assert.equal(rejected.status,'rejected');await rejection(f,next(cmd,rejected,'reserve',{canonical_id:'DEMO-001'}),'registry_review_required');
  assert.equal((await f.run(next(cmd,rejected,'withdraw'))).status,'withdrawn');
});

test('stale registry version, stale case revision/hash and wrong case fail without mutations',async t=>{
  const f=fixture(t),original=f.git.addCase(),c=request(original),e=await f.run(c);
  await rejection(f,{...next(c,e,'review',reviewed),expected_version:0},'registry_revision_conflict');
  await rejection(f,{...next(c,e,'review',reviewed),case_hash:'0'.repeat(64)},'registry_case_revision_conflict');
  await rejection(f,{...next(c,e,'review',reviewed),case_id:'ENT-'+randomUUID()},'registry_case_mismatch');
  f.git.addCase({...original,version:2,data:{...original.data,description:'Edited after request'}});
  await rejection(f,next(c,e,'review',reviewed),'registry_case_revision_conflict');
});

test('identical retries across independent instances are idempotent; changed key payload rejected',async t=>{
  const f=fixture(t),c=request(f.git.addCase()),e=await f.run(c),head=f.git.head;
  assert.deepEqual(await f.makeRegistry().change(c,f.capability(c)),e);assert.equal(f.git.head,head);
  await rejection(f,{...c,reason:'Changed reason'},'registry_idempotency_conflict');
  await rejection(f,c,'registry_idempotency_conflict',f.capability(c,{subject:'another-operator'}));
});

test('two concurrent reservations across instances yield one winner, never displacement',async t=>{
  const f=fixture(t),a=await approve(f,request(f.git.addCase())),b=await approve(f,request(f.git.addCase()));
  const ca=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),cb=next(b.command,b.event,'reserve',{canonical_id:'DEMO-001'});
  const results=await Promise.allSettled([f.registry.change(ca,f.capability(ca)),f.makeRegistry().change(cb,f.capability(cb))]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.code,'registry_id_unavailable');
  const snapshot=await new CanonicalRegistryVaultStore({readToken:'synthetic-read',writeToken:'synthetic-write'}).snapshot({entries:f.git.entries()});
  assert.equal(snapshot.events.filter(e=>e.action==='reserve').length,1);assert.deepEqual(snapshot.reservations,['DEMO-001']);
});

test('simultaneous identical reservation retries commit a single event',async t=>{
  const f=fixture(t),a=await approve(f,request(f.git.addCase())),c=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'});
  const result=await Promise.all([f.run(c),f.makeRegistry().change(c,f.capability(c))]);assert.deepEqual(result[0],result[1]);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.includes('/requests/')&&p.endsWith('/00000003.json')).length,1);
});

test('all graph/target IDs are unavailable; MC/AIO/DAN cannot be reassigned',async t=>{
  const f=fixture(t),a=await approve(f,request(f.git.addCase()));
  for(const id of ['MC-001','AIO-001','DAN-001']) {
    const separate=await approve(f,request(f.git.addCase(),{payload:{name:'SYNTHETIC ENTITY',type:'organization',namespace:id.split('-')[0],evidence_refs_private:['synthetic-private-evidence/core-negative']}}));
    await rejection(f,next(separate.command,separate.event,'reserve',{canonical_id:id}),'registry_id_unavailable');
  }
});

test('historical archived links and withdrawn reservations are never recycled',async t=>{
  const f=fixture(t);f.git.addCase({status:'archived',data:{canonicalEntityId:'DEMO-009'}});
  const a=await approve(f,request(f.git.addCase()));
  await rejection(f,next(a.command,a.event,'reserve',{canonical_id:'DEMO-009'}),'registry_id_unavailable');
  let c=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),e=await f.run(c);e=await f.run(next(c,e,'withdraw'));
  const b=await approve(f,request(f.git.addCase()));await rejection(f,next(b.command,b.event,'reserve',{canonical_id:'DEMO-001'}),'registry_id_unavailable');
});

test('CAS conflict rechecks case revision before binding and never half-binds',async t=>{
  const f=fixture(t),original=f.git.addCase(),a=await approve(f,request(original));
  let c=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),e=await f.run(c);c=next(c,e,'bind');
  f.git.beforeRef=async()=>{f.git.addCase({...original,version:2,data:{...original.data,description:'Concurrent ordinary edit'}});};
  await assert.rejects(f.run(c),{code:'registry_case_revision_conflict'});
  const contents=f.git.contents();assert.equal(Object.keys(contents).filter(p=>p.includes('/requests/')&&p.endsWith('/00000004.json')).length,0);
  const cases=Object.entries(contents).filter(([p])=>p.startsWith('entity-console/')).map(([,v])=>JSON.parse(v));assert.ok(cases.every(r=>r.data.canonicalEntityId===null));
});

test('provider failure before CAS leaves active tree intact; lost acknowledgement recovers once',async t=>{
  const f=fixture(t),c=request(f.git.addCase());f.git.failRef='before';await rejection(f,c,'registry_provider_unavailable');
  f.git.failRef='after';const e=await f.run(c);assert.equal(e.status,'requested');assert.equal(f.git.refWrites,1);
  f.git.failRef=null;assert.deepEqual(await f.run(c),e);assert.equal(f.git.refWrites,1);
});

test('private repository requirement and corrupt historical chains fail closed',async t=>{
  const f=fixture(t),c=request(f.git.addCase());f.git.private=false;await rejection(f,c,'registry_provider_unavailable');f.git.private=true;
  const e=await f.run(c);assert.throws(()=>validateHistory([{...e,previous_hash:'broken'}]),{code:'registry_history_invalid'});
  f.git.seed('canonical-registrations/v1/requests/'+c.request_id+'/00000002.json',{...e,version:2,previous_hash:'broken'});
  await rejection(f,next(c,e,'review',reviewed),'registry_history_invalid');
});

test('PR A ordinary routes remain unable to allocate after registry bind',async t=>{
  const f=fixture(t),original=f.git.addCase(),service=new EntityService(new VaultStore('synthetic-read','synthetic-write'));
  const before=f.git.contents();await assert.rejects(service.change({action:'create',key:randomUUID(),body:{data:{...original.data,canonicalEntityId:'DEMO-001'}}}),{code:'invalid_canonical_link'});assert.deepEqual(f.git.contents(),before);
  const a=await approve(f,request(original));let c=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),e=await f.run(c);await f.run(next(c,e,'bind'));
  const bound=await service.get(original.id),head=f.git.head;
  await assert.rejects(service.change({id:bound.id,action:'edit',key:randomUUID(),body:{expectedVersion:bound.version,data:{...bound.data,canonicalEntityId:null}}}),{code:'invalid_canonical_link'});assert.equal(f.git.head,head);
  const edited=await service.change({id:bound.id,action:'edit',key:randomUUID(),body:{expectedVersion:bound.version,data:{...bound.data,description:'Legitimate private edit'}}});assert.equal(edited.data.canonicalEntityId,'DEMO-001');
});

test('private registry code/data has no public route or static/export/RAG allowlist exposure',async()=>{
  const manifest=JSON.parse(await readFile(new URL('../public-site-manifest.json',import.meta.url)));
  assert.ok(manifest.files.every(p=>!p.includes('canonical-registry')&&!p.startsWith('canonical-registrations/')));
  for(const path of ['api/entities.mjs','rag/corpus-manifest-v0.json','data-export/export-manifest.json']) {
    const text=await readFile(new URL('../'+path,import.meta.url),'utf8');assert.equal(text.includes('canonical-registrations/'),false);assert.equal(text.includes('canonical-registry'),false);
  }
  assert.throws(()=>validateCommand({schema_version:2}),{code:'registry_invalid_contract'});
});


test('exhausted CAS conflicts never advance the active tree or create a decision',async t=>{
  const f=fixture(t),c=request(f.git.addCase());f.git.failRef='conflict';
  await rejection(f,c,'registry_provider_unavailable');assert.equal(f.git.treeWrites,3);assert.equal(f.git.refWrites,0);
});

test('two IDs cannot reserve the same case via concurrent requests',async t=>{
  const f=fixture(t),record=f.git.addCase();
  const a=await approve(f,request(record)),b=await approve(f,request(record));
  const ca=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),cb=next(b.command,b.event,'reserve',{canonical_id:'DEMO-002'});
  const result=await Promise.allSettled([f.run(ca),f.makeRegistry().change(cb,f.capability(cb))]);
  assert.equal(result.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(result.find(x=>x.status==='rejected').reason.code,'registry_case_already_linked');
});

test('withdrawn identities remain unavailable after bind and ordinary archive; privacy preserved',async t=>{
  const f=fixture(t),original=f.git.addCase(),a=await approve(f,request(original));
  let c=next(a.command,a.event,'reserve',{canonical_id:'DEMO-001'}),e=await f.run(c);c=next(c,e,'bind');e=await f.run(c);
  const service=new EntityService(new VaultStore('synthetic-read','synthetic-write'));let r=await service.get(original.id);
  r=await service.change({id:r.id,action:'archive',key:randomUUID(),body:{expectedVersion:r.version}});
  await f.run({...next(c,e,'withdraw'),case_revision:r.version,case_hash:hash(r.data)});
  const other=await approve(f,request(f.git.addCase()));await rejection(f,next(other.command,other.event,'reserve',{canonical_id:'DEMO-001'}),'registry_id_unavailable');
  assert.equal((await service.get(original.id)).data.rightsHolder,'PRIVATE HOLDER CANARY');
});
