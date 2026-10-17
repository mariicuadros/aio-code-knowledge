/**
 * Explicit, reviewed public canonical targets.
 * No inferred URL, no private Vault record ID, and no automatic publication.
 */
export const PUBLIC_IDENTITY_TARGETS=Object.freeze({
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
export function publicCanonicalTarget(entity) {
  if(!entity||!Array.isArray(entity.officialUrls))return null;
  const target=PUBLIC_IDENTITY_TARGETS[entity.id];
  const type={person:'Person',organization:'Organization',project:'CreativeWork',creative:'CreativeWork'}[entity.type];
  if(!target||target.name!==entity.canonicalName||target.type!==type||!entity.officialUrls.includes(target.pageUrl))return null;
  return target;
}
