import test from 'node:test';import assert from 'node:assert/strict';import { mkdtemp } from 'node:fs/promises';import { join } from 'node:path';
import { createLabServer } from './server.mjs';import { allowTestOrigin } from './offline.mjs';import { EXAMPLES } from './catalog.mjs';
test('real loopback HTTP: two users, persistence, contract preview, origin and authority denials',async()=>{
 const dir=await mkdtemp(join(process.argv[2],'http-')),lab=createLabServer(dir),origin=await lab.listen();allowTestOrigin(origin);
 const post=async(path,body,cookie='',extra={})=>{const r=await fetch(origin+path,{method:'POST',headers:{'content-type':'application/json',origin,cookie,...extra},body:JSON.stringify(body)});
 return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 try{
  const a=await post('/api/login',{user:'A'}),b=await post('/api/login',{user:'B'});assert.equal(a.status,200);
  const entity='SYN-A-MAIN';let revision=0;
  for(const text of EXAMPLES.A){const r=await post('/api/message',{entity,text,revision},a.cookie);assert.equal(r.status,200);revision=r.body.memory.revision;}
  assert.equal((await post('/api/view',{entity},b.cookie)).status,403);
  assert.equal((await post('/api/message',{entity,text:'Soy artista',revision:0},a.cookie)).status,409);
  assert.equal((await post('/api/view',{entity},a.cookie,{origin:'https://example.invalid'})).status,403);
  assert.equal((await post('/api/publish',{},a.cookie)).status,403);
  assert.equal((await post('/api/link_canonical',{},a.cookie)).status,403);
  const p=await post('/api/preview',{entity},a.cookie);assert.equal(p.status,200);assert.equal(p.body.data.canonicalEntityId,null);
  const review=await post('/api/review',{binding:p.body.binding},a.cookie);assert.equal(review.status,200);assert.equal(review.body.publication,'denied');
  await post('/api/logout',{},a.cookie);assert.equal((await post('/api/view',{entity},a.cookie)).status,401);
  const a2=await post('/api/login',{user:'A'}),restored=await post('/api/view',{entity},a2.cookie);assert.equal(restored.body.assistantName,'Luna');
  const html=await fetch(origin+'/');assert.ok(html.headers.get('content-security-policy').includes("frame-ancestors 'none'"));
 }finally{await new Promise(r=>lab.server.close(r));}
});
