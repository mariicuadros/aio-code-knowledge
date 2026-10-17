/**
 * Read-only cross-surface identity check. Never reads GitHub Vault, writes public
 * files, fetches private URLs, or treats a matching projection as legal approval.
 * Optional --package accepts ONLY a sanitized packageData export, outside Git.
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const TARGETS=Object.freeze({
  'DAN-001':Object.freeze({
    name:'DANISAN',
    type:'Person',
    pageUrl:'https://aio-code.vercel.app/entities/danisan/',
    personId:'https://aio-code.vercel.app/entities/danisan/#DAN-001',
    pagePath:'entities/danisan/index.html',
    jsonldPath:'entities/danisan/technical/jsonld/danisan.jsonld',
    platformsPath:'entity/content/DAN-001/platforms.json',
  }),
});
const ALLOWED_PUBLIC_FIELDS=new Set(['id','canonicalName','type','description','alternateNames','areas','officialUrls','socials','location','relationships']);
const ALLOWED_PACKAGE_FIELDS=new Set(['entity','jsonld','notice']);
function json(root,path) { return JSON.parse(readFileSync(resolve(root,path),'utf8')); }
function ids(document) {
  if(typeof document.identifier==='string') return document.identifier;
  if(document.identifier?.propertyID==='AIO-CODE-ENTITY-ID')return document.identifier.value;
  return null;
}
function sameSet(a,b) {return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&new Set(a).size===a.length&&new Set(b).size===b.length&&a.every(x=>b.includes(x));}
function embeddedPerson(html) {
  const scripts=[...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for(const m of scripts) {
    const parsed=JSON.parse(m[1]);
    const person=parsed.mainEntity || (parsed['@type']==='Person'?parsed:null);
    if(person?.['@type']==='Person') return person;
  }
  return null;
}
/** No free-form private values are returned by this comparison. */
export function comparePublicEntity({id='DAN-001',root=ROOT,approvedPackage=null}={}) {
  const target=TARGETS[id];
  if(!target)return {ok:false,errors:['unregistered_entity'],warnings:[]};
  const errors=[],warnings=[];
  const check=(condition,code)=>{if(!condition)errors.push(code);};
  const schema=json(root,target.jsonldPath);
  const platforms=json(root,target.platformsPath);
  const html=readFileSync(resolve(root,target.pagePath),'utf8');
  const embedded=embeddedPerson(html);
  const links=platforms.platforms.map(s=>s.url);
  check(platforms.entity_id===id,'platform_entity_id_mismatch');
  check(platforms.platforms.every(s=>s.canonical_entity_id===id),'platform_relation_mismatch');
  check(schema['@type']===target.type,'schema_type_mismatch');
  check(schema['@id']===target.personId,'schema_person_uri_mismatch');
  check(ids(schema)===id,'schema_identifier_mismatch');
  check(schema.url===target.pageUrl,'schema_page_url_mismatch');
  check(schema.name===target.name,'schema_name_mismatch');
  check(sameSet(schema.sameAs,links),'schema_profile_links_mismatch');
  check(Boolean(embedded),'page_missing_person_jsonld');
  if(embedded) {
    check(embedded['@id']===target.personId,'page_person_uri_mismatch');
    check(ids(embedded)===id,'page_identifier_mismatch');
    check(embedded.name===target.name,'page_name_mismatch');
    check(sameSet(embedded.sameAs,links),'page_profile_links_mismatch');
  }
  check(html.includes('<link rel="canonical" href="'+target.pageUrl+'">'),'page_canonical_link_mismatch');
  if(approvedPackage!==null) {
    const p=approvedPackage,e=p?.entity,j=p?.jsonld;
    const shape=p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).every(k=>ALLOWED_PACKAGE_FIELDS.has(k))&&e&&j&&typeof e==='object'&&typeof j==='object'&&Object.keys(e).every(k=>ALLOWED_PUBLIC_FIELDS.has(k));
    check(Boolean(shape),'package_not_sanitized_projection');
    if(shape) {
      check(e.id===id&&j.identifier===id,'package_canonical_id_mismatch');
      check(e.canonicalName===target.name&&j.name===target.name,'package_name_mismatch');
      check(j['@type']===target.type,'package_type_mismatch');
      check(j.url===target.pageUrl,'package_page_url_mismatch');
      check(sameSet(j.sameAs,links),'package_profile_links_mismatch');
      check(!JSON.stringify(p).includes('ENT-'),'private_record_id_in_package');
      if(j['@id']!==target.personId)warnings.push('package_person_uri_needs_review');
      if(JSON.stringify(j.description)!==JSON.stringify(schema.description))warnings.push('editorial_biography_differs');
    }
  }
  return {ok:errors.length===0,errors,warnings,entityId:id,linkedProfiles:links.length};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const args=process.argv.slice(2);let approvedPackage=null;
  try {
    if(args.length!==0) {
      if(args.length!==2||args[0]!=='--package'||!isAbsolute(args[1]))throw Error('invalid_args');
      const target=resolve(args[1]),rel=relative(ROOT,target);
      if(!rel.startsWith('..')&&rel!=='.')throw Error('private_package_must_be_outside_git');
      approvedPackage=JSON.parse(readFileSync(target,'utf8'));
    }
    const result=comparePublicEntity({approvedPackage});
    console.log(JSON.stringify(result));
    if(!result.ok)process.exitCode=1;
  } catch {
    console.error('entity_sync_audit_failed: invalid input or unreadable audit sources (no private values logged)');
    process.exitCode=1;
  }
}
