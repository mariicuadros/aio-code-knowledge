import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {CreatorVaultAdapter} from '../lib/creator-vault-adapter-v0.1.mjs';
const stamp='2026-10-18T00:00:00Z', end='2026-11-18T00:00:00Z';
const base=(kind,recordId)=>({schemaVersion:'0.1.0',kind,recordId,responsibleEntityId:'DEMO-001',createdAt:stamp,revision:1,visibility:'private',reviewStatus:'approved',evidenceRefs:[]});
const bundle=()=>({entity:{entityId:'DEMO-001',canonicalName:'Demo',reviewStatus:'approved',visibility:'approved_public'},works:[{...base('CreativeWork','WORK-001'),creatorEntityIds:['DEMO-001'],title:'Demo',workType:'music'}],grants:[{...base('RightsGrant','GRANT-001'),workId:'WORK-001',grantorEntityId:'DEMO-001',granteeEntityId:'DEMO-001',permissions:['view_metadata'],validFrom:stamp,expiresAt:end,revokedAt:null,approvalEvidenceIds:[],humanApprovalRequired:false}],mandates:[]});
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const record=(revision,status,b=bundle(),approvedRevision=null)=>({key:'CASE-001',revision,status,approvedRevision,bundle:b,bundleHash:hash(b),at:stamp});
const make=()=>{
 const entries=[],blobs=new Map();
 const readSnapshot=async()=>({entries:[...entries]});
 const readBlob=async sha=>blobs.get(sha);
 const commit=async(_token,files,_msg,_marker,preflight)=>{
  await preflight({entries:[...entries]});
  for(const f of files){if(entries.some(x=>x.path===f.path))throw Error('immutable_path');const sha=hash(f.content);blobs.set(sha,f.content);entries.push({path:f.path,sha,type:'blob'})}
  return {status:'committed'};
 };
 const store=new CreatorVaultAdapter({readSnapshot,readBlob,commit,readToken:'fake-read',writeToken:'fake-write'});
 return {store,entries,blobs,commit};
};
test('mock remote append and read isolated prefix',async()=>{const {store,entries}=make();await store.append(record(1,'draft'));assert.equal((await store.latest('CASE-001')).revision,1);assert(entries.some(x=>x.path==='creator-records/v1/CASE-001/00000001.json'))});
test('cannot append stale revision',async()=>{const {store}=make();await store.append(record(1,'draft'));await assert.rejects(store.append(record(1,'draft')),/revision_conflict/)});
test('cannot approve without review',async()=>{const {store}=make();await store.append(record(1,'draft'));await assert.rejects(store.append(record(2,'approved',bundle(),1)),/invalid_transition/)});
test('review and approval tied to content hash',async()=>{const {store}=make();const b=bundle();await store.append(record(1,'draft',b));await store.append(record(2,'review',b));const changed=bundle();changed.entity.canonicalName='Changed';await assert.rejects(store.append(record(3,'approved',changed,2)),/invalid_transition/);await store.append(record(3,'approved',b,2));assert.equal((await store.latest('CASE-001')).approvedRevision,2)});
test('corrupted bundle in mock snapshot denied',async()=>{const {store,entries,blobs}=make();await store.append(record(1,'draft'));const e=entries.find(x=>x.path.endsWith('00000001.json'));const obj=JSON.parse(blobs.get(e.sha));obj.bundle.entity.canonicalName='tampered';blobs.set(e.sha,JSON.stringify(obj));await assert.rejects(store.latest('CASE-001'),/corrupted_history/)});
test('rejects malformed path under creator scope',async()=>{const {store,entries}=make();entries.push({path:'creator-records/v1/CASE-001/private-contract.txt',sha:'x',type:'blob'});await assert.rejects(store.latest('CASE-001'),/malformed_vault_path/)});
test('preflight runs again if simulated competing writer changes tree',async()=>{const {store,entries,blobs}=make();await store.append(record(1,'draft'));const contender=record(2,'review');const fn=store.commit;store.commit=async(token,files,msg,marker,preflight)=>{const other=record(2,'draft');const raw=JSON.stringify(other),sha=hash(raw);blobs.set(sha,raw);entries.push({path:'creator-records/v1/CASE-001/00000002.json',sha,type:'blob'});await preflight({entries:[...entries]});return fn(token,files,msg,marker,preflight)};await assert.rejects(store.append(contender),/revision_conflict/)});
test('missing earlier revision denied',async()=>{const {store,entries}=make();await store.append(record(1,'draft'));await store.append(record(2,'review'));entries.splice(entries.findIndex(x=>x.path.endsWith('00000001.json')),1);await assert.rejects(store.latest('CASE-001'),/corrupted_history/)});
test('write forbidden when no write credential supplied',async()=>{const {store}=make();store.writeToken=null;await assert.rejects(store.append(record(1,'draft')),/write_disabled/)});
