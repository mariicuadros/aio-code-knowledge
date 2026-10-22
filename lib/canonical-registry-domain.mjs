import { createPublicKey, verify } from 'node:crypto';
import { fail, hash } from './entity-domain.mjs';

export const REGISTRY_PREFIX='canonical-registrations/v1/';
export const ACTIONS=Object.freeze(['request','review','reserve','bind','withdraw']);
const UUID='[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}';
export const CASE_ID=new RegExp('^ENT-'+UUID+'$');
export const REQUEST_ID=new RegExp('^REQ-'+UUID+'$');
const KEY=new RegExp('^'+UUID+'$');
export const CANONICAL_ID=/^[A-Z][A-Z0-9]{1,11}-[0-9]{3}$/;
export function exact(value,keys) {
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k))||keys.some(k=>!Object.hasOwn(value,k))) fail('registry_invalid_contract');
}
export function text(value,max=500) {
  if(typeof value!=='string'||!value.trim()||value!==value.trim()||value.length>max||/[\u0000-\u001f]/.test(value)) fail('registry_invalid_contract');
}
export function evidence(value) {
  if(!Array.isArray(value)||value.length<1||value.length>30||new Set(value).size!==value.length) fail('registry_invalid_contract');
  value.forEach(v=>text(v));
}
export function validateCommand(c) {
  exact(c,['schema_version','action','request_id','expected_version','case_id','case_revision','case_hash','reason','payload','key']);
  if(c.schema_version!==1||!ACTIONS.includes(c.action)||!REQUEST_ID.test(c.request_id)||!CASE_ID.test(c.case_id)||!KEY.test(c.key)||
    !Number.isInteger(c.expected_version)||c.expected_version<0||!Number.isInteger(c.case_revision)||c.case_revision<1||!/^[a-f0-9]{64}$/.test(c.case_hash)) fail('registry_invalid_contract');
  text(c.reason,1000);
  const p=c.payload;
  if(c.action==='request') {
    exact(p,['name','type','namespace','evidence_refs_private']);text(p.name,140);
    if(!['person','organization','project','creative'].includes(p.type)||!/^[A-Z][A-Z0-9]{1,11}$/.test(p.namespace)) fail('registry_invalid_contract');
    evidence(p.evidence_refs_private);
  } else if(c.action==='review') {
    exact(p,['decision','identity_checked','sources_checked','homonyms_resolved','rights_authorized','evidence_refs_private']);
    if(!['approved','rejected'].includes(p.decision)||['identity_checked','sources_checked','homonyms_resolved','rights_authorized'].some(k=>typeof p[k]!=='boolean')) fail('registry_invalid_contract');
    evidence(p.evidence_refs_private);
    if(p.decision==='approved'&&['identity_checked','sources_checked','homonyms_resolved','rights_authorized'].some(k=>!p[k])) fail('registry_review_incomplete',409);
  } else if(c.action==='reserve') {
    exact(p,['canonical_id']);if(p.canonical_id!==null&&!CANONICAL_ID.test(p.canonical_id)) fail('registry_invalid_contract');
  } else exact(p,[]);
  return c;
}

// No signer, HTTP handler, environment-token fallback or production wiring.
// The separate human-review authority must sign an exact operation digest.
export function registryAuthority({publicKey,issuer,audience,clock=()=>Date.now()}={}) {
  let key;
  try { key=createPublicKey(publicKey); } catch { fail('registry_authority_unconfigured',503); }
  if(key.asymmetricKeyType!=='ed25519'||typeof issuer!=='string'||!issuer||typeof audience!=='string'||!audience) fail('registry_authority_unconfigured',503);
  return (token,command)=>{
    try {
      if(typeof token!=='string'||token.length>8192) throw Error();
      const parts=token.split('.');if(parts.length!==2||parts.some(p=>!p||!/^[A-Za-z0-9_-]+$/.test(p))) throw Error();
      if(!verify(null,Buffer.from(parts[0]),key,Buffer.from(parts[1],'base64url'))) throw Error();
      const a=JSON.parse(Buffer.from(parts[0],'base64url').toString('utf8'));
      exact(a,['issuer','audience','subject','role','scope','issued_at','expires_at','command_hash']);text(a.subject,120);
      const now=Math.floor(clock()/1000);
      if(a.issuer!==issuer||a.audience!==audience||a.scope!=='canonical:'+command.action||a.command_hash!==hash(command)||
        !Number.isInteger(a.issued_at)||!Number.isInteger(a.expires_at)||a.issued_at>now||a.expires_at<=now||a.expires_at-a.issued_at>300||a.expires_at<=a.issued_at||
        a.role!==(command.action==='request'?'operator':'registrar')) throw Error();
      return Object.freeze({subject:a.subject,role:a.role,issuer:a.issuer});
    } catch { fail('registry_forbidden',403); }
  };
}

export function validateHistory(events) {
  const groups=new Map();
  for(const e of events) {
    exact(e,['schema_version','request_id','version','action','status','case_id','case_revision','case_hash','identity','canonical_id','review','requester','actor','at','reason','operation_key','operation_hash','previous_hash','publication_authorized']);
    if(e.schema_version!==1||!REQUEST_ID.test(e.request_id)||!CASE_ID.test(e.case_id)||!ACTIONS.includes(e.action)||e.publication_authorized!==false||
      !Number.isInteger(e.version)||e.version<1||!/^[a-f0-9]{64}$/.test(e.operation_key)||!/^[a-f0-9]{64}$/.test(e.operation_hash)||
      !Number.isInteger(e.case_revision)||e.case_revision<1||!/^[a-f0-9]{64}$/.test(e.case_hash)||!['requested','approved','rejected','reserved','bound','withdrawn'].includes(e.status)) fail('registry_history_invalid',503);
    exact(e.identity,['name','type','namespace','evidence_refs_private']);
    validateCommand({schema_version:1,action:'request',request_id:e.request_id,expected_version:0,case_id:e.case_id,case_revision:e.case_revision,case_hash:e.case_hash,reason:e.reason,payload:e.identity,key:'11111111-1111-4111-8111-111111111111'});
    exact(e.actor,['subject','role','issuer']);text(e.actor.subject,120);text(e.actor.issuer,200);text(e.requester,120);
    if(e.actor.role!==(e.action==='request'?'operator':'registrar')||!/^\d{4}-\d{2}-\d{2}T/.test(e.at)||Number.isNaN(Date.parse(e.at))||
      (e.canonical_id!==null&&!CANONICAL_ID.test(e.canonical_id))) fail('registry_history_invalid',503);
    if(e.review!==null) {
      exact(e.review,['decision','identity_checked','sources_checked','homonyms_resolved','rights_authorized','evidence_refs_private','reviewer','reviewed_at']);
      const {reviewer,reviewed_at,...payload}=e.review;text(reviewer,120);
      if(Number.isNaN(Date.parse(reviewed_at))||reviewer===e.requester)fail('registry_history_invalid',503);
      validateCommand({schema_version:1,action:'review',request_id:e.request_id,expected_version:1,case_id:e.case_id,case_revision:e.case_revision,case_hash:e.case_hash,reason:e.reason,payload,key:'11111111-1111-4111-8111-111111111111'});
    }
    if(events.some(other=>other!==e&&other.operation_key===e.operation_key))fail('registry_history_invalid',503);
    const list=groups.get(e.request_id)||[];list.push(e);groups.set(e.request_id,list);
  }
  for(const list of groups.values()) {
    list.sort((a,b)=>a.version-b.version);
    for(let i=0;i<list.length;i++) {
      const e=list[i],p=list[i-1];
      if(e.version!==i+1||e.previous_hash!==(p?hash(p):null)) fail('registry_history_invalid',503);
      if(!p) {
        if(e.action!=='request'||e.status!=='requested'||e.canonical_id!==null||e.review!==null||e.requester!==e.actor.subject)fail('registry_history_invalid',503);
      } else {
        if(e.action==='request'||e.case_id!==p.case_id||hash(e.identity)!==hash(p.identity)||e.requester!==p.requester||
          (e.action!=='withdraw'&&(e.case_revision!==p.case_revision||e.case_hash!==p.case_hash))||
          (e.action!=='reserve'&&e.canonical_id!==p.canonical_id)||
          (e.action!=='review'&&hash(e.review)!==hash(p.review)))fail('registry_history_invalid',503);
        if(e.action==='review'&&(p.status!=='requested'||!e.review||e.status!==e.review.decision||e.review.reviewer!==e.actor.subject))fail('registry_history_invalid',503);
        if(e.action==='reserve'&&(p.status!=='approved'||e.status!=='reserved'||!e.canonical_id||e.canonical_id.split('-')[0]!==e.identity.namespace))fail('registry_history_invalid',503);
        if(e.action==='bind'&&(p.status!=='reserved'||e.status!=='bound'))fail('registry_history_invalid',503);
        if(e.action==='withdraw'&&(p.status==='withdrawn'||e.status!=='withdrawn'))fail('registry_history_invalid',503);
      }
    }
  }
  return groups;
}
