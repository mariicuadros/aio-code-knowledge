# Public discovery signals

**Updated:** 2026-09-28

This record explains the public machine-readable signals in the AIO CODE Entity Home. It is an implementation note, not a promise that a search engine or AI provider will crawl, index, retrieve or cite every source.

## Current inventory

| Signal | Status | Function |
| --- | --- | --- |
| `robots.txt` | Published | Allows public crawling and points to the sitemap. The project currently keeps the site open to retrieval and citation crawlers. |
| `sitemap.xml` | Published | Lists the public Entity Home, entity pages, RAG page and checker. |
| `llms.txt` | In repository; public URL returned 404 on 2026-09-28 | Concise, human and machine-readable orientation to the current system definition, phase state and canonical URLs. Requires deployment and HTTP verification. |
| JSON-LD | Published version exists; updated identity links pending deployment | Gives the Entity Home and person page stable schema identifiers and relationships. |
| Answer-first architecture | Defined | `RESEARCH-ARCHITECTURE.md` and `semantic/search-map-v1.json` map direct questions to bounded answers and evidence. |
| Public RAG passages | Published version exists; new 171-passage index pending deployment | `rag/public-index-v0.json` exposes approved passages and source references for local retrieval. |
| Prompt Registry | Published | `prompt-registry-v1.json` freezes controlled observation questions. It is a measurement registry, not a guarantee of prompt seeding in third-party systems. |
| Observatory | Published | Records prompts, conditions, answers, citations, interventions and evidence state. |

## Terminology boundary

“Answer-first chunks” describes an information architecture already present in the semantic map and RAG corpus: question, direct answer, evidence, method component, boundary and source. It is not a separate hosted product or route.

“Prompt seeding” is not treated as a hidden way to manipulate external models. AIO CODE publishes clear, source-backed definitions and uses fixed prompts to observe what external systems return. Any future content experiment must receive its own intervention ID and observation window.

“AI Overview” is an external surface observed by the Observatory. It is not an AIO CODE implementation and cannot be enabled or guaranteed by a repository file.

## Release boundary

The new `llms.txt` file is a discovery aid. It does not replace the Entity Home, JSON-LD, sitemap, robots policy, canonical source records or Observatory. Its presence does not certify provider indexing or citation.
