# Methodology Change Log

The changes here repair AIO CODE's own documentation and data contracts. They are **not** observations that an external AI system changed and must not be credited as evidence that a platform improved entity resolution.

## METH-20260924-001 — Pre-baseline repository consistency repair

- **Recorded:** 2026-09-24 (date only; commit timestamp is the authoritative publication time).
- **Operator:** AIO CODE / ChatGPT, at Marii Cuadros's request.
- **Status:** correction documented; the commit containing this record provides the publication timestamp and version.
- **Scope:** canonical type for AIO-001 in `entity-graph.json`; missing relationship reference in `ENTITY-MASTER-RECORD.md`; stale baseline/recognition language in docs; machine-readable Claim Ledger, Observatory and Baseline schemas; personal-repository README definition; RAG readiness audit.
- **Before:** the new v1 docs and data objects disagreed with older schemas and descriptions. The empirical baseline had no records.
- **After:** the affected source files and this log identify one consistent contract. The baseline **still has no empirical records**.
- **Expected external effect:** none claimed. These public edits can themselves be retrieved later; record their commit IDs and treat the publication as a potential exposure/confounder for any future observation window.
- **Observed external effect:** not measured.
- **Classification:** `methodology_correction`, under `INTERVENTION-PROTOCOL-v1.md`.
- **Cross-repository change:** the personal `marii-cuadros/README.md` definition is aligned separately; record its commit ID alongside this one.

No existing historical observation, prompt text or content publication date is rewritten by this correction.

## METH-20260924-002 — Public RAG and first Observatory measurement tools

- **Recorded:** 2026-09-24; the publishing commit records the precise time.
- **Scope:** approved public corpus, lexical retrieval, pinned source citations, 24 question retrieval set, optional review-only generation, first-baseline measurement plan and capture/report/freeze tools.
- **Status:** local implementation with source retrieval validation; external AI measurements and generated-answer support evaluation have not yet happened.
- **Website:** public entity pages and JSON-LD ID alignment are a material public exposure change recorded separately under `observatory/interventions/INT-MC-001-20260924-001.json`.
- **Evidence boundary:** neither a corpus hit nor a new entity page proves that external AI recognizes or cites the entity.
