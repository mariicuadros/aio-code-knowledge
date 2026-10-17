import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, root), 'utf8');
const id = 'https://aio-code.vercel.app/entities/danisan/#DAN-001';
const url = 'https://aio-code.vercel.app/entities/danisan/';

test('DAN-001 public identity is consistent and single-canonical', () => {
 const page = read('entities/danisan/index.html');
 const json = JSON.parse(read('entities/danisan/technical/jsonld/danisan.jsonld'));
 const sitemap = read('sitemap.xml');
 const manifest = JSON.parse(read('public-site-manifest.json'));
 assert.equal(json['@id'], id);
 assert.equal(json.url, url);
 assert.equal(json.name, 'DANISAN');
 assert.match(page, /<link rel="canonical" href="https:\/\/aio-code\.vercel\.app\/entities\/danisan\/"/);
 assert.ok(page.includes(id), 'Page must include the reviewed Person ID');
 assert.equal(sitemap.split('<loc>' + url + '</loc>').length-1, 1);
 assert.equal(manifest.files.filter(f=>f==='entities/danisan/index.html').length, 1);
 assert.equal(manifest.files.filter(f=>f==='entities/danisan/technical/jsonld/danisan.jsonld').length, 1);
});

test('No private consent or government document values in public DAN-001 files', () => {
 const publicFiles=['entities/danisan/index.html','entities/danisan/technical/jsonld/danisan.jsonld','entity/ENTITY-PASSPORT-DANISAN.md'];
 for (const file of publicFiles) {
   const data=read(file);
   assert.doesNotMatch(data,/\b(?:PPT|pasaporte|c[eé]dula|n[uú]mero de documento|firma digital|identification number)\s*[:#]/i,file);
   assert.doesNotMatch(data,/AIO-DAN-001-CONSENT-v2\.0/i,file);
 }
});

test('Blogger draft remains excluded from public deployment allowlist',()=>{
 const files=JSON.parse(read('public-site-manifest.json')).files;
 assert.ok(!files.includes('staging/blogger-danisan-draft-20261017.md'));
});
