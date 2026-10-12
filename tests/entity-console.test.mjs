import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { LocalStore, VaultStore, configuredStore } from '../lib/entity-store.mjs';
import { EntityService } from '../lib/entity-service.mjs';
import { validateEntity, publicPackage, CANONICAL_IDS } from '../lib/entity-domain.mjs';
import { handle } from '../api/entities.mjs';
const data=()=>({canonicalName:'Estudio Horizonte — FICTICIO',type:'organization',description:'Entidad ficticia para probar la consola; no representa a ningún cliente.',alternateNames:[],areas:['Diseño'],socials:[{platform:'Sitio de prueba',alias:'horizonte-demo',url:'https://example.com/social'}],officialUrls:['https://example.com'],location:'',locationAuthorized:false,relationships:[],claims:[],rightsHolder:'Titular ficticio privado',useAuthorized:true,lastReviewed:'2026-10-11',publicFields:['socials'],typeDetail:'Interno privado'});
async function setup(t) { const dir=await mkdtemp(join(tmpdir(),'aio-entity-test-'));t.after(()=>rm(dir,{recursive:true,force:true}));const store=new LocalStore(dir);return {dir,store,service:new EntityService(store)}; }
const create=service=>service.change({action:'create',key:randomUUID(),body:{data:data()}});
const change=(service,r,action,extra={})=>service.change({id:r.id,action,key:randomUUID(),body:{expectedVersion:r.version,...extra}});
test('persistent private create/read survives a fresh store instance',async t=>{const {dir,service}=await setup(t);const r=await create(service);assert.equal(r.status,'draft');assert.match(r.id,/^ENT-/);assert.equal(CANONICAL_IDS.includes(r.id),false);assert.equal((await new EntityService(new LocalStore(dir)).get(r.id)).data.canonicalName,r.data.canonicalName);assert.equal(r.publicUrl,null);});
test('idempotency is persistent and rejects changed payload',async t=>{const {dir,service}=await setup(t);const key=randomUUID(),body={data:data()};const r=await service.change({action:'create',key,body});assert.equal((await new EntityService(new LocalStore(dir)).change({action:'create',key,body})).id,r.id);await assert.rejects(service.change({action:'create',key,body:{data:{...data(),description:'Cambio'}}}),{code:'idempotency_conflict'});assert.equal((await service.list()).length,1);});
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
    [new TypeError('SECRET-NETWORK-DATA'),'vault_network_unavailable'],
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
test('canonical graph, deployment policy, public manifest remain unmodified',async()=>{
  const graph=JSON.parse(await readFile(new URL('../entity-graph.json',import.meta.url)));
  assert.deepEqual(graph.nodes.map(n=>n.entity_id).sort(),[...CANONICAL_IDS].sort());
  const vercel=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url)));assert.equal(vercel.git.deploymentEnabled,false);
  const manifest=JSON.parse(await readFile(new URL('../public-site-manifest.json',import.meta.url)));assert.equal(manifest.files.some(p=>p.startsWith('entity-console/')||p.startsWith('.entity-test-data/')||p.startsWith('lib/entity-')),false);
});
