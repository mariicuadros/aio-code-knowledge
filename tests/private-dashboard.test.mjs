import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { authorized, session, cookie } from '../lib/private-auth.mjs';
import { POST, DELETE } from '../api/dashboard-session.mjs';
import { GET as dashboard } from '../api/dashboard.mjs';
import { GET as cron, collect, previousDay } from '../api/collect-instagram.mjs';
import { normalize, verify } from '../lib/account-observation.mjs';
const originalFetch=globalThis.fetch,oldEnv={...process.env};
const sha=n=>String(n).padStart(40,'0');
const source='phase-2/analytics/snapshots/instagram/test.json';
const raw=JSON.stringify({status:'ok',fetched_at:'2026-10-06T21:50:20.509Z',graph_api_version:'v22.0',
 account:{id:'123',username:'test',followers_count:10,media_count:1},
 request:{metrics:['reach','views','total_interactions'],period:'day',metric_type:'total_value',since:1791176400,until:1791262800},
 measurement_window:{scope:'account',status:'explicit_requested',requested:{since:1791176400,until:1791262800,start_utc:'2026-10-05T05:00:00.000Z',end_utc:'2026-10-06T05:00:00.000Z'},provider_end_times:[]},
 insights:[{name:'reach',period:'day',total_value:{value:5}},{name:'views',period:'day',total_value:{value:9}},{name:'total_interactions',period:'day',total_value:{value:0}}]});
const record=normalize(raw,source,'TEST','TEST','2026-10-06T22:00:00Z');
let calls,entries,blobs,head,tree,privateRepo,conflict,pending,lastCommit,commits,metaCalls;
beforeEach(()=>{
 Object.assign(process.env,{AIO_INSIGHTS_ADMIN_TOKEN:'test-admin',AIO_VAULT_READ_TOKEN:'test-read',AIO_VAULT_WRITE_TOKEN:'test-write',CRON_SECRET:'test-cron',AIO_COLLECTION_ENABLED:'1',AIO_INSIGHTS_ENABLED:'1',IG_BUSINESS_ID:'123',IG_LONG_TOKEN:'test-meta'});
 calls=[];metaCalls=0;head=sha(1);tree=sha(2);privateRepo=true;conflict=false;pending=null;lastCommit=null;commits=0;
 entries=[{path:source,type:'blob',sha:sha(3)},{path:'commercial-data/account-ledger/'+record.observation_id+'.json',type:'blob',sha:sha(4)}];
 blobs={[sha(3)]:raw,[sha(4)]:JSON.stringify(record)};
 globalThis.fetch=async(url,options={})=>{
  const u=new URL(url);calls.push({url:u.toString(),method:options.method||'GET'});
  if(u.hostname==='graph.facebook.com'){
   metaCalls++;assert.equal(options.headers.authorization,'Bearer test-meta');
   return Response.json(u.pathname.endsWith('/insights')?{data:[{name:'reach',period:'day',total_value:{value:5}},{name:'views',period:'day',total_value:{value:9}},{name:'total_interactions',period:'day',total_value:{value:0}}]}:{id:'123',username:'mariicuadros',followers_count:10,media_count:1});
  }
  assert.equal(u.hostname,'api.github.com');
  const p=u.pathname.replace('/repos/mariicuadros/aio-code-vault',''),body=options.body?JSON.parse(options.body):null;
  if(!p)return Response.json({private:privateRepo});
  if(p==='/git/ref/heads/main')return Response.json({object:{sha:head}});
  if(p.startsWith('/git/commits/')&&!body)return Response.json({tree:{sha:tree}});
  if(p.startsWith('/git/trees/')&&!body)return Response.json({tree:entries,truncated:false});
  if(p.startsWith('/git/blobs/'))return Response.json({encoding:'base64',content:Buffer.from(blobs[p.split('/').pop()]).toString('base64')});
  if(p==='/git/trees'&&body){assert.equal(body.base_tree,tree);pending=body.tree;return Response.json({sha:sha(20+commits)});}
  if(p==='/git/commits'&&body){assert.deepEqual(body.parents,[head]);lastCommit=sha(30+commits++);return Response.json({sha:lastCommit});}
  if(p==='/git/refs/heads/main'&&body){
   assert.equal(body.force,false);
   if(conflict){conflict=false;head=sha(99);entries.push({path:'unrelated.txt',type:'blob',sha:sha(98)});return Response.json({message:'conflict'},{status:422});}
   head=body.sha;for(const row of pending){const digest=sha(100+Object.keys(blobs).length);blobs[digest]=row.content;entries.push({...row,sha:digest});}
   return Response.json({object:{sha:head}});
  }
  throw new Error('Unexpected mocked path '+p);
 };
});
afterEach(()=>{globalThis.fetch=originalFetch;process.env={...oldEnv};});
function req(path,headers={}){return new Request('https://dashboard.test'+path,{headers});}
test('unauthenticated dashboard makes no vault calls',async()=>{
 assert.equal((await dashboard(req('/api/dashboard'))).status,401);assert.equal(calls.length,0);
});
test('missing vault credential is explicit and makes no calls',async()=>{
 delete process.env.AIO_VAULT_READ_TOKEN;
 assert.equal((await dashboard(req('/api/dashboard',{authorization:'Bearer test-admin'}))).status,503);assert.equal(calls.length,0);
});
test('login requires same origin and admin; secure session contains no credential',async()=>{
 const request=new Request('https://dashboard.test/api/dashboard-session',{method:'POST',headers:{origin:'https://dashboard.test',authorization:'Bearer test-admin'}});
 const response=await POST(request);assert.equal(response.status,200);
 const header=response.headers.get('set-cookie');assert(header.includes('HttpOnly; Secure; SameSite=Strict'));assert(!header.includes('test-admin'));
 assert(authorized(req('/api/dashboard',{cookie:header.split(';')[0]})));
 assert.equal((await POST(new Request(request,{headers:{origin:'https://other.test',authorization:'Bearer test-admin'}}))).status,403);
});
test('expired and tampered sessions fail',()=>{
 const old=session(Date.now()-7200000);assert(!authorized(req('/api/dashboard',{cookie:cookie(old).split(';')[0]})));
 const current=session();assert(!authorized(req('/api/dashboard',{cookie:cookie(current+'x').split(';')[0]})));
});
test('logout expires secure cookie',async()=>{
 const response=await DELETE(new Request('https://dashboard.test/api/dashboard-session',{method:'DELETE',headers:{origin:'https://dashboard.test'}}));
 assert(response.headers.get('set-cookie').includes('Max-Age=0'));
});
test('dashboard verifies originals and preserves observed zero',async()=>{
 const response=await dashboard(req('/api/dashboard',{authorization:'Bearer test-admin'}));assert.equal(response.status,200);
 const body=await response.json();assert.equal(body.records.length,1);assert.equal(body.records[0].metrics.total_interactions.value,0);
 assert.equal(response.headers.get('cache-control'),'no-store');assert(!JSON.stringify(body).includes('test-read'));
});
test('public vault is rejected',async()=>{privateRepo=false;assert.equal((await dashboard(req('/api/dashboard',{authorization:'Bearer test-admin'}))).status,503);});
test('tampered evidence cannot reach dashboard',async()=>{
 blobs[sha(3)]=raw.replace('"value":5','"value":999');
 assert.equal((await dashboard(req('/api/dashboard',{authorization:'Bearer test-admin'}))).status,503);
});
test('missing evidence cannot reach dashboard',async()=>{
 entries=entries.filter(x=>x.path!==source);
 assert.equal((await dashboard(req('/api/dashboard',{authorization:'Bearer test-admin'}))).status,503);
});
test('normalizer keeps missing distinct from null and zero',()=>{
 const data=JSON.parse(raw);data.insights=data.insights.slice(1);data.insights[0].total_value.value=null;
 const result=normalize(JSON.stringify(data),source,'TEST','TEST','2026-10-06T22:00:00Z');
 assert.equal(result.metrics.reach.state,'not_collected');assert.equal(result.metrics.views.state,'not_available');assert.equal(result.metrics.total_interactions.value,0);
});
test('invalid metrics and credential fields rejected',()=>{
 for(const value of [true,-1,'5']){const body=JSON.parse(raw);body.insights[0].total_value.value=value;assert.throws(()=>normalize(JSON.stringify(body),source,'TEST','TEST','2026-10-06T22:00:00Z'));}
 const body=JSON.parse(raw);body.access_token='synthetic';assert.throws(()=>normalize(JSON.stringify(body),source,'TEST','TEST','2026-10-06T22:00:00Z'));
});
test('modified normalized values rejected',()=>{const altered=structuredClone(record);altered.metrics.views.value=100;assert.throws(()=>verify(altered,raw));});
test('Colombia calendar bounds remain stable across UTC midnight',()=>{
 assert.deepEqual(previousDay(new Date('2026-10-06T13:30:00Z')),{since:1791176400,until:1791262800});
 assert.deepEqual(previousDay(new Date('2026-10-06T01:30:00Z')),{since:1791090000,until:1791176400});
});
test('collector unauthorized or disabled calls neither Meta nor vault',async()=>{
 assert.equal((await cron(req('/api/collect-instagram'))).status,401);
 process.env.AIO_COLLECTION_ENABLED='0';assert.equal((await cron(req('/api/collect-instagram',{authorization:'Bearer test-cron'}))).status,503);
 assert.equal(calls.length,0);
});
test('collection commits raw, record and marker together; repeat skips Meta',async()=>{
 const first=await collect(new Date('2026-10-06T13:00:00Z'));assert.equal(first.status,'collected');assert.equal(pending.length,3);assert.equal(metaCalls,2);
 const second=await collect(new Date('2026-10-06T13:00:00Z'));assert.equal(second.status,'already_collected');assert.equal(metaCalls,2);
 assert(entries.some(e=>e.path.includes(first.observation_id)));
});
test('concurrent change is retained by non-forcing retry',async()=>{
 conflict=true;assert.equal((await collect(new Date('2026-10-06T13:00:00Z'))).status,'collected');
 assert.equal(commits,2);assert(entries.some(e=>e.path==='unrelated.txt'));
});
