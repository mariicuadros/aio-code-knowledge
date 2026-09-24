# AIO CODE — RAG readiness audit

**Date:** 2026-09-24 · **Scope:** the current GitHub repositories and their documented Hugging Face export · **Decision:** **not ready to claim an operational AIO CODE RAG system**.

The workflow targets the public [`aio-code-entities` dataset](https://huggingface.co/datasets/mariicuadros/aio-code-entities), which exists; `aio-code-journal` is a separate dataset. This inspection did not compare every exported file byte-for-byte with GitHub. The export manifest includes a legacy `ER-001` record and an empty baseline container, so simply ingesting the whole export would mix historical narrative and current claims.

## What is being evaluated

RAG here means an **AIO CODE operated assistant** that retrieves controlled source records at query time and supplies them to a model to answer with traceable citations. It is distinct from observing whether ChatGPT, Gemini or another third-party system happens to find public AIO CODE pages. Publishing JSON-LD or a dataset does not install a retriever inside those systems.

The original RAG research combines a generator with retrievable external memory; an implementation still needs a corpus, index/search, retrieval, grounding and evaluation. [Lewis et al., NeurIPS 2020](https://papers.neurips.cc/paper/2020/hash/6b493230205f780e1bc26945df7481e5-Abstract.html). Managed vector stores can chunk, embed and index uploaded documents, but creating files in GitHub does not automatically create such a store. [OpenAI Retrieval guide](https://developers.openai.com/api/docs/guides/retrieval). Citations and retrieved passages should be inspected when evaluating generated answers. [OpenAI File Search guide](https://developers.openai.com/api/docs/guides/tools-file-search).

## Inventory: what exists versus what is missing

| Layer | Observed in repository | Readiness |
| --- | --- | --- |
| Canonical sources | Entity Master Record, passports, Methodology Spec, Evidence Standard, Claim Ledger, graph, Observatory, prompt registry, historical evidence and content registries. | **Present, with governance corrections in this changeset.** |
| Source of truth | README designates `/entity/` for canonical identity and `/entities/` for operational records. | **Specified.** Cross-repo/HF synchronization not independently verified. |
| Evidence boundaries | Claims distinguish first-party definition from independent validation; some historical records use a legacy schema. | **Partial.** Retrieval must expose claim status, evidence state and conflicts. |
| Corpus policy | No manifest selecting authoritative files, exclusion list, license/visibility tier or document freshness for a RAG index. | **Missing.** |
| Extraction and normalization | JSON and Markdown are readable, but no maintained ingestion pipeline maps each passage to entity, claim, source, version and access scope. | **Missing.** |
| Search/index | No vector store, full-text index, embedding generation, lexical fallback or ranking config in the inspected repository. | **Missing.** |
| Query and answer service | No query API or answer generator with citation verification and abstention rules. | **Missing.** |
| Evaluation | Recognition Rubric evaluates external representations; no RAG-specific query set with gold sources, retrieval recall, answer support and outdated/conflicting-source cases. | **Missing.** |
| Version/update cycle | Git commits and dataset export are useful provenance, but no index invalidation/rebuild, deletion or stale-result handling. | **Missing.** |
| Access/privacy | Public repository has a publication policy; no RAG-specific separation of public research versus private client data and consent. | **Missing before client data.** |

## Minimal corpus decision before implementation

For the first **public-only internal prototype**, allow only explicitly selected files from the main repository: current canonical passports, Entity Master Record, Methodology Spec, Evidence Standard, Claim Ledger, graph and v1 protocols. Every indexed document needs `source_path`, `source_url`, `commit_sha`, `document_version`, `entity_id` where relevant, `claim_ids` where available, `published_at_or_unknown`, `visibility`, `evidence_state_or_not_applicable`, and `canonical_or_historical`.

Do not silently ingest all repository files. Keep `evidence/historical/`, old representation narratives, image/video assets, unverified profiles, planned content, private client records and old snapshots out of the default answer corpus. Historical records may be queried separately with their date and legacy status shown. Claims contradicted by newer canonical records should not be silently returned as current facts. Do not duplicate first-party claims and label the copies as independent support.

## First acceptance test

1. Create 20–30 questions covering: current AIO CODE definition; MC-001/AIO-001/NUX-001 distinctions; claims and verification; `ER-001` chronology; baseline status; VOID MODE where sourced; unknown/unanswerable questions; contradictions and stale versions.
2. For each question, declare the expected source path/claim ID **before** tuning search. Include Spanish and English where needed.
3. Measure retrieval (`recall@k` or whether a relevant source reached the supplied context) separately from generation (correctness, passage support, exact citation, appropriate abstention). Review failure cases manually.
4. Require the assistant to say `No hay evidencia suficiente` if no eligible passage supports an answer. Return source path and version/commit, not a fabricated source.
5. Rebuild or incrementally update the index on source changes; confirm replaced/withdrawn claims no longer appear as current answers.

## MVP choice

Start with a small **read-only, public corpus and local lexical search** to prove document eligibility, citations and evaluation. Add semantic/vector search only if the evaluation shows lexical search misses meaningfully relevant passages. This is an implementation choice for this corpus, not a universal RAG requirement. If OpenAI File Search is later chosen, follow its current file/vector-store documentation and evaluate retrieved chunks; do not assume indexing guarantees correct answers.

## Explicit boundaries

- The public AIO CODE methodology can be explained with retrieved project files; that does not imply third-party models will recommend it.
- `ai-social-baseline.json` is an **empty measurement container**. RAG must answer that the empirical MC-001 baseline has not been frozen, even if an older document calls August observations a baseline.
- There is no client-data corpus or access control to audit yet; external pilots need permissions and retention rules before ingestion.
- The historical `observatory/ER-001.json` is preserved as originally recorded; do not backfill missing benchmark fields or treat it as a v1 benchmark run.

## Next gate

RAG is **conceptually feasible** with current materials, but is **not implemented or validated**. The next reviewable artifact is a source manifest and a small question set, followed by a retrieval prototype and measured results. Do not build a full platform or claim RAG readiness before those tests pass.
