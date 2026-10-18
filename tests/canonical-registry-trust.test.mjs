import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes, generateKeyPairSync, sign } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { hash } from '../lib/entity-domain.mjs';
import { createRegistryTrustBoundary, verifyManagedCapability, safeRegistryFailure, PRIVATE_REGISTRY_HEADERS } from '../lib/canonical-registry-trust.mjs';
import { RegistryTrustVaultStore, TRUST_PREFIX } from '../lib/canonical-registry-trust-store.mjs';
import { fixture, request, next, reviewed } from './canonical-registry-fixtures.mjs';

function laboratory(t,limits={}) {
  const f=fixture(t),privateKeys=new Map(),sessions=new Map();
  let time=Math.floor(Date.now()/1000);
  const clock=()=>time*1000;
  const ring={version:1,valid_until:time+30,active_key:'lab-key-1',keys:[],revoked_sessions:[],revoked_subjects:[]};
  const addKey=(id)=>{
    const pair=generateKeyPairSync('ed25519');privateKeys.set(id,pair.privateKey);
    ring.keys.push({id,issuer:'synthetic-independent-authority',public_key:pair.publicKey.export({type:'spki',format:'pem'}),
      not_before:time-1,not_after:time+3600,revoked:false});
  };
  addKey(ring.active_key);
  const identityProvider={verifySession:async opaque=>{
    if(!sessions.has(opaque))throw Error('PRIVATE IDP ERROR DO NOT EXPOSE');
    return structuredClone(sessions.get(opaque));
  }};
  const keyProvider={current:async()=>structuredClone(ring)};
  const signer={sign:async(id,bytes)=>sign(null,bytes,privateKeys.get(id))};
  const store=()=>new RegistryTrustVaultStore({readToken:'synthetic-read',writeToken:'synthetic-write',...limits});
  const config={identityProvider,keyProvider,signer,store:store(),allowedOrigin:'https://console.synthetic.invalid',audience:'synthetic-registry',clock};
  const make=()=>createRegistryTrustBoundary({...config,store:store()});
  const boundary=make();
  const context=(command,{subject=command.action==='request'?'fictional-requester':'fictional-reviewer',roles=command.action==='request'?['operator']:['registrar']}={})=>{
    const token='synthetic-session-'+subject,csrf=randomBytes(32).toString('base64url');
    sessions.set(token,{subject,session_id:'synthetic-id-'+subject,expires_at:time+300,authenticated_at:time,mfa:true,roles,
      grants:[{case_id:command.case_id,case_revision:command.case_revision,case_hash:command.case_hash,action:command.action,command_hash:hash(command)}],
      csrf_hash:hash(csrf),human_confirmation:command.action==='request'?null:{subject,command_hash:hash(command),confirmed_at:time}});
    return {session:token,origin:config.allowedOrigin,csrf,nonce:randomBytes(32).toString('base64url')};
  };
  const run=async(command,options)=>boundary.execute(command,context(command,options));
  const approve=async c=>{
    const event=await run(c),command=next(c,event,'review',reviewed);
    return {command,event:await run(command)};
  };
  return {...f,clock,ring,addKey,sessions,config,make,boundary,context,run,approve,advance:n=>{time+=n;}};
}
async function deniedUnchanged(f,operation,code='registry_forbidden') {
  const before=JSON.stringify(f.git.contents()),writes=f.git.refWrites,trees=f.git.treeWrites;
  await assert.rejects(operation,e=>e.code===code);
  assert.equal(JSON.stringify(f.git.contents()),before);
  assert.equal(f.git.refWrites,writes);
  assert.equal(f.git.treeWrites,trees);
}

test('unconfigured service and ordinary administrative dependencies fail closed',()=>{
  for(const config of [{},{identityProvider:{}},{identityProvider:{verifySession:async()=>({role:'registrar'})}}])
    assert.throws(()=>createRegistryTrustBoundary(config),e=>e.code==='registry_trust_unconfigured');
});
test('synthetic lifecycle preserves PR B publication separation and historical locks',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),a=await f.approve(c);
  const reserve=next(a.command,a.event,'reserve',{canonical_id:'DEMO-101'});
  const reserved=await f.run(reserve),bind=next(reserve,reserved,'bind');
  const bound=await f.run(bind);
  assert.equal(bound.publication_authorized,false);
  const records=Object.values(f.git.contents()).map(JSON.parse);
  const current=records.find(r=>r.id===c.case_id&&r.version===2);
  assert.equal(current.status,'draft');assert.equal(current.approvedVersion,null);
  assert.equal(current.packageData,null);assert.equal(current.data.rightsHolder,'PRIVATE HOLDER CANARY');
  const withdraw={...next(bind,bound,'withdraw'),case_revision:current.version,case_hash:hash(current.data)};
  const withdrawn=await f.run(withdraw);
  assert.equal(withdrawn.status,'withdrawn');
  assert.ok(f.git.contents()['canonical-registrations/v1/ids/DEMO-101.json']);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)).length,5);
  const receipts=Object.entries(f.git.contents()).filter(([p])=>p.startsWith(TRUST_PREFIX)).map(([,v])=>v).join('');
  assert.ok(!receipts.includes('PRIVATE HOLDER'));assert.ok(!receipts.includes('synthetic-session-'));
  assert.ok(!receipts.includes('csrf'));assert.ok(!receipts.includes('capability'));
});
for(const action of ['review','reserve','bind','withdraw']) {
  test('ordinary operator cannot '+action+' even with command fields suggesting authority',async t=>{
    const f=laboratory(t),c=request(f.git.addCase()),event=await f.run(c);
    const cmd=next(c,event,action,action==='review'?reviewed:action==='reserve'?{canonical_id:'DEMO-101'}:{});
    const ctx=f.context(cmd,{roles:['operator']});
    await deniedUnchanged(f,()=>f.boundary.execute(cmd,ctx));
  });
}
test('requester cannot approve own request even with privileged IdP role and MFA',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),e=await f.run(c),review=next(c,e,'review',reviewed);
  await deniedUnchanged(f,()=>f.run(review,{subject:'fictional-requester'}),'registry_independent_review_required');
});
for(const mutation of ['anonymous','ordinary-password','csrf','origin','grant','grant-revision','expired','mfa','human','revoked-session','revoked-subject']) {
  test('reject '+mutation+' without signing or private writes',async t=>{
    const f=laboratory(t),c=request(f.git.addCase()),e=await f.run(c),cmd=next(c,e,'review',reviewed),ctx=f.context(cmd);
    const s=f.sessions.get(ctx.session);
    if(mutation==='anonymous')ctx.session='';
    if(mutation==='ordinary-password')ctx.session='ordinary-admin-password';
    if(mutation==='csrf')ctx.csrf='different-csrf';
    if(mutation==='origin')ctx.origin='https://untrusted.synthetic.invalid';
    if(mutation==='grant')s.grants=[];
    if(mutation==='grant-revision')s.grants[0].case_revision++;
    if(mutation==='expired')s.expires_at=Math.floor(f.clock()/1000);
    if(mutation==='mfa')s.mfa=false;
    if(mutation==='human')s.human_confirmation.command_hash='0'.repeat(64);
    if(mutation==='revoked-session')f.ring.revoked_sessions.push(s.session_id);
    if(mutation==='revoked-subject')f.ring.revoked_subjects.push(s.subject);
    let signs=0;f.config.signer.sign=async()=>{signs++;throw Error();};
    await deniedUnchanged(f,()=>f.boundary.execute(cmd,ctx));
    assert.equal(signs,0);
  });
}
test('key rotation admits new key, revocation denies old key and stale key policy closes service',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),e=await f.run(c);
  f.addKey('lab-key-2');f.ring.active_key='lab-key-2';f.ring.version++;
  const review=next(c,e,'review',reviewed);await f.run(review);
  const receipts=Object.entries(f.git.contents()).filter(([p])=>p.startsWith(TRUST_PREFIX)).map(([,v])=>JSON.parse(v));
  assert.deepEqual(receipts.map(r=>r.key_id).sort(),['lab-key-1','lab-key-2']);
  f.ring.keys.find(k=>k.id==='lab-key-2').revoked=true;
  const other=request(f.git.addCase());
  await deniedUnchanged(f,()=>f.run(other));
  f.ring.valid_until=Math.floor(f.clock()/1000);
  await deniedUnchanged(f,()=>f.run(other),'registry_trust_unconfigured');
});
test('managed verifier rejects key substitution, invalid signatures, audience, expiry and altered command',async t=>{
  const f=laboratory(t),c=request(f.git.addCase());
  let envelope;
  const recording=f.config.signer.sign;
  f.config.signer.sign=async(id,bytes)=>{const sig=await recording(id,bytes);envelope={schema_version:1,key_id:id,capability:bytes.toString()+'.'+sig.toString('base64url')};return sig;};
  await f.run(c);
  const verify=(e,cmd=c,audience=f.config.audience)=>verifyManagedCapability(e,cmd,f.ring,{audience,clock:f.clock});
  assert.equal(verify(envelope).role,'operator');
  assert.throws(()=>verify({...envelope,key_id:'unknown'}),e=>e.code==='registry_forbidden');
  assert.throws(()=>verify({...envelope,capability:envelope.capability.slice(0,-10)+'AAAAAAAAAA'}),e=>e.code==='registry_forbidden');
  assert.throws(()=>verify(envelope,{...c,reason:'tampered'}),e=>e.code==='registry_forbidden');
  assert.throws(()=>verify(envelope,c,'other-audience'),e=>e.code==='registry_forbidden');
  f.ring.keys[0].revoked=true;
  assert.throws(()=>verify(envelope),e=>e.code==='registry_forbidden');
  f.ring.keys[0].revoked=false;f.advance(61);
  assert.throws(()=>verify(envelope),e=>e.code==='registry_forbidden');
});
test('same operation and nonce retry is idempotent across separate instances',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c),e=await f.boundary.execute(c,ctx),writes=f.git.refWrites;
  assert.deepEqual(await f.make().execute(c,ctx),e);assert.equal(f.git.refWrites,writes);
  const replay={...ctx,nonce:randomBytes(32).toString('base64url')};
  await deniedUnchanged(f,()=>f.make().execute(c,replay),'registry_replay_conflict');
});
test('nonce reuse for another exact authorized command is rejected without mutations',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c);
  await f.boundary.execute(c,ctx);
  const other=request(f.git.addCase()),ctx2=f.context(other);ctx2.nonce=ctx.nonce;
  await deniedUnchanged(f,()=>f.boundary.execute({...other,reason:'modified'},ctx2)); // stale exact grant
  await deniedUnchanged(f,()=>f.make().execute(other,ctx2),'registry_replay_conflict');
});
test('distributed rate limit is rechecked against winning Git snapshot across instances',async t=>{
  const f=laboratory(t,{maxPerWindow:1}),a=request(f.git.addCase()),b=request(f.git.addCase()),ctxA=f.context(a);
  const ctxB=f.context(b);
  // Give the same authenticated subject both exact grants, with one CSRF secret.
  const session=f.sessions.get(ctxB.session);session.grants.push({case_id:a.case_id,case_revision:a.case_revision,case_hash:a.case_hash,action:a.action,command_hash:hash(a)});
  ctxA.csrf=ctxB.csrf;
  let winner;
  f.git.beforeRef=async()=>{winner=await f.make().execute(b,ctxB);};
  const initial=f.git.refWrites;
  await assert.rejects(()=>f.boundary.execute(a,ctxA),e=>e.code==='registry_rate_limited');
  assert.equal(winner.request_id,b.request_id);
  assert.equal(f.git.refWrites,initial+1);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)).length,1);
});
test('revocation on CAS conflict prevents retry from writing a registry decision',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c),initial=f.git.refWrites;
  f.git.beforeRef=async()=>{
    f.git.addCase(); // Another writer changes the ref.
    f.ring.revoked_sessions.push(f.sessions.get(ctx.session).session_id);
  };
  await assert.rejects(()=>f.boundary.execute(c,ctx),e=>e.code==='registry_forbidden');
  assert.equal(f.git.refWrites,initial);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)||p.startsWith('canonical-registrations/')).length,0);
});
test('lost acknowledgement recovers one atomic decision and one admission receipt',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c);f.git.failRef='after';
  const e=await f.boundary.execute(c,ctx);
  assert.equal(e.status,'requested');assert.equal(f.git.refWrites,1);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)).length,1);
});
test('stale revision and namespace conflict preserve PR B rejections with no receipts',async t=>{
  const f=laboratory(t),record=f.git.addCase(),c=request(record);
  const stale={...c,case_revision:2};
  await deniedUnchanged(f,()=>f.run(stale),'registry_case_revision_conflict');
  const a=await f.approve(c),reserve=next(a.command,a.event,'reserve',{canonical_id:'DAN-001'});
  await deniedUnchanged(f,()=>f.run(reserve),'registry_namespace_mismatch');
});
test('corrupt historical trust receipts stop rather than repair history',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c);
  await f.boundary.execute(c,ctx);
  f.git.seed(TRUST_PREFIX+'0'.repeat(64)+'.json',{schema_version:1});
  const other=request(f.git.addCase());
  await deniedUnchanged(f,()=>f.run(other),'registry_trust_unconfigured');
});
test('provider and signer errors expose only fixed safe errors and private headers',async t=>{
  const f=laboratory(t),c=request(f.git.addCase());
  f.config.signer.sign=async()=>{throw Error('PRIVATE SIGNER TOKEN');};
  let error;try{await f.run(c);}catch(e){error=e;}
  const failure=safeRegistryFailure(error);
  assert.equal(failure.status,503);assert.equal(failure.headers,PRIVATE_REGISTRY_HEADERS);
  assert.ok(!JSON.stringify(failure).includes('PRIVATE SIGNER'));
  assert.equal(safeRegistryFailure(Error('private provider')).body.error,'registry_unavailable');
});
test('no API route imports or enables trust composition; no production fallback',async()=>{
  for(const file of await readdir(new URL('../api/',import.meta.url))) {
    if(file.endsWith('.mjs'))assert.doesNotMatch(await readFile(new URL('../api/'+file,import.meta.url),'utf8'),/canonical-registry-trust|RegistryTrustVaultStore|createRegistryTrustBoundary/);
  }
  const source=await readFile(new URL('../lib/canonical-registry-trust.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/process\.env|configuredStore|ADMIN_TOKEN|export default|console\.log/);
});

test('older key-policy version cannot execute against a newer committed ledger',async t=>{
  const f=laboratory(t),a=request(f.git.addCase());
  f.ring.version=2;await f.run(a);
  f.ring.version=1;
  const b=request(f.git.addCase());
  await deniedUnchanged(f,()=>f.run(b));
});
test('revoked key during CAS retry denies even when session is still active',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c),writes=f.git.refWrites;
  f.git.beforeRef=async()=>{f.git.addCase();f.ring.keys[0].revoked=true;};
  await assert.rejects(()=>f.boundary.execute(c,ctx),e=>e.code==='registry_forbidden');
  assert.equal(f.git.refWrites,writes);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)).length,0);
});
test('IdP outage and wrong signer key fail before private snapshot access',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c);
  let reads=0;const mockFetch=globalThis.fetch;
  globalThis.fetch=async(...args)=>{reads++;return mockFetch(...args);};
  const verifySession=f.config.identityProvider.verifySession;
  f.config.identityProvider.verifySession=async()=>{throw Error('PRIVATE IDP');};
  await deniedUnchanged(f,()=>f.boundary.execute(c,ctx));
  assert.equal(reads,0);
  f.config.identityProvider.verifySession=verifySession;
  const wrong=generateKeyPairSync('ed25519').privateKey;
  f.config.signer.sign=async(id,bytes)=>sign(null,bytes,wrong);
  await deniedUnchanged(f,()=>f.boundary.execute(c,ctx));
  assert.equal(reads,0);
});
test('unknown request role/extra fields cannot change server-derived grants',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c);
  await deniedUnchanged(f,()=>f.boundary.execute(c,{...ctx,role:'registrar'}));
});
test('two simultaneous same-nonce requests across instances commit exactly once',async t=>{
  const f=laboratory(t),c=request(f.git.addCase()),ctx=f.context(c),initial=f.git.refWrites;
  let winner;
  f.git.beforeRef=async()=>{winner=await f.make().execute(c,ctx);};
  assert.deepEqual(await f.boundary.execute(c,ctx),winner);
  assert.equal(f.git.refWrites,initial+1);
  assert.equal(Object.keys(f.git.contents()).filter(p=>p.startsWith(TRUST_PREFIX)).length,1);
});
for(const id of ['MC-001','AIO-001','DAN-001']) {
  test('trust composition preserves protected ID exclusion for '+id,async t=>{
    const f=laboratory(t),record=f.git.addCase(),base=request(record);
    const c={...base,payload:{...base.payload,namespace:id.split('-')[0]}},a=await f.approve(c);
    const reserve=next(a.command,a.event,'reserve',{canonical_id:id});
    await deniedUnchanged(f,()=>f.run(reserve),'registry_id_unavailable');
  });
}
