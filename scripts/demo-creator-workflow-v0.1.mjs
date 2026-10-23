// AIO CODE Phase 2 — fictional, offline Creator Trust & Rights walkthrough.
// Run: node scripts/demo-creator-workflow-v0.1.mjs
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {LocalCreatorRecordsStore} from '../lib/creator-records-local-v0.1.mjs';
const stamp='2026-10-18T00:00:00Z',until='2026-11-18T00:00:00Z';
const common=(kind,recordId)=>({schemaVersion:'0.1.0',kind,recordId,responsibleEntityId:'DEMO-001',createdAt:stamp,revision:1,visibility:'private',reviewStatus:'approved',evidenceRefs:[]});
const bundle={
 entity:{entityId:'DEMO-001',canonicalName:'Fictional Artist',visibility:'approved_public',reviewStatus:'approved',privateContact:'NOT_FOR_PUBLIC_EXPORT'},
 works:[{...common('CreativeWork','WORK-001'),creatorEntityIds:['DEMO-001'],title:'Fictional Song',workType:'music',visibility:'approved_public',publicationUrls:['https://example.org/fictional-song']}],
 grants:[{...common('RightsGrant','GRANT-001'),workId:'WORK-001',grantorEntityId:'DEMO-001',granteeEntityId:'DEMO-001',permissions:['view_metadata'],validFrom:stamp,expiresAt:until,revokedAt:null,approvalEvidenceIds:[],humanApprovalRequired:false}],
 mandates:[],
};
const directory=await mkdtemp(join(tmpdir(),'aio-demo-'));
try{
 const store=await new LocalCreatorRecordsStore(directory).init();
 const output=[];
 const create=await store.create('CASE-001',bundle);output.push({step:'created',version:create.revision,status:create.status});
 try{await store.publicPassport('CASE-001',{approvedWorkIds:['WORK-001']});throw Error('unexpected_public_export')}catch(e){if(e.message==='unexpected_public_export')throw e;output.push({step:'draft_private',blocked:true})}
 const review=await store.review('CASE-001',1);output.push({step:'reviewed',version:review.revision,status:review.status});
 const approved=await store.approve('CASE-001',2);output.push({step:'approved',version:approved.revision,status:approved.status});
 const passport=await store.publicPassport('CASE-001',{approvedWorkIds:['WORK-001'],approvedEntityFields:['canonicalName']});
 const publicJSON=JSON.stringify(passport);
 if(['NOT_FOR_PUBLIC_EXPORT','GRANT-001','privateContact'].some(secret=>publicJSON.includes(secret)))throw Error('private_data_leak');
 output.push({step:'public_preview',passport});
 const edit=await store.edit('CASE-001',3,{...bundle,entity:{...bundle.entity,canonicalName:'Fictional Artist Revised'}});output.push({step:'edited',version:edit.revision,status:edit.status});
 try{await store.publicPassport('CASE-001');throw Error('unexpected_old_approval')}catch(e){if(e.message==='unexpected_old_approval')throw e;output.push({step:'prior_approval_withdrawn',blocked:true})}
 output.push({step:'durable_history',versions:(await (await new LocalCreatorRecordsStore(directory).init()).versions('CASE-001')).length});
 console.log(JSON.stringify({demo:'AIO CODE Creator Trust & Rights — FICTIONAL, OFFLINE',production:false,steps:output},null,2));
}finally{await rm(directory,{recursive:true,force:true})}
