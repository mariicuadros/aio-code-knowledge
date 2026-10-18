// AIO CODE Phase 2 — local, side-effect-free creator workflow rehearsal.
// No persistence, network, authorization token or production API integration.
import {validateCreatorWork,validateRightsGrant,validateAgentAuthorization,evaluateAgentRequest} from './creator-interoperability-v0.1.mjs';
import {buildPublicCreatorPassport} from './creator-passport-public-v0.1.mjs';

const deny = code => {throw new Error(code)};
const unique = values => new Set(values).size===values.length;
const plain = value => value!==null&&typeof value==='object'&&!Array.isArray(value);
const keys = new Set(['schemaVersion','recordId','responsibleEntityId','createdAt','revision','visibility','reviewStatus','evidenceRefs']);
const workKeys = new Set([...keys,'kind','creatorEntityIds','title','workType','versionIds','contributionIds','rightsStatementIds','publicationUrls']);
const grantKeys = new Set([...keys,'kind','workId','grantorEntityId','granteeEntityId','permissions','validFrom','expiresAt','revokedAt','approvalEvidenceIds','humanApprovalRequired']);
const agentKeys = new Set([...keys,'kind','principalEntityId','agentId','workIds','permittedActions','validFrom','expiresAt','revokedAt','humanApprovalRequired','approvalEvidenceIds']);
function exact(value,allowed){if(!plain(value)||Object.keys(value).some(k=>!allowed.has(k)))deny('unknown_or_private_field');}
function ids(values,field){if(!Array.isArray(values)||!values.every(x=>typeof x==='string'&&x.length>0)||!unique(values))deny('invalid_'+field);}
function date(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(value)||Number.isNaN(Date.parse(value)))deny('invalid_time');return Date.parse(value);}
function common(record){
 if(!plain(record)||!Array.isArray(record.evidenceRefs)||!unique(record.evidenceRefs))deny('invalid_evidence');
 ids(record.evidenceRefs,'evidenceRefs');
}
export function validateCreatorBundle({entity,works,grants,mandates}){
 if(!plain(entity)||typeof entity.entityId!=='string'||!Array.isArray(works)||!Array.isArray(grants)||!Array.isArray(mandates))deny('invalid_bundle');
 const entityIds=new Set([entity.entityId]);const workIds=new Set(works.map(x=>x.recordId));
 if(workIds.size!==works.length||new Set(grants.map(x=>x.recordId)).size!==grants.length||new Set(mandates.map(x=>x.recordId)).size!==mandates.length)deny('duplicate_record');
 for(const w of works){exact(w,workKeys);common(w);validateCreatorWork(w,entityIds);ids(w.creatorEntityIds,'creatorEntityIds');if(w.publicationUrls!==undefined){ids(w.publicationUrls,'publicationUrls');for(const u of w.publicationUrls)if(!/^https:\/\//.test(u))deny('invalid_public_url');}}
 for(const g of grants){exact(g,grantKeys);common(g);validateRightsGrant(g,workIds,entityIds);if(!workIds.has(g.workId)||!entityIds.has(g.grantorEntityId)||!entityIds.has(g.granteeEntityId))deny('orphan_grant');ids(g.permissions,'permissions');ids(g.approvalEvidenceIds,'approvalEvidenceIds');}
 for(const a of mandates){exact(a,agentKeys);common(a);validateAgentAuthorization(a,workIds,entityIds);ids(a.workIds,'workIds');ids(a.permittedActions,'permittedActions');ids(a.approvalEvidenceIds,'approvalEvidenceIds');if(a.workIds.some(x=>!workIds.has(x))||!entityIds.has(a.principalEntityId))deny('orphan_agent_authorization');}
 return true;
}
export function previewCreatorWorkflow({bundle,request,selectedWorkIds=[],approvedEntityFields=[]}){
 validateCreatorBundle(bundle);
 const {entity,works,grants,mandates}=bundle;
 if(!plain(request)||typeof request.agentId!=='string'||typeof request.workId!=='string'||typeof request.action!=='string')deny('invalid_request');
 const timestamp=date(request.now);ids(selectedWorkIds,'selectedWorkIds');ids(approvedEntityFields,'approvedEntityFields');
 const work=works.find(w=>w.recordId===request.workId);
 if(!work)deny('unknown_work');
 const auths=mandates.filter(a=>a.agentId===request.agentId&&a.workIds.includes(request.workId));
 const applicable=grants.filter(g=>g.workId===request.workId);
 let decision='deny';
 // Evaluate all intersecting grants and mandates, while never granting an action when a record was missing.
 // This is a demonstration only, not an external agent authorization service.
 for(const a of auths)for(const g of applicable){
   const d=evaluateAgentRequest({mandate:a,grant:g,action:request.action,workId:request.workId,now:request.now,humanApproved:false});
   if(d==='review')decision='review';
   if(d==='allow')decision='allow';
 }
 const passport=buildPublicCreatorPassport({entity,works,approvedWorkIds:selectedWorkIds,approvedEntityFields});
 // Audit output contains no raw mandate, contract, private evidence or sensitive source record.
 return {decision,publicPassport:passport,audit:{schemaVersion:'0.1.0',workId:request.workId,action:request.action,decision,at:new Date(timestamp).toISOString(),simulation:true}};
}
