import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { LocalStore, VaultStore, configuredStore } from '../lib/entity-store.mjs';
import { EntityService } from '../lib/entity-service.mjs';
import { validateEntity, publicPackage, CANONICAL_IDS } from '../lib/entity-domain.mjs';
import { publicReleaseCandidate } from '../lib/entity-public-release-gate.mjs';
import { handle, GET } from '../api/entities.mjs';
const data=()=>({canonicalName:'Estudio Horizonte — FICTICIO',type:'organization',description:'Entidad ficticia para probar la consola; no representa a ningún cliente.',alternateNames:[],areas:['Diseño'],socials:[{platform:'Sitio de prueba',alias:'horizonte-demo',url:'https://example.com/social'}],officialUrls:['https://example.com'],location:'',locationAuthorized:false,relationships:[],claims:[],rightsHolder:'Titular ficticio privado',useAuthorized:true,lastReviewed:'2026-10-11',publicFields:['socials'],typeDetail:'Interno privado'});
async function setup(t) { const dir=await mkdtemp(join(tmpdir(),'aio-entity-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));const store=new LocalStore(dir);return {dir,store,service:new EntityService(store)}; }
const create=service=>service.change({action:'create',key:randomUUID(),body:{data:data()}});
const change=(service,r,action,extra={})=>service.change({id:r.id,action,key:randomUUID(),body:{expectedVersion:r.version,...extra}});
test('persistent private create/read survives a fresh store instance',async t=>{const {dir,service}=await setup(t);const r=await create(service);assert.equal(r.status,'draft');assert.match(r.id,/^ENT-/);assert.equal(CANONICAL_IDS.includes(r.id),false);assert.equal((await new EntityService(new LocalStore(dir)).get(r.id)).data.canonicalName,r.data.canonicalName);assert.equal(r.publicUrl,null);});
test('idempotency is persistent and rejects changed payload',async t=>{const {dir,service}=await setup(t);const key=randomUUID(),body={data:data()};const r=await service.change({action:'create',key,body});assert.equal((await new EntityService(new LocalStore(dir)).change({action:'create',key,body})).id,r.id);await assert.rejects(service.change({action:'create',key,body:{data:{...data(),description:'Cambio'}}}),{code:'idempotency_conflict'});assert.equal((await service.list()).length,1);});
// Fixture installation is deliberately outside ordinary service/store writes.
// It models an already persisted binding, never an assignment API or real Vault.
async function seedLinked(store,input) {
  const now='2026-10-11T12:00:00Z';
  const record={id:'ENT-'+randomUUID(),tenant:'admin-console',eventId:randomUUID(),version:1,
    createdAt:now,updatedAt:now,status:'draft',data:validateEntity(input),approvedVersion:null,
    approvedDataHash:null,packageData:null,publicUrl:null,operationKey:randomUUID(),operationHash:'fixture',activity:[]};
  await writeFile(join(store.directory,'event-'+record.eventId+'.json'),JSON.stringify(record),{flag:'wx'});
  return record;
}
test('ordinary create cannot grant canonical identities, including DAN and frozen core',async t=>{
  const {service,store}=await setup(t);
  for(const canonicalEntityId of ['DEMO-001','DAN-001',...CANONICAL_IDS]) {
    await assert.rejects(service.change({action:'create',key:randomUUID(),body:{data:{...data(),canonicalEntityId}}}),{code:'invalid_canonical_link'});
  }
  assert.equal((await store.all()).length,0);
  const first=await create(service);assert.equal(first.data.canonicalEntityId,null);
  assert.equal((await service.list()).length,1);
});
test('simultaneous ordinary assignments both fail without creating revisions',async t=>{
  const {service,store}=await setup(t);
  const entity={...data(),canonicalEntityId:'DEMO-002'};
  const results=await Promise.allSettled([1,2].map(()=>service.change({action:'create',key:randomUUID(),body:{data:entity}})));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,0);
  assert.equal(results.filter(r=>r.status==='rejected'&&r.reason.code==='invalid_canonical_link').length,2);
  assert.equal((await store.all()).length,0);
});
test('canonical export uses public ID and regenerates without losing approved source revision',async t=>{
  const {service,store}=await setup(t);
  const input={...data(),canonicalEntityId:'DAN-001'};
  let r=await seedLinked(store,input);
  r=await change(service,r,'validate');const approvedSource=r.version;
  r=await change(service,r,'approve');r=await change(service,r,'publish');
  const frozenHash=r.approvedDataHash;
  assert.equal(r.packageData.entity.id,'DAN-001');
  assert.equal(r.packageData.jsonld.identifier,'DAN-001');
  assert.equal(JSON.stringify(r.packageData).includes(r.id),false);
  r=await change(service,r,'refresh_package');
  assert.equal(r.status,'pending_deployment');
  assert.equal(r.approvedVersion,approvedSource);
  assert.equal(r.approvedDataHash,frozenHash);
  assert.equal(r.packageData.entity.id,'DAN-001');
  assert.equal(r.packageData.jsonld.identifier,'DAN-001');
  assert.equal(r.publicUrl,null);
  await assert.rejects(change(service,r,'refresh_package',{extra:'invalid'}),{code:'invalid_fields'});
});
test('known canonical Person URI requires reviewed explicit official page selection',()=>{
  const entity={id:'ENT-11111111-1111-4111-8111-111111111111',data:{...data(),
    canonicalEntityId:'DAN-001',canonicalName:'DANISAN',type:'person',
    officialUrls:['https://aio-code.vercel.app/entities/danisan/'],
    publicFields:['officialUrls','socials']}};
  const approved=publicPackage(entity);
  assert.equal(approved.entity.id,'DAN-001');
  assert.equal(approved.jsonld['@id'],'https://aio-code.vercel.app/entities/danisan/#DAN-001');
  assert.equal(approved.jsonld.identifier,'DAN-001');
  assert.equal(JSON.stringify(approved).includes(entity.id),false);
  assert.equal(publicPackage({...entity,data:{...entity.data,publicFields:[]}}).jsonld['@id'],undefined);
  assert.equal(publicPackage({...entity,data:{...entity.data,canonicalName:'IMPOSTOR'}}).jsonld['@id'],undefined);
  assert.equal(publicPackage({...entity,data:{...entity.data,canonicalEntityId:'DEMO-001'}}).jsonld['@id'],undefined);
});
test('approval is bound to exact revision; pending is private; editing revokes approval',async t=>{const {service}=await setup(t);let r=await create(service);await assert.rejects(change(service,r,'approve'),{code:'approval_requires_review_and_authorization'});await assert.rejects(change(service,r,'publish'),{code:'approval_required'});r=await change(service,r,'validate');const reviewed=r.version;r=await change(service,r,'approve');assert.equal(r.approvedVersion,reviewed);const hash=r.approvedDataHash;r=await change(service,r,'publish');assert.equal(r.status,'pending_deployment');assert.equal(r.publicUrl,null);assert.equal(r.approvedDataHash,hash);const exported=JSON.stringify(r.packageData);assert.equal(exported.includes('Titular ficticio privado'),false);assert.equal(exported.includes('Interno privado'),false);assert.equal(exported.includes('officialUrls'),false);assert.equal(r.packageData.jsonld['@type'],'Organization');r=await change(service,r,'edit',{data:data()});assert.equal(r.status,'draft');assert.equal(r.approvedVersion,null);assert.equal(r.packageData,null);assert.equal(r.activity.length,5);});
test('concurrent revision changes cannot silently overwrite each other',async t=>{const {service}=await setup(t);const r=await create(service);const attempts=await Promise.allSettled([change(service,r,'validate'),change(service,r,'edit',{data:data()})]);assert.equal(attempts.filter(v=>v.status==='fulfilled').length,1);assert.equal(attempts.find(v=>v.status==='rejected').reason.code,'revision_conflict');});
test('canonical IDs and unknown tenant fields cannot be supplied',async t=>{const {service}=await setup(t);for(const id of CANONICAL_IDS)await assert.rejects(service.get(id),{code:'not_found'});await assert.rejects(service.change({action:'create',key:randomUUID(),body:{data:data(),tenant:'other'}}),{code:'invalid_fields'});assert.throws(()=>validateEntity({...data(),id:'AIO-001'}),{code:'invalid_fields'});});
test('validation rejects private/malformed links, unauthorized location and verified claims',()=>{for(const url of ['javascript:alert(1)','http://example.com','https://127.0.0.1/a','https://user:pass@example.com','https://[::1]/'])assert.throws(()=>validateEntity({...data(),officialUrls:[url]}),{code:'invalid_url'});assert.throws(()=>validateEntity({...data(),location:'Bogotá'}),{code:'location_not_authorized'});assert.throws(()=>validateEntity({...data(),claims:[{claim_id:'X',claim_type:'canonical_definition',claim:'X',source:'X',source_ref:'X',evidence_refs:[],date:'2026-10-11',claim_status:'draft',evidence_state:'verified',verification_rule_id:null,verification_scope:null}]}),{code:'verified_claims_require_separate_review'});});
test('HTTP denies anonymous reads and writes before storage access',async()=>{let touched=false;const store={all(){touched=true;throw new Error('SHOULD_NOT_ACCESS');}};for(const method of ['GET','POST','PATCH']){const res=await handle(new Request('http://local/api/entities',{method}),store);assert.equal(res.status,401);}assert.equal(touched,false);});
test('HTTP structured errors, persistence read, size and media-type limits; no secrets in response',async t=>{const {store}=await setup(t);process.env.AIO_DASHBOARD_ADMIN_TOKEN='backend-secret-canary-test';const headers={'x-aio-admin-token':process.env.AIO_DASHBOARD_ADMIN_TOKEN,'content-type':'application/json','idempotency-key':randomUUID()};const post=await handle(new Request('http://local/api/entities',{method:'POST',headers,body:JSON.stringify({data:data()})}),store);assert.equal(post.status,201);const text=await post.text();assert.equal(text.includes(process.env.AIO_DASHBOARD_ADMIN_TOKEN),false);assert.equal(text.includes('operationHash'),false);const r=JSON.parse(text).data;const get=await handle(new Request('http://local/api/entities?id='+r.id,{headers}),store);assert.equal(get.status,200);assert.equal((await get.json()).data.id,r.id);const large=await handle(new Request('http://local/api/entities',{method:'POST',headers,body:'x'.repeat(40000)}),store);assert.equal(large.status,413);const malformed=await handle(new Request('http://local/api/entities',{method:'POST',headers,body:'{'}),store);assert.equal(malformed.status,400);const wrong=await handle(new Request('http://local/api/entities',{method:'POST',headers:{...headers,'content-type':'text/plain'},body:'x'}),store);assert.equal(wrong.status,415);const down=await handle(new Request('http://local/api/entities',{headers}),{all(){throw new Error('provider-secret-canary');}});assert.equal(down.status,503);assert.equal((await down.text()).includes('provider-secret-canary'),false);});

test('read failure diagnostics categorize provider outcomes without exposing secrets',async()=>{
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='diagnostic-test-secret';
  const req=()=>new Request('http://local/api/entities',{headers:{'x-aio-admin-token':'diagnostic-test-secret'}});
  const cases=[
    [{status:401,message:'SECRET-PROVIDER-BODY'},'vault_access_denied'],
    [{status:403,message:'SECRET-PROVIDER-BODY'},'vault_access_denied'],
    [{status:404,message:'SECRET-PROVIDER-BODY'},'vault_repository_unavailable'],
    [{status:429,message:'SECRET-PROVIDER-BODY'},'vault_provider_rate_limited'],
    [{status:502,message:'SECRET-PROVIDER-BODY'},'vault_provider_unavailable'],
    [new TypeError('SECRET-NETWORK-DATA'),'vault_read_failed'],
    [new Error('SECRET-UNKNOWN-DATA'),'vault_read_failed'],
  ];
  for(const [failure,expected] of cases){
    const response=await handle(req(),{all(){throw failure;}});
    assert.equal(response.status,503);
    const body=await response.text();
    assert.deepEqual(JSON.parse(body),{error:{code:expected}});
    assert.equal(body.includes('SECRET'),false);
  }
});
test('entity API handles relative Vercel request URLs without reading the vault',async()=>{
  const prior=process.env.AIO_DASHBOARD_ADMIN_TOKEN;
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='test-relative-request-secret';
  try {
    const request={url:'/api/entities',method:'GET',headers:new Headers({'x-aio-admin-token':'test-relative-request-secret'})};
    const store={async all(){return [];}};
    const response=await handle(request,store);
    assert.equal(response.status,200);
    assert.deepEqual((await response.json()).data,[]);
  } finally {
    if(prior===undefined)delete process.env.AIO_DASHBOARD_ADMIN_TOKEN;
    else process.env.AIO_DASHBOARD_ADMIN_TOKEN=prior;
  }
});
test('Vercel route context is never treated as the persistence store',async()=>{
  const previousAdmin=process.env.AIO_DASHBOARD_ADMIN_TOKEN;
  const previousRead=process.env.AIO_VAULT_READ_TOKEN;
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='route-context-test-admin';
  delete process.env.AIO_VAULT_READ_TOKEN;
  try {
    const request=new Request('https://example.test/api/entities',{headers:{'x-aio-admin-token':'route-context-test-admin'}});
    const response=await GET(request,{params:{path:[]},waitUntil(){}});
    assert.equal(response.status,503);
    assert.deepEqual(await response.json(),{error:{code:'vault_not_configured'}});
  } finally {
    if(previousAdmin===undefined)delete process.env.AIO_DASHBOARD_ADMIN_TOKEN;
    else process.env.AIO_DASHBOARD_ADMIN_TOKEN=previousAdmin;
    if(previousRead===undefined)delete process.env.AIO_VAULT_READ_TOKEN;
    else process.env.AIO_VAULT_READ_TOKEN=previousRead;
  }
});
test('vault read-stage diagnostics expose only a fixed stage without secrets',async t=>{
  const original=globalThis.fetch;
  t.after(()=>{globalThis.fetch=original;});
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='stage-test-admin';
  for(const [stage,breakAt] of [['repository',1],['branch',2],['commit',3],['tree',4]]) {
    let hits=0;
    globalThis.fetch=async()=>{
      hits++;
      if(hits===breakAt)throw new TypeError('PRIVATE-TOKEN-MUST-NOT-LEAK');
      if(hits===1)return Response.json({private:true});
      if(hits===2)return Response.json({object:{sha:'a'.repeat(40)}});
      if(hits===3)return Response.json({tree:{sha:'b'.repeat(40)}});
      return Response.json({tree:[],truncated:false});
    };
    const request=new Request('http://local/api/entities',{headers:{'x-aio-admin-token':'stage-test-admin'}});
    const response=await handle(request,new VaultStore('mock-read-token',''));
    assert.equal(response.status,503);
    const body=await response.text();
    assert.deepEqual(JSON.parse(body),{error:{code:'vault_'+stage+'_network_unavailable'}});
    assert.equal(body.includes('PRIVATE'),false);
  }
});
test('vault read diagnostics reject malformed tree and invalid JSON without leaking data',async t=>{
  const original=globalThis.fetch;
  t.after(()=>{globalThis.fetch=original;});
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='diagnostic-only-test-secret';
  const req=()=>new Request('http://local/api/entities',{headers:{'x-aio-admin-token':'diagnostic-only-test-secret'}});
  const sha='a'.repeat(40);
  let tree;
  globalThis.fetch=async(input)=>{
    const u=String(input);
    if(u.endsWith('/aio-code-vault'))return Response.json({private:true});
    if(u.includes('/git/ref/heads/main'))return Response.json({object:{sha}});
    if(u.includes('/git/commits/'))return Response.json({tree:{sha}});
    if(u.includes('/git/trees/'))return Response.json(tree);
    if(u.includes('/git/blobs/'))return Response.json({encoding:'base64',content:Buffer.from('PRIVATE INVALID JSON').toString('base64')});
    throw Error('Unexpected request');
  };
  tree={truncated:false,tree:undefined};
  let response=await handle(req(),new EntityService(new VaultStore('mock-read','')).store);
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:{code:'vault_read_failed'}});
  tree={truncated:false,tree:[{path:'entity-console/v1/ENT-'+ 'b'.repeat(8)+'-'+ 'b'.repeat(4)+'-'+ 'b'.repeat(4)+'-'+ 'b'.repeat(4)+'-'+ 'b'.repeat(12)+'/00000001.json',type:'blob',sha}]};
  response=await handle(req(),new VaultStore('mock-read',''));
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{error:{code:'vault_record_parse_failed'}});
});
test('review permits incomplete authorization but approval rejects it',async t=>{
  const {service}=await setup(t);
  const noConsent={...data(),useAuthorized:false,publicFields:[]};
  let r=await service.change({action:'create',key:randomUUID(),body:{data:noConsent}});
  r=await change(service,r,'validate');
  assert.equal(r.status,'review');
  await assert.rejects(change(service,r,'approve'),{code:'approval_requires_review_and_authorization'});
  const stored=await service.get(r.id);
  assert.equal(stored.status,'review');
  assert.equal(stored.approvedVersion,null);
  assert.equal(stored.publicUrl,null);
});
test('archive withdraws active approval and package',async t=>{const {service}=await setup(t);let r=await create(service);r=await change(service,r,'validate');r=await change(service,r,'approve');r=await change(service,r,'archive');assert.equal(r.status,'archived');assert.equal(r.approvedVersion,null);assert.equal(r.packageData,null);});
test('filesystem store refuses Vercel deployment',()=>{const saved={...process.env};process.env.AIO_ENTITY_STORE='local';process.env.AIO_ENTITY_LOCAL_ENABLED='1';process.env.VERCEL='1';try{assert.throws(()=>configuredStore(),{code:'local_store_forbidden'});}finally{process.env=saved;}});
test('vault adapter uses existing immutable client (MOCK GitHub, no remote writes)',async t=>{
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original;});const blobs=new Map(),commits=new Map(),trees=new Map();let head='a'.repeat(40),tree='b'.repeat(40);trees.set(tree,[]);commits.set(head,{tree:{sha:tree}});let serial=1;
  const sha=()=>createHash('sha1').update(String(serial++)).digest('hex');
  let isPrivate=true;
  globalThis.fetch=async(input,options={})=>{
    const path=new URL(input).pathname.replace('/repos/mariicuadros/aio-code-vault',''),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;let result;
    if(path==='')result={private:isPrivate};else if(path==='/git/ref/heads/main')result={object:{sha:head}};
    else if(path.startsWith('/git/commits/')&&method==='GET')result=commits.get(path.split('/').pop());
    else if(path.startsWith('/git/trees/')&&method==='GET')result={tree:trees.get(path.split('/').pop()),truncated:false};
    else if(path.startsWith('/git/blobs/'))result={encoding:'base64',content:Buffer.from(blobs.get(path.split('/').pop())).toString('base64')};
    else if(path==='/git/trees'&&method==='POST'){const entries=[...trees.get(body.base_tree)];for(const item of body.tree){const id=sha();blobs.set(id,item.content);entries.push({path:item.path,type:'blob',sha:id});}const id=sha();trees.set(id,entries);result={sha:id};}
    else if(path==='/git/commits'&&method==='POST'){const id=sha();commits.set(id,{tree:{sha:body.tree},parents:body.parents});result={sha:id};}
    else if(path==='/git/refs/heads/main'&&method==='PATCH'){assert.equal(body.force,false);assert.equal(commits.get(body.sha).parents[0],head);head=body.sha;result={};}else throw new Error('Unexpected mock operation: '+path);
    return Response.json(result);
  };
  const service=new EntityService(new VaultStore('mock-read','mock-write'));const r=await create(service);
  assert.equal((await new EntityService(new VaultStore('mock-read','mock-write')).get(r.id)).id,r.id);
  assert.ok(trees.get(commits.get(head).tree.sha).every(e=>e.path.startsWith('entity-console/v1/')));
  let next=await change(service,r,'validate');next=await change(service,next,'approve');next=await change(service,next,'publish');assert.equal(next.status,'pending_deployment');
  assert.equal((await service.get(r.id)).version,4);
  isPrivate=false;await assert.rejects(service.list(),/Vault must remain private/);
});
test('canonical graph retains founding entities and distinct case nodes; publication policy is safe',async()=>{
  const graph=JSON.parse(await readFile(new URL('../entity-graph.json',import.meta.url)));
  const ids=graph.nodes.map(n=>n.entity_id);
  assert.equal(new Set(ids).size,ids.length,'canonical graph must not duplicate entity IDs');
  for(const id of CANONICAL_IDS)assert.ok(ids.includes(id),'missing protected core entity '+id);
  assert.ok(ids.includes('DAN-001'),'registered collaborating model must remain a separate entity');
  const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url)));assert.equal(vercel.git.deploymentEnabled,false);
  const manifest=JSON.parse(await readFile(new URL('../public-site-manifest.json',import.meta.url)));assert.equal(manifest.files.some(p=>p.startsWith('entity-console/')||p.startsWith('.entity-test-data/')||p.startsWith('lib/entity-')),false);
});


test('DAN-001 can be a sourced relationship target, never a synthetic subsidiary or raw private citation in public export',()=>{
  const input={...data(),
    relationships:[{targetId:'DAN-001',relation:'declared_collaboration',sourceRef:'PRIVATE-ONLY-REFERENCE-DO-NOT-EXPORT'}],
    publicFields:['relationships']};
  const validated=validateEntity(input);
  assert.equal(validated.relationships[0].targetId,'DAN-001');
  const privateRecord={id:'ENT-11111111-1111-4111-8111-111111111111',data:validated};
  const publicData=publicPackage(privateRecord);
  assert.deepEqual(publicData.entity.relationships,[{targetId:'DAN-001',relation:'declared_collaboration'}]);
  assert.equal(JSON.stringify(publicData).includes('PRIVATE-ONLY-REFERENCE-DO-NOT-EXPORT'),false);
  assert.equal(JSON.stringify(publicData).includes('subsidiary'),false);
  assert.throws(()=>validateEntity({...data(),
    relationships:[{targetId:'DAN-002',relation:'unverified',sourceRef:'private'}]}),{code:'invalid_relationship'});
});


test('public package fails closed if a legacy record contains unapproved private field names',()=>{
  const source={...data(),
    canonicalEntityId:'DAN-001',
    rightsHolder:'PRIVATE_HOLDER_CANARY',
    typeDetail:'PRIVATE_TYPE_CANARY',
    claims:[],
    location:'Non-disclosed location',
    locationAuthorized:false,
    publicFields:['rightsHolder','claims','canonicalEntityId','typeDetail','location','operationKey','socials']};
  // Emulate reading a malformed old record that did not pass today's validator.
  const record={id:'ENT-11111111-1111-4111-8111-111111111111',data:source};
  const result=publicPackage(record);
  assert.deepEqual(Object.keys(result.entity).sort(),['canonicalName','description','id','socials','type'].sort());
  const published=JSON.stringify(result);
  for(const marker of ['PRIVATE_HOLDER_CANARY','PRIVATE_TYPE_CANARY','Non-disclosed location',record.id,'operationKey'])
    assert.equal(published.includes(marker),false,marker);
  assert.equal(result.entity.id,'DAN-001');
});


test('ordinary edits preserve prior bindings, including legacy omission and DAN compatibility',async t=>{
  const {service,store}=await setup(t);
  for(const canonicalEntityId of ['DEMO-001','DAN-001']) {
    let r=await seedLinked(store,{...data(),canonicalEntityId});
    r=await change(service,r,'validate');r=await change(service,r,'approve');
    const input={...r.data,description:'Updated synthetic description'};
    delete input.canonicalEntityId;
    const edited=await change(service,r,'edit',{data:input});
    assert.equal(edited.data.canonicalEntityId,canonicalEntityId);
    assert.equal(edited.status,'draft');assert.equal(edited.approvedVersion,null);
    assert.equal(r.data.canonicalEntityId,canonicalEntityId);
    const exact=await change(service,edited,'edit',{data:{...edited.data,areas:['Synthetic']}});
    assert.equal(exact.data.canonicalEntityId,canonicalEntityId);
    const archived=await change(service,exact,'archive');
    assert.equal(archived.data.canonicalEntityId,canonicalEntityId);
    assert.equal(archived.packageData,null);
  }
});
test('replacement, removal, acquisition and archived-ID appropriation leave zero new revisions',async t=>{
  const {service,store}=await setup(t);
  let linked=await seedLinked(store,{...data(),canonicalEntityId:'DAN-001'});
  const unlinked=await create(service);
  for(const [r,ids] of [[linked,[null,'DEMO-001']],[unlinked,['DAN-001','DEMO-001']]]) {
    for(const canonicalEntityId of ids) {
      const before=await store.all();
      await assert.rejects(change(service,r,'edit',{data:{...r.data,canonicalEntityId}}),{code:'invalid_canonical_link',status:409});
      assert.deepEqual(await store.all(),before);
    }
  }
  linked=await change(service,linked,'archive');
  const before=await store.all();
  await assert.rejects(change(service,unlinked,'edit',{data:{...unlinked.data,canonicalEntityId:'DAN-001'}}),{code:'invalid_canonical_link'});
  assert.deepEqual(await store.all(),before);
});
test('binding-preserving retries are idempotent and stale/changed retries cannot mutate',async t=>{
  const {service,store}=await setup(t);
  const r=await seedLinked(store,{...data(),canonicalEntityId:'DEMO-001'});
  const request={id:r.id,action:'edit',key:randomUUID(),body:{expectedVersion:r.version,data:{...r.data,description:'Synthetic edit'}}};
  const edited=await service.change(request);
  assert.deepEqual(await service.change(request),edited);
  const before=await store.all();
  await assert.rejects(service.change({...request,body:{...request.body,data:{...request.body.data,canonicalEntityId:null}}}),{code:'idempotency_conflict'});
  await assert.rejects(change(service,r,'edit',{data:r.data}),{code:'revision_conflict'});
  assert.deepEqual(await store.all(),before);
});
test('concurrent edits cannot assign an ID or displace a prior binding',async t=>{
  const {service,store}=await setup(t);
  const r=await seedLinked(store,{...data(),canonicalEntityId:'DEMO-001'});
  const result=await Promise.allSettled([
    change(service,r,'edit',{data:{...r.data,description:'Safe change'}}),
    change(service,r,'edit',{data:{...r.data,canonicalEntityId:'DEMO-002'}})]);
  assert.equal(result.filter(x=>x.status==='fulfilled').length,1);
  assert.equal(result.find(x=>x.status==='rejected').reason.code,'invalid_canonical_link');
  assert.equal((await store.all()).length,2);
  assert.equal((await service.get(r.id)).data.canonicalEntityId,'DEMO-001');
});
test('store boundary denies bypass appends for allocation and removal',async t=>{
  const {store}=await setup(t);
  const r=await seedLinked(store,{...data(),canonicalEntityId:'DEMO-001'});
  const next={...r,eventId:randomUUID(),version:2,operationKey:randomUUID(),data:{...r.data,canonicalEntityId:null}};
  await assert.rejects(store.append(next),{code:'invalid_canonical_link'});
  await assert.rejects(store.append({...next,id:'ENT-'+randomUUID(),version:1,data:r.data}),{code:'invalid_canonical_link'});
  assert.deepEqual(await store.all(),[r]);
});
test('historical unsafe idempotency replay cannot bypass the new allocation guard',async t=>{
  const {service,store}=await setup(t);
  const key=randomUUID(),body={data:{...data(),canonicalEntityId:'DEMO-001'}};
  const r=await seedLinked(store,body.data);
  const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
  r.operationKey=digest(['admin-console',key]);r.operationHash=digest({id:undefined,action:'create',body});
  await writeFile(join(store.directory,'event-'+r.eventId+'.json'),JSON.stringify(r));
  const before=await store.all();
  await assert.rejects(service.change({action:'create',key,body}),{code:'invalid_canonical_link'});
  assert.deepEqual(await store.all(),before);
});
test('authenticated HTTP administrator cannot mint or withdraw canonical links',async t=>{
  const {service,store}=await setup(t);
  const prior=process.env.AIO_DASHBOARD_ADMIN_TOKEN;
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='synthetic-canonical-guard-token';
  t.after(()=>{if(prior===undefined)delete process.env.AIO_DASHBOARD_ADMIN_TOKEN;else process.env.AIO_DASHBOARD_ADMIN_TOKEN=prior;});
  const r=await seedLinked(store,{...data(),canonicalEntityId:'DAN-001'});
  const send=(method,url,body)=>handle(new Request(url,{method,headers:{'x-aio-admin-token':process.env.AIO_DASHBOARD_ADMIN_TOKEN,'content-type':'application/json','idempotency-key':randomUUID()},body:JSON.stringify(body)}),store);
  const before=await store.all();
  for(const res of [await send('POST','http://local/api/entities',{data:{...data(),canonicalEntityId:'DAN-001'}}),
    await send('PATCH','http://local/api/entities?id='+r.id,{expectedVersion:r.version,data:{...r.data,canonicalEntityId:null}})]) {
    assert.equal(res.status,409);assert.deepEqual(await res.json(),{error:{code:'invalid_canonical_link'}});
  }
  assert.deepEqual(await store.all(),before);assert.equal((await service.get(r.id)).data.canonicalEntityId,'DAN-001');
});
test('homonyms, aliases and official URLs grant neither identity nor public release',async t=>{
  const {service}=await setup(t);
  const input={...data(),canonicalName:'DANISAN',type:'person',alternateNames:['DAN-001'],
    officialUrls:['https://aio-code.vercel.app/entities/danisan/'],publicFields:['officialUrls']};
  let r=await service.change({action:'create',key:randomUUID(),body:{data:input}});
  assert.equal(r.data.canonicalEntityId,null);assert.deepEqual(r.data.relationships,[]);
  r=await change(service,r,'validate');r=await change(service,r,'approve');r=await change(service,r,'publish');
  assert.equal(r.packageData.jsonld['@id'],undefined);
  assert.throws(()=>publicReleaseCandidate(r),{code:'public_release_requires_canonical_identity'});
  // This remains an authenticated private preview; there is no public publisher.
  assert.equal(r.publicUrl,null);
});

test('Vault optimistic retry rechecks the binding before any second commit (MOCK only)',async t=>{
  const {store:fixtures}=await setup(t);
  const prior=await seedLinked(fixtures,{...data(),canonicalEntityId:'DEMO-001'});
  const candidate={...prior,version:2,eventId:randomUUID(),operationKey:randomUUID(),data:{...prior.data,description:'Safe synthetic edit'}};
  const vault=new VaultStore('synthetic-read','synthetic-write');
  vault.all=async()=>[prior];
  let conflict=false,treeWrites=0,refWrites=0;
  vault.recordsFromSnapshot=async()=>[{...prior,data:{...prior.data,canonicalEntityId:conflict?'DEMO-002':'DEMO-001'}}];
  const original=globalThis.fetch;t.after(()=>{globalThis.fetch=original;});
  globalThis.fetch=async(input,options={})=>{
    const url=String(input),method=options.method||'GET';
    if(url.endsWith('/aio-code-vault'))return Response.json({private:true});
    if(url.includes('/git/ref/heads/main'))return Response.json({object:{sha:'a'.repeat(40)}});
    if(url.includes('/git/commits/')&&method==='GET')return Response.json({tree:{sha:'b'.repeat(40)}});
    if(url.includes('/git/trees/')&&method==='GET')return Response.json({tree:[],truncated:false});
    if(url.endsWith('/git/trees')&&method==='POST'){treeWrites++;return Response.json({sha:'c'.repeat(40)});}
    if(url.endsWith('/git/commits')&&method==='POST')return Response.json({sha:'d'.repeat(40)});
    if(url.endsWith('/git/refs/heads/main')&&method==='PATCH'){
      refWrites++;conflict=true;return Response.json({message:'synthetic race'},{status:409});
    }
    throw new Error('Unexpected mock request');
  };
  await assert.rejects(vault.append(candidate),{code:'invalid_canonical_link'});
  assert.equal(treeWrites,1);assert.equal(refWrites,1);
});

test('ordinary link_canonical is forbidden before reads, including historical keys and payload variants',async t=>{
  const prior=process.env.AIO_DASHBOARD_ADMIN_TOKEN;
  process.env.AIO_DASHBOARD_ADMIN_TOKEN='synthetic-denial-only';
  t.after(()=>{if(prior===undefined)delete process.env.AIO_DASHBOARD_ADMIN_TOKEN;else process.env.AIO_DASHBOARD_ADMIN_TOKEN=prior;});
  const store={all(){throw Error('Storage must not be accessed');},append(){throw Error('No write');}};
  for(const body of [{expectedVersion:1,canonicalEntityId:'DEMO-001'},{expectedVersion:1,role:'registrar',useAuthorized:true},{}]) {
    await assert.rejects(new EntityService(store).change({id:'ENT-'+randomUUID(),action:'link_canonical',key:randomUUID(),body}),{code:'canonical_registrar_required',status:403});
    for(const method of ['POST','PATCH']) {
      const response=await handle(new Request('http://local/api/entities?id=ENT-'+randomUUID()+'&action=link_canonical',{
        method,headers:{'x-aio-admin-token':'synthetic-denial-only','content-type':'application/json','idempotency-key':randomUUID()},body:JSON.stringify(body)
      }),store);
      assert.equal(response.status,403);
      assert.deepEqual(await response.json(),{error:{code:'canonical_registrar_required'}});
    }
  }
});

// All provider traffic is replaced by the in-memory Git implementation.
import { fixture as gitFixture } from './canonical-registry-fixtures.mjs';
import { hash } from '../lib/entity-domain.mjs';

test('unsafe historical edits and links cannot replay through service or either store',async t=>{
  const {store,service}=await setup(t);
  const f=gitFixture(t),source=f.git.addCase();
  await writeFile(join(store.directory,'event-'+source.eventId+'.json'),JSON.stringify(source));
  for(const action of ['edit','link_canonical']) {
    const key=randomUUID(),body=action==='edit'?{expectedVersion:1,data:{...source.data,canonicalEntityId:'DEMO-001'}}:{expectedVersion:1,canonicalEntityId:'DEMO-001'};
    const record={...source,version:2,eventId:randomUUID(),data:{...source.data,canonicalEntityId:'DEMO-001'},
      operationKey:hash(['admin-console',key]),operationHash:hash({id:source.id,action,body}),activity:[{action,version:2}]};
    await writeFile(join(store.directory,'event-'+record.eventId+'.json'),JSON.stringify(record));
    const before=await store.all();
    await assert.rejects(service.change({id:source.id,action,key,body}),{code:action==='link_canonical'?'canonical_registrar_required':'invalid_canonical_link'});
    await assert.rejects(store.append(record),{code:'invalid_canonical_link'});
    const vault=new VaultStore('synthetic-read','synthetic-write');vault.recordsFromSnapshot=async()=>[source,record];
    await assert.rejects(vault.append(record),{code:'invalid_canonical_link'});
    assert.deepEqual(await store.all(),before);
  }
  assert.equal(f.git.refWrites,0);
});

test('safe historical replay survives later revisions; absent predecessor and changed payload fail closed',async t=>{
  const {store,service}=await setup(t);gitFixture(t);let r=await create(service);
  const input={id:r.id,action:'edit',key:randomUUID(),body:{expectedVersion:1,data:{...r.data,description:'Synthetic edited'}}};
  const edited=await service.change(input);await change(service,edited,'archive');
  const before=await store.all();assert.deepEqual(await service.change(input),edited);
  assert.deepEqual(await store.append(edited),edited);
  const vault=new VaultStore('synthetic-read','synthetic-write');vault.recordsFromSnapshot=async()=>before;
  assert.deepEqual(await vault.append(edited),edited);
  vault.recordsFromSnapshot=async()=>[edited];await assert.rejects(vault.append(edited),{code:'invalid_canonical_link'});
  await assert.rejects(service.change({...input,body:{...input.body,data:{...input.body.data,description:'Changed'}}}),{code:'idempotency_conflict'});
  assert.deepEqual(await store.all(),before);
});

test('marker short-circuit and provider-error recovery recheck historical policy',async t=>{
  for(const recovery of [false,true]) await t.test(recovery?'lost response recovery':'marker shortcut',async t=>{
    const f=gitFixture(t),source=f.git.addCase();
    const candidate={...source,version:2,eventId:randomUUID(),operationKey:hash(randomUUID()),operationHash:hash('synthetic-operation'),activity:[{action:'edit',version:2}]};
    f.git.beforeRef=async()=>{
      f.git.addCase({...candidate,data:{...source.data,canonicalEntityId:'DEMO-001'}});
      f.git.seed('entity-console/v1/operations/'+candidate.operationKey+'.json',{hash:candidate.operationHash,id:source.id,version:2});
      if(recovery)throw Error('Synthetic lost response');
    };
    await assert.rejects(new VaultStore('synthetic-read','synthetic-write').append(candidate),{code:'invalid_canonical_link'});
    assert.equal(f.git.refWrites,0);
  });
});

test('safe lost acknowledgement resolves once without a second revision',async t=>{
  const f=gitFixture(t),source=f.git.addCase();f.git.failRef='after';
  const service=new EntityService(new VaultStore('synthetic-read','synthetic-write'));
  const input={id:source.id,action:'edit',key:randomUUID(),body:{expectedVersion:1,data:source.data}};
  const edited=await service.change(input);assert.equal(edited.version,2);assert.equal(f.git.refWrites,1);
  assert.deepEqual(await service.change(input),edited);assert.equal(f.git.refWrites,1);
});

test('legacy omission preserves linked and unlinked cases over authenticated PATCH and clears approval',async t=>{
  const {store,service}=await setup(t);
  const prior=process.env.AIO_DASHBOARD_ADMIN_TOKEN;process.env.AIO_DASHBOARD_ADMIN_TOKEN='synthetic-compatibility';
  t.after(()=>{if(prior===undefined)delete process.env.AIO_DASHBOARD_ADMIN_TOKEN;else process.env.AIO_DASHBOARD_ADMIN_TOKEN=prior;});
  for(const canonicalEntityId of [null,'DEMO-001']) {
    let r=canonicalEntityId?await seedLinked(store,{...data(),canonicalEntityId}):await create(service);
    r=await change(service,r,'validate');r=await change(service,r,'approve');r=await change(service,r,'publish');
    const input={...r.data,description:'Synthetic legacy-client edit'};delete input.canonicalEntityId;
    const response=await handle(new Request('http://local/api/entities?id='+r.id,{method:'PATCH',headers:{
      'x-aio-admin-token':'synthetic-compatibility','content-type':'application/json','idempotency-key':randomUUID()
    },body:JSON.stringify({expectedVersion:r.version,data:input})}),store);
    assert.equal(response.status,200);r=(await response.json()).data;
    assert.equal(r.data.canonicalEntityId,canonicalEntityId);
    for(const key of ['approvedVersion','approvedDataHash','packageData','publicUrl'])assert.equal(r[key],null);
    if(canonicalEntityId) {
      const before=await store.all();
      for(const value of [null,'DEMO-002'])await assert.rejects(change(service,r,'edit',{data:{...r.data,canonicalEntityId:value}}),{code:'invalid_canonical_link'});
      assert.deepEqual(await store.all(),before);
    } else {r=await change(service,r,'edit',{data:{...r.data,canonicalEntityId:null}});assert.equal(r.data.canonicalEntityId,null);}
    r=await change(service,r,'archive');const before=await store.all();
    await assert.rejects(change(service,r,'edit',{data:input}),{code:'invalid_transition'});
    assert.deepEqual(await store.all(),before);
  }
});

test('historical archive reactivation replay is rejected without rewriting history',async t=>{
  const {store,service}=await setup(t);let r=await create(service);r=await change(service,r,'archive');
  const key=randomUUID(),body={expectedVersion:r.version,data:r.data},action='edit';
  const unsafe={...r,version:r.version+1,eventId:randomUUID(),status:'draft',operationKey:hash(['admin-console',key]),
    operationHash:hash({id:r.id,action,body}),activity:[...r.activity,{action,version:r.version+1}]};
  await writeFile(join(store.directory,'event-'+unsafe.eventId+'.json'),JSON.stringify(unsafe));
  const before=await store.all();await assert.rejects(service.change({id:r.id,action,key,body}),{code:'invalid_transition'});
  await assert.rejects(store.append(unsafe),{code:'invalid_transition'});assert.deepEqual(await store.all(),before);
});

test('a stale approved hash cannot prepare a private package, including historical replay',async t=>{
  const f=gitFixture(t),source=f.git.addCase({status:'approved',approvedVersion:1,approvedDataHash:hash('outdated')});
  const service=new EntityService(new VaultStore('synthetic-read','synthetic-write'));
  const key=randomUUID(),body={expectedVersion:source.version},action='publish';
  await assert.rejects(service.change({id:source.id,action,key,body}),{code:'approval_required'});
  const unsafe=f.git.addCase({...source,version:2,status:'pending_deployment',operationKey:hash(['admin-console',key]),
    operationHash:hash({id:source.id,action,body}),activity:[{action,version:2}]});
  const before=f.git.contents();await assert.rejects(service.change({id:source.id,action,key,body}),{code:'approval_required'});
  assert.deepEqual(f.git.contents(),before);assert.equal(unsafe.publicUrl,null);assert.equal(f.git.refWrites,0);
});
