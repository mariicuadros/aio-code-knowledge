import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPublicCreatorPassport} from '../lib/creator-passport-public-v0.1.mjs';
const entity={entityId:'MC-001',canonicalName:'Fictitious Creator',reviewStatus:'approved',visibility:'approved_public',officialProfiles:['https://example.com/profile','http://invalid.test','https://example.org/u'] ,privateContact:'private@secret.invalid'};
const work={schemaVersion:'0.1.0',kind:'CreativeWork',recordId:'WORK-001',responsibleEntityId:'MC-001',createdAt:'2026-10-18T10:00:00Z',revision:1,visibility:'approved_public',reviewStatus:'approved',evidenceRefs:['PRIVATE-001'],creatorEntityIds:['MC-001'],title:'Demo work',workType:'music',publicationUrls:['https://example.com/demo','http://invalid.test'],rightsStatementIds:['SECRET-RIGHTS'],privateContract:'SECRET-CONTRACT',prompts:['SECRET-PROMPT']};
const run=(e=entity,w=[work],workIds=['WORK-001'],fields=['canonicalName','officialProfiles'])=>buildPublicCreatorPassport({entity:e,works:w,approvedWorkIds:workIds,approvedEntityFields:fields});
test('public projection contains only allowlisted safe fields',()=>{
 const result=run();const json=JSON.stringify(result);
 assert.equal(result.entityId,'MC-001');assert.equal(result.name,'Fictitious Creator');assert.deepEqual(result.sameAs,['https://example.com/profile','https://example.org/u']);assert.deepEqual(result.works[0].publicationUrls,['https://example.com/demo']);
 for(const secret of ['SECRET-CONTRACT','SECRET-PROMPT','SECRET-RIGHTS','PRIVATE-001','private@secret.invalid','responsibleEntityId'])assert.equal(json.includes(secret),false);
});
test('unapproved entity is denied',()=>assert.throws(()=>run({...entity,reviewStatus:'draft'})));
test('private entity is denied',()=>assert.throws(()=>run({...entity,visibility:'private'})));
test('unapproved work cannot export',()=>assert.throws(()=>run(entity,[{...work,reviewStatus:'draft'}])));
test('private work cannot export',()=>assert.throws(()=>run(entity,[{...work,visibility:'private'}])));
test('unrelated work cannot export',()=>assert.throws(()=>run(entity,[{...work,creatorEntityIds:['DAN-001']}])));
test('unselected work is excluded',()=>assert.equal(run(entity,[work],[]).works.length,0));
test('entity profile details require explicit field authorization',()=>{const p=run(entity,[work],['WORK-001'],[]);assert.equal(p.name,undefined);assert.equal(p.sameAs,undefined)});
test('source records remain unchanged',()=>{const copy=JSON.stringify(work);run();assert.equal(JSON.stringify(work),copy)});
