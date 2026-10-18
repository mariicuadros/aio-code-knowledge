import { createHash } from 'node:crypto';
import { publicCanonicalTarget } from './public-identity-targets.mjs';
export const CANONICAL_IDS = ['OZCU-001','MC-001','AIO-001','VOID-001','NUX-001'];
export class ApiError extends Error { constructor(code, status=400) { super(code); this.code=code; this.status=status; } }
export const fail = (code, status=400) => { throw new ApiError(code,status); };
export const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const allowed = ['canonicalName','type','alternateNames','description','areas','socials','officialUrls','location','locationAuthorized','relationships','claims','rightsHolder','useAuthorized','lastReviewed','publicFields','typeDetail','canonicalEntityId'];
const publicKeys = ['alternateNames','areas','socials','officialUrls','location','relationships'];
const types = ['person','organization','project','creative'];
function text(value,max=500,empty=false) { if(typeof value!=='string'||value.length>max||(!empty&&!value.trim())||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail('invalid_text'); return value.trim(); }
function array(value,max=30) { if(!Array.isArray(value)||value.length>max) fail('invalid_array'); return value; }
function object(value,keys) { if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!keys.includes(k))) fail('invalid_fields'); }
export function safeUrl(value) {
  text(value,2048); let u; try { u=new URL(value); } catch { fail('invalid_url'); }
  if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||u.hostname==='localhost'||/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname)||/^172\.(1[6-9]|2\d|3[01])\./.test(u.hostname)||u.hostname.includes(':')||u.hostname.startsWith('[')) fail('invalid_url');
  return u.href;
}
export function validateEntity(input) {
  object(input,allowed);
  const d={...input};
  d.canonicalName=text(d.canonicalName,140); d.description=text(d.description,3000);
  if(!types.includes(d.type)) fail('invalid_type');
  d.typeDetail=text(d.typeDetail,200,true);
  if(d.canonicalEntityId!==undefined&&d.canonicalEntityId!==null) {
    if(typeof d.canonicalEntityId!=='string'||!/^[A-Z][A-Z0-9]{1,11}-[0-9]{3}$/.test(d.canonicalEntityId)||CANONICAL_IDS.includes(d.canonicalEntityId)) fail('invalid_canonical_link');
  } else d.canonicalEntityId=null;
  d.alternateNames=array(d.alternateNames).map(v=>text(v,140));
  d.areas=array(d.areas).map(v=>text(v,140));
  d.officialUrls=array(d.officialUrls).map(safeUrl);
  d.socials=array(d.socials).map(s=>{object(s,['platform','alias','url']);return {platform:text(s.platform,60),alias:text(s.alias,140),url:safeUrl(s.url)};});
  if(typeof d.locationAuthorized!=='boolean'||typeof d.useAuthorized!=='boolean') fail('invalid_authorization');
  d.location=text(d.location,160,true);
  if(d.location&&!d.locationAuthorized) fail('location_not_authorized');
  d.rightsHolder=text(d.rightsHolder,160);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d.lastReviewed)||Number.isNaN(Date.parse(d.lastReviewed))||new Date(d.lastReviewed).toISOString().slice(0,10)!==d.lastReviewed) fail('invalid_date');
  d.relationships=array(d.relationships).map(r=>{object(r,['targetId','relation','sourceRef']);if(!/^(?:ENT-[a-f0-9-]{36}|OZCU-001|MC-001|AIO-001|VOID-001|NUX-001|DAN-001)$/.test(r.targetId)) fail('invalid_relationship');return {targetId:r.targetId,relation:text(r.relation,100),sourceRef:text(r.sourceRef,500)};});
  d.claims=array(d.claims).map(c=>{
    object(c,['claim_id','claim_type','claim','source','source_ref','evidence_refs','date','claim_status','evidence_state','verification_rule_id','verification_scope']);
    text(c.claim_id,100); text(c.claim,2000); text(c.source,300); text(c.source_ref,500);
    if(!['canonical_definition','research_observation','research_finding','hypothesis','commercial_statement','operational_rule'].includes(c.claim_type)||!['draft','active','superseded','withdrawn'].includes(c.claim_status)) fail('invalid_claim');
    if(!['unknown','hypothesized','observed','corroborated'].includes(c.evidence_state)) fail('verified_claims_require_separate_review');
    array(c.evidence_refs).forEach(v=>text(v,500));
    if(!/^\d{4}-\d{2}-\d{2}$/.test(c.date)||Number.isNaN(Date.parse(c.date))) fail('invalid_date');
    for(const k of ['verification_rule_id','verification_scope']) if(c[k]!==null) text(c[k],500);
    return c;
  });
  if(new Set(d.claims.map(c=>c.claim_id)).size!==d.claims.length) fail('duplicate_claim_id');
  d.publicFields=array(d.publicFields,publicKeys.length);
  if(d.publicFields.some(k=>!publicKeys.includes(k))||new Set(d.publicFields).size!==d.publicFields.length) fail('invalid_public_fields');
  return d;
}
export function publicPackage(record) {
  const d=record.data;
  // The public identifier is the reviewed canonical identity, never the private console record ID when linked.
  const result={id:d.canonicalEntityId||record.id,canonicalName:d.canonicalName,type:d.type,description:d.description};
  for(const key of d.publicFields) {
    if(key==='location'&&!d.locationAuthorized) continue;
    result[key]=key==='relationships'?d.relationships.map(({targetId,relation})=>({targetId,relation})):d[key];
  }
  return {entity:result,jsonld:jsonld(result),notice:'Paquete privado aprobado. No es una publicación ni una garantía de indexación.'};
}
export function jsonld(d) {
  const types={person:'Person',organization:'Organization',project:'CreativeWork',creative:'CreativeWork'};
  const target=publicCanonicalTarget(d);
  return {'@context':'https://schema.org','@type':types[d.type],...(target?{'@id':target.personId}:{}),identifier:d.id,name:d.canonicalName,description:d.description,
    ...(d.alternateNames?.length?{alternateName:d.alternateNames}:{}),
    ...(d.officialUrls?.length?{url:d.officialUrls[0]}:{}),
    ...(d.socials?.length?{sameAs:d.socials.map(s=>s.url)}:{}),
    ...(d.areas?.length?{keywords:d.areas.join(', ')}:{}),
    ...(d.location&&d.type==='person'?{homeLocation:{'@type':'Place',name:d.location}}:{}),
    ...(d.location&&d.type==='organization'?{location:{'@type':'Place',name:d.location}}:{})
  };
}
