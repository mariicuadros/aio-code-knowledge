import test from 'node:test';
import assert from 'node:assert/strict';
import { publicReleaseCandidate } from '../lib/entity-public-release-gate.mjs';
import { hash, publicPackage } from '../lib/entity-domain.mjs';

const doc=()=>({
  canonicalEntityId:'DAN-001',canonicalName:'DANISAN',type:'person',
  description:'FICTITIOUS TEST RECORD: exact reviewed identity target, no actual client export',
  alternateNames:[],areas:[],socials:[],
  officialUrls:['https://aio-code.vercel.app/entities/danisan/'],
  location:'',locationAuthorized:false,relationships:[],claims:[],
  rightsHolder:'PRIVATE-HOLDER-ONLY',useAuthorized:true,
  lastReviewed:'2026-10-18',publicFields:['officialUrls'],typeDetail:'PRIVATE-INTERNAL-ONLY'
});
const record=(data=doc())=>{
  const base={id:'ENT-11111111-1111-4111-8111-111111111111',
    version:5,status:'pending_deployment',approvedVersion:3,
    approvedDataHash:hash(data),data,publicUrl:null,packageData:null};
  return {...base,packageData:publicPackage(base)};
};
const fails=(r,code)=>assert.throws(()=>publicReleaseCandidate(r),{code});

test('only a known explicitly reviewed canonical identity can pass the future release gate',()=>{
  const candidate=publicReleaseCandidate(record());
  assert.equal(candidate.canonicalEntityId,'DAN-001');
  assert.equal(candidate.jsonldId,'https://aio-code.vercel.app/entities/danisan/#DAN-001');
  assert.equal(candidate.publicPage,'https://aio-code.vercel.app/entities/danisan/');
  const value=JSON.stringify(candidate);
  assert.equal(value.includes('ENT-11111111-1111-4111-8111-111111111111'),false);
  assert.equal(value.includes('PRIVATE-HOLDER-ONLY'),false);
  assert.equal(value.includes('PRIVATE-INTERNAL-ONLY'),false);
});

test('unlinked laboratory-style packet is private only, regardless of approval status',()=>{
  const data={...doc(),canonicalEntityId:null,canonicalName:'Laboratorio Prisma — PRUEBA FICTICIA',
    type:'organization',officialUrls:[],publicFields:['alternateNames','areas']};
  const r=record(data);
  assert.ok(r.packageData.entity.id.startsWith('ENT-')); // existing private behavior unchanged
  fails(r,'public_release_requires_canonical_identity');
});

test('reject a canonical identifier that is not in the reviewed public target registry',()=>{
  const d={...doc(),canonicalEntityId:'DEMO-001'};
  fails(record(d),'public_release_requires_reviewed_page');
});

test('reject an impersonating name, mismatched type or unauthorized page selection',()=>{
  const wrongName={...doc(),canonicalName:'Other Danisan'};
  fails(record(wrongName),'public_release_requires_reviewed_page');
  const wrongType={...doc(),type:'organization'};
  fails(record(wrongType),'public_release_requires_reviewed_page');
  const noPage={...doc(),publicFields:[]};
  fails(record(noPage),'public_release_requires_reviewed_page');
  const anotherFirst={...doc(),officialUrls:['https://example.com/','https://aio-code.vercel.app/entities/danisan/']};
  fails(record(anotherFirst),'public_release_requires_reviewed_page');
});

test('reject unapproved, edited, archived or materially changed revisions',()=>{
  const approved=record();
  fails({...approved,status:'approved'},'public_release_requires_current_approval');
  fails({...approved,status:'archived',approvedVersion:null,approvedDataHash:null,packageData:null},'public_release_requires_current_approval');
  fails({...approved,approvedDataHash:hash('wrong')},'public_release_requires_current_approval');
  fails({...approved,data:{...approved.data,description:'Modified without new approval'}},'public_release_requires_current_approval');
  fails({...approved,publicUrl:'https://example.com/unauthorized'},'public_release_requires_current_approval');
});

test('reject stale, substituted, or private-data-bearing saved public packages',()=>{
  const valid=record();
  fails({...valid,packageData:{...valid.packageData,notice:'A different notice'}},'public_release_package_drift');
  fails({...valid,packageData:{...valid.packageData,entity:{...valid.packageData.entity,rightsHolder:'PRIVATE-HOLDER-ONLY'}}},'public_release_package_drift');
  const d={...doc(),description:'Private identifier ENT-11111111-1111-4111-8111-111111111111'};
  fails(record(d),'public_release_private_id_detected');
});
