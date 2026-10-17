# DAN-001 public projection comparison — 2026-10-17

Source A: user-provided JSON-LD shown in authenticated Entity Console, approved revision 3, status `pending_deployment`.
Source B: `entities/danisan/technical/jsonld/danisan.jsonld` in GitHub preparation branch.

## Matches
- `@type = Person`, name DANISAN.
- Person `@id = https://aio-code.vercel.app/entities/danisan/#DAN-001`.
- `url = https://aio-code.vercel.app/entities/danisan/`.
- Same seven `sameAs` profile URLs and ordering.

## Differences requiring explicit editorial review (DO NOT silently overwrite)
- Console identifier is a string `DAN-001`; site uses Schema.org PropertyValue with ID DAN-001.
- Console alternateName is an array of three aliases; site is a single alias.
- Console description is Spanish and includes independence / no legal representation clarification; current static site JSON-LD is English.
- Site has `jobTitle`, `knowsAbout`, `hasOccupation`, `image` fields not present in console projection.
- HTML embedded JSON-LD and standalone public JSON-LD should be reconciled to one reviewed identity projection before any release.
- Treat provided console JSON as a reviewed example, not a direct signed blob or independently verified package hash. Exact approved record should be retrieved from private authenticated API during final audit.

## Safeguards
- Do not create another DAN-001.
- Do not overwrite approved revision 3 or regenerate the private package.
- Public staging PR contains no live deployment or indexing requests.
- Retain reviewed canonical identifiers; no contracts, dates of birth, document numbers, signatures, or credentials in public output.
- Before merge verify approved revision/hash, webpage HTML, standalone JSON-LD, sitemap and Blogger draft, then perform tests and manual publish gate.
