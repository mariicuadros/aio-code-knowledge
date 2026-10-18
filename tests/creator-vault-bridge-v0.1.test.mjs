import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createCreatorVaultBridge} from '../lib/creator-vault-bridge-v0.1.mjs';
const hash=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
const t='2026-10-18T00:00:00Z',until='2026-11-18T00:00:00Z';
const base=(kind,recordId)=>({schemaVersion:'0.1.0',kind,recordId,responsibleEntityId:'DEMO-001',createdAt:t,revision:1,visibility:'private',reviewStatus:'approved',evidenceRefs:[]});
const bundle=()=>({entity:{entityId:'DEMO-001',canonicalName:'Fictional',reviewStatus:'approved',visibility:'approved_public'},works:[{...base('CreativeWork','WORK-001'),creatorEntityIds:['DEMO-001'],title:'Fictional Work',workType:'music'}],grants:[{...base('RightsGrant','GRANT-001'),workId:'WORK-001',grantorEntityId:'DEMO-001',granteeEntityId:'DEMO-001',permissions:['view_metadata'],validFrom:t,expiresAt:until,revokedAt:null,approvalEvidenceIds:[],humanApprovalRequired:false}],mandates:[]});
const record=(n,status,b=bundle(),approvedRevision=null)=>({key:'CASE-001',revision:n,status,approvedRevision,bundle:b,bundleHash:hash(b),at:t});
const mocked=()=>{
 const paths=new Map(), calls=[];
 // Existing entity entries are part of same tree and must never be edited.
 paths.set('entity-console/v1/ENT-00000000-0000-0000-0000-000000000001/00000001.json','EXISTING-ENTITY');
 const state=async()=>({entries:[...paths].map(([path,content])=>({path,sha:hash(content),type:'blob'}))});
 const textBlob=async sha=>{for(const content of paths.values())if(hash(content)===sha)return content;throw Error('missing_blob')};
 const commitFiles=async(_token,files,_message,_marker,preflight)=>{
  calls.push('commit');
  await preflight(await state());
  for(const file of files){if(paths.has(file.path))throw Error('immutable');}
  for(const file of files)paths.set(file.path,file.content);
  return {status:'committed'};
 };
 return {transport:{state,textBlob,commitFiles},paths,calls};
};
test('bridge refuses transport without required primitives',()=>assert.throws(()=>createCreatorVaultBridge({transport:{},readToken:'fake'})));
test('bridge requires read credential',()=>assert.throws(()=>createCreatorVaultBridge({transport:mocked().transport})));
test('read only bridge disallows writes',async()=>{const bridge=createCreatorVaultBridge({transport:mocked().transport,readToken:'fake'});await assert.rejects(bridge.append(record(1,'draft')),/write_disabled/)});
test('mock write leaves existing entity path untouched',async()=>{
 const m=mocked(),original=m.paths.get('entity-console/v1/ENT-00000000-0000-0000-0000-000000000001/00000001.json');
 const bridge=createCreatorVaultBridge({transport:m.transport,readToken:'fake',writeToken:'fake'});
 await bridge.append(record(1,'draft'));
 assert.equal(m.paths.get('entity-console/v1/ENT-00000000-0000-0000-0000-000000000001/00000001.json'),original);
 assert.equal((await bridge.latest('CASE-001')).revision,1);
});
test('mock review and approval use isolated creator namespace',async()=>{
 const m=mocked(),bridge=createCreatorVaultBridge({transport:m.transport,readToken:'fake',writeToken:'fake'});
 const b=bundle();await bridge.append(record(1,'draft',b));await bridge.append(record(2,'review',b));await bridge.append(record(3,'approved',b,2));
 assert.equal((await bridge.latest('CASE-001')).status,'approved');
 assert.equal(m.paths.size,7);
});
test('stale approval fails on preflight',async()=>{
 const m=mocked(),bridge=createCreatorVaultBridge({transport:m.transport,readToken:'fake',writeToken:'fake'});
 await bridge.append(record(1,'draft'));await assert.rejects(bridge.append(record(2,'approved',bundle(),1)),/invalid_transition/);
});
test('no live requests are made by factory construction',()=>{const m=mocked();createCreatorVaultBridge({transport:m.transport,readToken:'fake'});assert.deepEqual(m.calls,[])});
