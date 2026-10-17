import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { comparePublicEntity } from '../scripts/check_public_entity_sync.mjs';

const source=JSON.parse(readFileSync(new URL('../entity/content/DAN-001/platforms.json',import.meta.url),'utf8'));
function samplePackage(){
  return {
    entity:{id:'DAN-001',canonicalName:'DANISAN',type:'person',description:'Synthetic test, not a real person record'},
    jsonld:{
      '@context':'https://schema.org',
      '@type':'Person',
      identifier:'DAN-001',
      name:'DANISAN',
      description:'Synthetic test, not a real person record',
      url:'https://aio-code.vercel.app/entities/danisan/',
      sameAs:source.platforms.map(p=>p.url)
    },
    notice:'Synthetic public-only fixture'
  };
}
test('public DAN-001 page, JSON-LD and platform registry share identity and URLs',()=>{
  const result=comparePublicEntity();
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.deepEqual(result.errors,[]);
  assert.equal(result.linkedProfiles,7);
});
test('approved sanitized package parity is read-only, and editorial wording is a warning',()=>{
  const result=comparePublicEntity({approvedPackage:samplePackage()});
  assert.equal(result.ok,true,JSON.stringify(result.errors));
  assert.ok(result.warnings.includes('package_person_uri_needs_review'));
  assert.ok(result.warnings.includes('editorial_biography_differs'));
});
test('detects identity, social and private field errors without returning private field values',()=>{
  const modified=samplePackage();
  modified.jsonld.sameAs[0]='https://example.com/different';
  modified.entity.id='ENT-11111111-1111-4111-8111-111111111111';
  modified.entity.rightsHolder='PRIVATE-DO-NOT-LEAK';
  const result=comparePublicEntity({approvedPackage:modified});
  assert.equal(result.ok,false);
  assert.ok(result.errors.includes('package_not_sanitized_projection'));
  assert.equal(JSON.stringify(result).includes('PRIVATE-DO-NOT-LEAK'),false);
});
test('rejects unregistered identities instead of inventing canonical URIs',()=>{
  assert.deepEqual(comparePublicEntity({id:'DEMO-001'}).errors,['unregistered_entity']);
});
