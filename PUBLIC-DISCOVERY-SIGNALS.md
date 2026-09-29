# Public discovery signals

**Updated:** 2026-09-29

This record explains the public machine-readable signals in the AIO CODE Entity Home. It is an implementation note, not a promise that a search engine or AI provider will crawl, index, retrieve or cite every source.

## Current inventory

| Signal | Status | Function |
| --- | --- | --- |
| `robots.txt` | Published | Allows public crawling and points to the sitemap. The project currently keeps the site open to retrieval and citation crawlers. |
| `sitemap.xml` | Published | Lists the public Entity Home, entity pages, RAG page and checker. |
| `llms.txt` | Published; `https://aio-code.vercel.app/llms.txt` returned HTTP 200 on 2026-09-29 | Concise, human and machine-readable orientation to the current system definition, phase state and canonical URLs. |
| JSON-LD | Published; current AIO and Marii markup parsed on 2026-09-29 | Gives the Entity Home and person page stable schema identifiers and relationships. |
| Answer-first architecture | Defined | `RESEARCH-ARCHITECTURE.md` and `semantic/search-map-v1.json` map direct questions to bounded answers and evidence. |
| Public RAG passages | Published 171-passage index; first verified at deployment `dpl_HsU3B4hN4Fd1DfmS17tCgp1f2VvF` | `rag/public-index-v0.json` exposes approved passages and source references for local retrieval. Recovery checks do not measure answer accuracy. |
| Prompt Registry | Published | `prompt-registry-v1.json` freezes controlled observation questions. It is a measurement registry, not a guarantee of prompt seeding in third-party systems. |
| Observatory | Published | Records prompts, conditions, answers, citations, interventions and evidence state. |

## Terminology boundary

“Answer-first chunks” describes an information architecture already present in the semantic map and RAG corpus: question, direct answer, evidence, method component, boundary and source. It is not a separate hosted product or route.

“Prompt seeding” is not treated as a hidden way to manipulate external models. AIO CODE publishes clear, source-backed definitions and uses fixed prompts to observe what external systems return. Any future content experiment must receive its own intervention ID and observation window.

“AI Overview” is an external surface observed by the Observatory. It is not an AIO CODE implementation and cannot be enabled or guaranteed by a repository file.

## Release boundary

The new `llms.txt` file is a discovery aid. It does not replace the Entity Home, JSON-LD, sitemap, robots policy, canonical source records or Observatory. Its presence does not certify provider indexing or citation.

Deployment IDs in dated interventions identify the artifacts verified during those events. The [production deployment ledger](https://github.com/mariicuadros/aio-code-knowledge/issues/7) records the current production alias after each publication without causing a new deployment merely to document its own ID.
