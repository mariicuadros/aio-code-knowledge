import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {LocalCreatorRecordsStore} from '../lib/creator-records-local-v0.1.mjs';
const at='2026-10-18T00:00:00Z',until='2026-11-18T00:00:00Z';
const base=(kind,recordId)=>({schemaVersion:'0.1.0',kind,recordId,responsibleEntityId:'DEMO-001',createdAt:at,revision:1,visibility:'private',reviewStatus:'approved',evidenceRefs:[]});
const sample=()=>({entity:{entityId:'DEMO-001',canonicalName:'Fictional Artist',reviewStatus:'approved',visibility:'approved_public'},works:[{...base('CreativeWork','WORK-001'),creatorEntityIds:['DEMO-001'],title:'Demo',workType:'music'}],grants:[{...base('RightsGrant','GRANT-001'),workId:'WORK-001',grantorEntityId:'DEMO-001',granteeEntityId:'DEMO-001',permissions:['view_metadata'],validFrom:at,expiresAt:until,revokedAt:null,approvalEvidenceIds:[],humanApprovalRequired:false}],mandates:[]});
async function setup(t){const dir=await mkdtemp(join(tmpdir(),'aio-integrity-'));t.after(()=>rm(dir,{recursive:true,force:true}));return await new LocalCreatorRecordsStore(dir).init()}
test('simultaneous edits cannot overwrite one revision file',async t=>{
 const store=await setup(t);await store.create('CASE-001',sample());
 const two=await Promise.allSettled([store.edit('CASE-001',1,sample()),store.edit('CASE-001',1,sample())]);
 assert.equal(two.filter(x=>x.status==='fulfilled').length,1);
 assert.equal(two.filter(x=>x.status==='rejected').length,1);
 assert.equal((await store.versions('CASE-001')).length,2);
});
test('simultaneous create attempts cannot overwrite initial version',async t=>{
 const store=await setup(t);
 const two=await Promise.allSettled([store.create('CASE-001',sample()),store.create('CASE-001',sample())]);
 assert.equal(two.filter(x=>x.status==='fulfilled').length,1);
 assert.equal(two.filter(x=>x.status==='rejected').length,1);
 assert.equal((await store.versions('CASE-001')).length,1);
});
test('modified stored bundle is detected instead of returned',async t=>{
 const store=await setup(t);await store.create('CASE-001',sample());
 const file=store.filename('CASE-001',1),entry=JSON.parse(await readFile(file,'utf8'));
 entry.bundle.entity.canonicalName='TAMPERED';
 await writeFile(file,JSON.stringify(entry));
 await assert.rejects(store.latest('CASE-001'),/corrupted_history/);
});
test('missing intermediate revision invalidates chain',async t=>{
 const store=await setup(t);await store.create('CASE-001',sample());await store.review('CASE-001',1);
 const {rename}=await import('node:fs/promises');
 await rename(store.filename('CASE-001',1),join(store.directory,'hidden-file.json'));
 await assert.rejects(store.latest('CASE-001'),/corrupted_history/);
});
test('reopening store does not change approved history',async t=>{
 const store=await setup(t);await store.create('CASE-001',sample());await store.review('CASE-001',1);await store.approve('CASE-001',2);
 const reopened=await new LocalCreatorRecordsStore(store.directory).init();
 const history=await reopened.versions('CASE-001');
 assert.deepEqual(history.map(x=>x.status),['draft','review','approved']);
 assert.equal(history[2].approvedRevision,2);
});
