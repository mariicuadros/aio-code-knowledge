import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hash, publicPackage } from '../lib/entity-domain.mjs';
import { preparePublicUpdateProposal,previewReviewedCandidate,PROPOSAL_SCHEMA } from '../lib/public-update-proposal.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const publicDoc=JSON.parse(readFileSync(new URL('../entities/danisan/technical/jsonld/danisan.jsonld',import.meta.url),'utf8'));
const platforms=JSON.parse(readFileSync(new URL('../entity/content/DAN-001/platforms.json',import.meta.url),'utf8'));
function approvedFixture() {
  const data={
    canonicalEntityId:'DAN-001',canonicalName:'DANISAN',type:'person',
    description:'Approved public test biography (synthetic).',
    alternateNames:['Daniela Sánchez','Danisan'],
    areas:['Model','Creative'],
    officialUrls:['https://aio-code.vercel.app/entities/danisan/'],
    socials:platforms.platforms.map(s=>({platform:s.platform_name,alias:'synthetic',url:s.url})),
    publicFields:['alternateNames','areas','officialUrls','socials'],
    rightsHolder:'PRIVATE-RIGHTS-CANARY',
    typeDetail:'PRIVATE-NOTES-CANARY',
    claims:[{claim:'PRIVATE-CLAIM-CANARY'}]
  };
  const record={id:'ENT-11111111-1111-4111-8111-111111111111',version:7,status:'pending_deployment',approvedVersion:3,data,approvedDataHash:hash(data)};
  record.packageData=publicPackage(record);
  return record;
}
const propose=r=>preparePublicUpdateProposal({record:r,root});

test('verified approved revision creates a local review proposal; does not leak private fields',()=>{
  const record=approvedFixture();
  const original=JSON.stringify(publicDoc);
  const result=propose(record);
  assert.equal(result.schema,PROPOSAL_SCHEMA);
  assert.equal(result.status,'requires_manual_review');
  assert.equal(result.entityId,'DAN-001');
  assert.equal(result.source.recordVersion,7);
  assert.equal(result.source.approvedVersion,3);
  assert.deepEqual(result.blocks,[]);
  assert.deepEqual(result.changes.map(c=>c.field),['description','alternateName','keywords']);
  assert.ok(result.protectedFields.includes('jobTitle'));
  assert.ok(result.protectedFields.includes('image'));
  const report=JSON.stringify(result);
  for(const forbidden of ['PRIVATE-RIGHTS-CANARY','PRIVATE-NOTES-CANARY','PRIVATE-CLAIM-CANARY',record.id,record.approvedDataHash]) {
    assert.equal(report.includes(forbidden),false,'private value leaked');
  }
  assert.equal(JSON.stringify(publicDoc),original,'baseline must not mutate');
});
test('human-selected preview changes only approved editorial fields, preserving richer public data',()=>{
  const proposal=propose(approvedFixture());
  const original=structuredClone(publicDoc);
  const candidate=previewReviewedCandidate({proposal,currentDocument:publicDoc,acceptedFields:['alternateName','keywords']});
  assert.deepEqual(candidate.alternateName,['Daniela Sánchez','Danisan']);
  assert.equal(candidate.keywords,'Model, Creative');
  assert.equal(candidate.description,publicDoc.description);
  for(const field of ['@id','identifier','url','sameAs','name','jobTitle','knowsAbout','hasOccupation','image'])assert.deepEqual(candidate[field],publicDoc[field],field);
  assert.deepEqual(publicDoc,original,'input was modified');
});
test('an approval, package or status mismatch prevents an update proposal',()=>{
  const tampered=approvedFixture();
  tampered.data.description='Changed after approval';
  assert.throws(()=>propose(tampered),{code:'approval_hash_mismatch'});
  const broken=approvedFixture();
  broken.packageData.jsonld.identifier='ENT-111';
  assert.throws(()=>propose(broken),{code:'approved_projection_mismatch'});
  const archived=approvedFixture();archived.status='archived';
  assert.throws(()=>propose(archived),{code:'approved_revision_required'});
  const wrong=approvedFixture();wrong.data.canonicalEntityId='DEMO-001';
  assert.throws(()=>propose(wrong),{code:'approval_hash_mismatch'});
});
test('external social link changes require coordinated manual review before any candidate',()=>{
  const record=approvedFixture();
  record.data.socials[0].url='https://example.com/other';
  record.approvedDataHash=hash(record.data);
  record.packageData=publicPackage(record);
  const proposal=propose(record);
  assert.ok(proposal.blocks.includes('social_changes_require_coordinated_page_and_platform_update'));
  assert.ok(proposal.changes.some(c=>c.field==='sameAs'));
  assert.throws(()=>previewReviewedCandidate({proposal,currentDocument:publicDoc,acceptedFields:['description']}),{code:'invalid_review_state'});
});
test('rejects stale source document, duplicate review fields and unlisted changes',()=>{
  const proposal=propose(approvedFixture());
  assert.throws(()=>previewReviewedCandidate({proposal,currentDocument:{...publicDoc,name:'Unreviewed edit'},acceptedFields:['description']}),{code:'public_baseline_changed'});
  assert.throws(()=>previewReviewedCandidate({proposal,currentDocument:publicDoc,acceptedFields:['sameAs']}),{code:'field_requires_separate_review'});
  assert.throws(()=>previewReviewedCandidate({proposal,currentDocument:publicDoc,acceptedFields:['description','description']}),{code:'field_requires_separate_review'});
  assert.throws(()=>previewReviewedCandidate({proposal,currentDocument:publicDoc,acceptedFields:['jobTitle']}),{code:'field_requires_separate_review'});
});
