import { createPublicKey, timingSafeEqual } from 'node:crypto';
import { ApiError, fail, hash } from './entity-domain.mjs';
import { exact, text, validateCommand, registryAuthority } from './canonical-registry-domain.mjs';
import { CanonicalRegistry } from './canonical-registry-service.mjs';

// Server composition only: no handler, environment lookup, default IdP or signer.
export const PRIVATE_REGISTRY_HEADERS=Object.freeze({
  'cache-control':'no-store, private',
  'x-robots-tag':'noindex, nofollow',
  'content-type':'application/json',
});
const forbidden=()=>fail('registry_forbidden',403);
const unavailable=()=>fail('registry_trust_unconfigured',503);
const seconds=clock=>Math.floor(clock()/1000);
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const integer=value=>Number.isSafeInteger(value);
function equalDigest(a,b) {
  return digest(a)&&digest(b)&&timingSafeEqual(Buffer.from(a,'hex'),Buffer.from(b,'hex'));
}
function origin(value) {
  try {const u=new URL(value);return u.origin===value&&u.protocol==='https:'&&!u.username&&!u.password;} catch{return false;}
}
export function safeRegistryFailure(error) {
  // Never copy provider text, claims, command, stack or record references.
  const allowed=new Map([
    ['registry_forbidden',403],['registry_trust_unconfigured',503],
    ['registry_rate_limited',429],['registry_replay_conflict',409],
    ['registry_revision_conflict',409],['registry_case_revision_conflict',409],
    ['registry_idempotency_conflict',409],['registry_id_unavailable',409],
    ['registry_independent_review_required',403],['registry_invalid_contract',400],
  ]);
  const code=error instanceof ApiError&&allowed.has(error.code)?error.code:'registry_unavailable';
  return Object.freeze({status:allowed.get(code)||503,headers:PRIVATE_REGISTRY_HEADERS,body:{error:code}});
}

async function trustedKeys(provider,clock) {
  let ring;
  try {
    ring=structuredClone(await provider.current());
    exact(ring,['version','valid_until','active_key','keys','revoked_sessions','revoked_subjects']);
    const now=seconds(clock);
    if(!integer(ring.version)||ring.version<1||!integer(ring.valid_until)||ring.valid_until<=now||
       ring.valid_until>now+30||!Array.isArray(ring.keys)||!ring.keys.length||ring.keys.length>10||
       !Array.isArray(ring.revoked_sessions)||!Array.isArray(ring.revoked_subjects)) unavailable();
    text(ring.active_key,80);
    const ids=new Set(),materials=new Set();
    for(const key of ring.keys) {
      exact(key,['id','issuer','public_key','not_before','not_after','revoked']);
      text(key.id,80);text(key.issuer,200);
      const parsed=createPublicKey(key.public_key);
      const material=parsed.export({type:'spki',format:'der'}).toString('base64');
      if(parsed.asymmetricKeyType!=='ed25519'||ids.has(key.id)||materials.has(material)||
         !integer(key.not_before)||!integer(key.not_after)||key.not_after<=key.not_before||typeof key.revoked!=='boolean') unavailable();
      ids.add(key.id);materials.add(material);
    }
    ring.revoked_sessions.forEach(v=>text(v,120));
    ring.revoked_subjects.forEach(v=>text(v,120));
    if(!ids.has(ring.active_key)) unavailable();
    return ring;
  } catch { unavailable(); }
}
function liveKey(ring,id,clock) {
  const key=ring.keys.find(k=>k.id===id),now=seconds(clock);
  if(!key||key.revoked||key.not_before>now||key.not_after<=now) forbidden();
  return key;
}

async function authenticate(provider,request,command,ring,clock) {
  try {
    const session=structuredClone(await provider.verifySession(request.session));
    exact(session,['subject','session_id','expires_at','authenticated_at','mfa','roles','grants','csrf_hash','human_confirmation']);
    text(session.subject,120);text(session.session_id,120);
    const now=seconds(clock),privileged=command.action!=='request';
    if(!integer(session.expires_at)||session.expires_at<=now||!integer(session.authenticated_at)||
       session.authenticated_at>now||now-session.authenticated_at>300||
       typeof session.mfa!=='boolean'||(privileged&&!session.mfa)||
       ring.revoked_sessions.includes(session.session_id)||ring.revoked_subjects.includes(session.subject)||
       !Array.isArray(session.roles)||!session.roles.includes(privileged?'registrar':'operator')||
       !Array.isArray(session.grants)||!equalDigest(session.csrf_hash,hash(request.csrf))) forbidden();
    // These grants MUST come from the independently authenticated IdP/delegation
    // adapter, never from a role/header/checkbox supplied by the request.
    const authorized=session.grants.some(g=>{
      exact(g,['case_id','case_revision','case_hash','action','command_hash']);
      return g.case_id===command.case_id&&g.case_revision===command.case_revision&&g.case_hash===command.case_hash&&
        g.action===command.action&&g.command_hash===hash(command);
    });
    if(!authorized) forbidden();
    if(privileged) {
      const h=session.human_confirmation;
      exact(h,['subject','command_hash','confirmed_at']);
      if(h.subject!==session.subject||h.command_hash!==hash(command)||!integer(h.confirmed_at)||
         h.confirmed_at>now||now-h.confirmed_at>120) forbidden();
    } else if(session.human_confirmation!==null) forbidden();
    return session;
  } catch { forbidden(); }
}

export function verifyManagedCapability(envelope,command,ring,{audience,clock=Date.now}={}) {
  try {
    exact(envelope,['schema_version','key_id','capability']);
    if(envelope.schema_version!==1) forbidden();
    const key=liveKey(ring,envelope.key_id,clock);
    return registryAuthority({publicKey:key.public_key,issuer:key.issuer,audience,clock})(envelope.capability,command);
  } catch { forbidden(); }
}

export function createRegistryTrustBoundary({identityProvider,keyProvider,signer,store,allowedOrigin,audience,clock=Date.now}={}) {
  // An ordinary PR B store is deliberately insufficient: durable nonce/rate
  // receipts must commit in the SAME CAS transaction as the registry decision.
  if(typeof identityProvider?.verifySession!=='function'||typeof keyProvider?.current!=='function'||
     typeof signer?.sign!=='function'||typeof store?.transactTrusted!=='function'||!origin(allowedOrigin)||
     typeof audience!=='string'||!audience||typeof clock!=='function') unavailable();
  return Object.freeze({
    async execute(input,context) {
      const command=structuredClone(validateCommand(input));
      let request;
      try {
        exact(context,['session','origin','csrf','nonce']);
        text(context.session,8192);text(context.csrf,512);text(context.nonce,128);
        if(context.origin!==allowedOrigin||!/^[A-Za-z0-9_-]{32,128}$/.test(context.nonce)) forbidden();
        request=structuredClone(context);
      } catch { forbidden(); }
      // No private snapshot read or signing before independently verified policy.
      let ring=await trustedKeys(keyProvider,clock);
      const initial=await authenticate(identityProvider,request,command,ring,clock);
      const key=liveKey(ring,ring.active_key,clock),now=seconds(clock);
      const claims={issuer:key.issuer,audience,subject:initial.subject,
        role:command.action==='request'?'operator':'registrar',scope:'canonical:'+command.action,
        issued_at:now,expires_at:Math.min(now+60,key.not_after,initial.expires_at),command_hash:hash(command)};
      if(claims.expires_at<=now) forbidden();
      const payload=Buffer.from(JSON.stringify(claims)).toString('base64url');
      let signature;
      try {signature=await signer.sign(key.id,Buffer.from(payload));} catch {unavailable();}
      const envelope={schema_version:1,key_id:key.id,capability:payload+'.'+Buffer.from(signature).toString('base64url')};
      const policyVersion=ring.version;
      const admission={policy_version:policyVersion,nonce_hash:hash(request.nonce),session_hash:hash(initial.session_id),subject_hash:hash(initial.subject),
        command_hash:hash(command),key_id:key.id,issued_at:now};
      const authority=async(token,c)=>{
        ring=await trustedKeys(keyProvider,clock);
        if(ring.version!==policyVersion) forbidden();
        const session=await authenticate(identityProvider,request,c,ring,clock);
        if(session.subject!==initial.subject||session.session_id!==initial.session_id) forbidden();
        const actor=verifyManagedCapability(token,c,ring,{audience,clock});
        if(actor.subject!==session.subject) forbidden();
        return actor;
      };
      const registry=new CanonicalRegistry({authority,store:{
        transact:plan=>store.transactTrusted(plan,admission,clock),
      }});
      return registry.change(command,envelope);
    },
  });
}
