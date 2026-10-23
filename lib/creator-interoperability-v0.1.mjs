// Phase 2 semantic validation; pure functions, no remote writes.
const id = v => typeof v === 'string' && /^[A-Z][A-Z0-9-]*[0-9]$/.test(v);
const actions = new Set(['view_metadata','prepare_license','publish','remix']);
const iso = v => typeof v==='string' && !Number.isNaN(Date.parse(v)) && /^\d{4}-\d\d-\d\dT/.test(v);
function reject(message){ throw new Error(message); }
function common(r, kind) {
  if(!r || typeof r!=='object'||Array.isArray(r)) reject('invalid_record');
  if(r.schemaVersion!=='0.1.0'||r.kind!==kind) reject('invalid_schema_version_or_kind');
  if(!id(r.recordId)||!id(r.responsibleEntityId)||!Number.isInteger(r.revision)||r.revision<1) reject('invalid_identity');
  if(!iso(r.createdAt)||!['private','approved_public'].includes(r.visibility)||!['draft','in_review','approved','withdrawn'].includes(r.reviewStatus)) reject('invalid_metadata');
  if(!Array.isArray(r.evidenceRefs)||r.evidenceRefs.some(x=>typeof x!=='string')) reject('invalid_evidence');
  if(r.visibility==='approved_public' && r.reviewStatus!=='approved') reject('public_without_approval');
}
function dates(r){
  if(!iso(r.validFrom)||!(r.expiresAt===null||iso(r.expiresAt))||!(r.revokedAt===null||iso(r.revokedAt)))reject('invalid_dates');
  if(r.expiresAt!==null && Date.parse(r.expiresAt)<=Date.parse(r.validFrom))reject('invalid_period');
}
export function validateCreatorWork(r, entities=new Set()){
 common(r,'CreativeWork');
 if(!Array.isArray(r.creatorEntityIds)||!r.creatorEntityIds.length||!r.creatorEntityIds.every(id)||!r.title?.trim())reject('invalid_work');
 if(entities.size && r.creatorEntityIds.some(x=>!entities.has(x)))reject('unknown_creator');
 return true;
}
export function validateRightsGrant(r, works=new Set(), entities=new Set()){
 common(r,'RightsGrant'); dates(r);
 if(!id(r.workId)||!id(r.grantorEntityId)||!id(r.granteeEntityId)||!Array.isArray(r.permissions)||!r.permissions.length||!Array.isArray(r.approvalEvidenceIds)||typeof r.humanApprovalRequired!=='boolean')reject('invalid_grant');
 if(works.size&&!works.has(r.workId))reject('unknown_work');
 if(entities.size&&(!entities.has(r.grantorEntityId)||!entities.has(r.granteeEntityId)))reject('unknown_party');
 return true;
}
export function validateAgentAuthorization(r, works=new Set(),entities=new Set()){
 common(r,'AgentAuthorization'); dates(r);
 if(!id(r.principalEntityId)||!r.agentId||!Array.isArray(r.workIds)||!Array.isArray(r.permittedActions)||r.permittedActions.some(x=>!actions.has(x))||!Array.isArray(r.approvalEvidenceIds)||typeof r.humanApprovalRequired!=='boolean')reject('invalid_mandate');
 if(works.size&&r.workIds.some(x=>!works.has(x)))reject('unknown_work');
 if(entities.size&&!entities.has(r.principalEntityId))reject('unknown_principal');
 return true;
}
export function evaluateAgentRequest({mandate,grant,action,workId,now,humanApproved=false}){
 // Default deny. A local decision only, not legal enforcement against an outside agent.
 if(!iso(now)||!actions.has(action)||!mandate||!grant) return 'deny';
 try{validateAgentAuthorization(mandate);validateRightsGrant(grant)}catch{return 'deny'}
 if(mandate.reviewStatus!=='approved'||grant.reviewStatus!=='approved')return 'deny';
 if(mandate.revokedAt!==null||grant.revokedAt!==null)return 'deny';
 const t=Date.parse(now);
 if(t<Date.parse(mandate.validFrom)||t>=Date.parse(mandate.expiresAt)||t<Date.parse(grant.validFrom)||(grant.expiresAt!==null&&t>=Date.parse(grant.expiresAt)))return 'deny';
 if(!mandate.workIds.includes(workId)||grant.workId!==workId||mandate.principalEntityId!==grant.granteeEntityId||!mandate.permittedActions.includes(action))return 'deny';
 const permission= action==='view_metadata'?'view_metadata':action==='publish'?'publish':action==='remix'?'modify':'license';
 if(!grant.permissions.includes(permission))return 'deny';
 if((mandate.humanApprovalRequired||grant.humanApprovalRequired||action==='prepare_license')&&!humanApproved)return 'review';
 return 'allow';
}
