import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp} from 'node:fs/promises';import {join} from 'node:path';
import {createLabServer} from './server.mjs';import {allowTestOrigin} from '../alfa-core/offline.mjs';
test('HTTP local: consent, proposal/application separation, missing fields and privileged denial',async()=>{
 const lab=createLabServer(await mkdtemp(join(process.argv[2],'http-'))),origin=await lab.listen();allowTestOrigin(origin);let cookie='';
 const post=async(path,body,headers={})=>{const r=await fetch(origin+path,{method:'POST',headers:{origin,cookie,'content-type':'application/json',...headers},body:JSON.stringify(body)});
 cookie=r.headers.get('set-cookie')?.split(';')[0]??cookie;return {status:r.status,data:await r.json()};};
 try{
 await post('/api/login',{user:'A'});const entity='SYN-A-MAIN';let p=await post('/api/prepare',{entity,message:'Soy cantante. Llámate Luna, usa tono informal.'});
 assert.equal(p.status,200);let v=await post('/api/view',{entity});assert.equal(v.data.memory.revision,0);
 const r=await post('/api/respond',{entity,hash:p.data.hash,consent:true});assert.equal(r.status,200);
 v=await post('/api/view',{entity});assert.equal(v.data.memory.revision,0);
 const a=await post('/api/apply',{entity,hash:r.data.proposal_hash,consent:true});assert.equal(a.status,200);assert.equal(a.data.assistantName,'Luna');
 const missing=await post('/api/preview',{entity});assert.equal(missing.status,400);assert.equal(missing.data.error,'incomplete_or_conflicting');
 assert.equal((await post('/api/view',{entity})).status,200);assert.equal((await post('/api/publish',{})).status,403);
 assert.equal((await post('/api/prepare',{entity,message:'hola'},{origin:'https://example.invalid'})).status,403);
 await post('/api/logout',{});assert.equal((await post('/api/view',{entity})).status,401);
 }finally{await new Promise(r=>lab.server.close(r));}
});
