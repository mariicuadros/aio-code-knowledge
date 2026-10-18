// Phase 2 experimental public creator passport projection.
// No I/O. Only reviewed, explicitly approved fields are emitted.
import {validateCreatorWork} from './creator-interoperability-v0.1.mjs';
const https = u => {try {const v=new URL(u);return v.protocol==='https:'&&!v.username&&!v.password && v.hostname.includes('.')}catch{return false}};
const PUBLIC_WORK_FIELDS = Object.freeze(['recordId','title','workType','creatorEntityIds','publicationUrls']);
export function buildPublicCreatorPassport({entity,works=[],approvedWorkIds=[],approvedEntityFields=[]}){
 if(!entity||typeof entity!=='object'||typeof entity.entityId!=='string'||!Array.isArray(works)||!Array.isArray(approvedWorkIds)||!Array.isArray(approvedEntityFields))throw new Error('invalid_input');
 if(entity.reviewStatus!=='approved'||entity.visibility!=='approved_public')throw new Error('entity_not_publicly_approved');
 const allow=new Set(approvedEntityFields);
 const result={schemaVersion:'0.1.0',entityId:entity.entityId};
 if(allow.has('canonicalName')&&typeof entity.canonicalName==='string')result.name=entity.canonicalName;
 if(allow.has('officialProfiles')&&Array.isArray(entity.officialProfiles))result.sameAs=entity.officialProfiles.filter(https);
 const ids=new Set(approvedWorkIds);
 result.works=works.filter(w=>ids.has(w?.recordId)).map(w=>{
   validateCreatorWork(w);
   if(w.visibility!=='approved_public'||w.reviewStatus!=='approved'||!w.creatorEntityIds.includes(entity.entityId))throw new Error('work_not_approved_or_unrelated');
   const projection={};
   for(const key of PUBLIC_WORK_FIELDS)if(Object.hasOwn(w,key))projection[key]=key==='publicationUrls'?w.publicationUrls.filter(https):structuredClone(w[key]);
   return projection;
 });
 return result;
}
