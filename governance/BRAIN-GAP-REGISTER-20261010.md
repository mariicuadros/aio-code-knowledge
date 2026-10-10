# AIO CODE — Brain gap register, 2026-10-10

Status: **Phase 2 operational backlog after repository-integrity closure.** The canonical repository no longer treats the items corrected in PR #15 as open Phase-1 work. Historical evidence remains frozen; unresolved items below are Phase-2 integrations or external publication checks.

| ID | Area | Finding | Current status/action |
|---|---|---|---|
| GAP-01 | MC-001 identity | Full name / strategist role alignment | **RESOLVED.** Marii Cuadros remains canonical public name; Maria Alejandra Cuadros Lozada is the same MC-001 person's alternate full name. JSON-LD/schema/sameAs regression checks are active. |
| GAP-02 | VOID-001 | Creative system blended with MC-specific aesthetic | **RESOLVED in canonical repo and Vercel production.** Standalone Entity Home + JSON-LD exist; MC's narrative universe is explicitly separated. |
| GAP-03 | Baseline | Contradictory frozen state | **RESOLVED.** Historical matrix remains frozen partial 14/49; missing observations are not failures or zeroes. |
| GAP-04 | RAG | Current answers used superseded identity text | **RESOLVED internally.** Answer policy, semantic evaluation and public index pass CI. This does not prove third-party AI retrieval. |
| GAP-05 | RAG provenance | Canonical edits can stale the public index | **CONTROLLED.** CI requires exact-source index freshness and fails canonical edits until rebuilt. |
| GAP-06 | Metrics | Instagram Views and API-version changes | **DOCUMENTED / PHASE 2.** Views is tracked separately from reach, followers, saves, shares and watch/retention metrics. |
| GAP-07 | Followers hypothesis | Possible future removal of follower counts | **UNVERIFIED HYPOTHESIS.** No architecture or claim depends on it. |
| GAP-08 | Release | PR #15 publication | **RESOLVED.** PR #15 merged to main at `277ec5a968bff0c8b39ff85677a75a0531d25dbb`; Vercel production deployment `dpl_BKtuzsM3YM9MhiheF7AkU8ZxLtd9` reached READY. |
| GAP-09 | Cohort intake | Participant rights / isolation | **PHASE 2 PENDING.** Validate consent, rights scope and cross-entity non-leakage before real participant ingestion. |
| GAP-10 | Meta Insights | Endpoint + private Ledger not proven end-to-end | **PHASE 2 PENDING.** PR #10 remains draft; test authorized real capture privately, then dashboard. |
| GAP-11 | IndexNow | Key/host/submission module absent | **PHASE 2 PENDING.** Implement only after canonical production URLs and Blogger update; acceptance is not indexing proof. |
| GAP-12 | Historical coverage | 14/49 misread as accuracy | **CONTROLLED.** CI/docs preserve it as capture coverage only. |
| GAP-13 | Repository media/catalogue | Archived Instagram media existed without exact inventory; stale .gitkeep files remained in populated folders | **RESOLVED IN PR #16.** Added 63-item carousel media manifest (62 images + 1 MP4), binary header/dimension validation, and removed stale placeholders. |
| GAP-14 | Hugging Face Journal chronology | Journal card/addendum did not document Oct-10 release and retained old update date | **RESOLVED IN PR #16 SOURCE.** AIO-JOURNAL-015 + current card update date prepared; publish after merge via the existing SHA-gated workflow. |
| GAP-15 | Blogger | Live site still has older MC/VOID wording | **PHASE 2 PUBLICATION PENDING.** Corrected 2026-10-10 theme is versioned and tested; back up live installed theme, install only after approval, then verify source/JSON-LD/mobile/desktop. |

## Repository integrity gate

PR #16 adds `scripts/audit_repository_integrity.py` to required CI. It checks all repository JSON/JSON-LD and JSONL syntax, internal repository references while respecting private vault paths, canonical entity types, social platform URLs, MC sameAs/name boundaries, vocabulary/schema enum drift, media signatures/dimensions/manifests, and active-folder placement rules.

The audit covers **repository structure and binary integrity**. It does not claim that every image's visual meaning, every external social account, or every third-party AI response is independently verified by CI.

**Phase boundary:** do not reopen Phase 1 because a Phase-2 connector, Blogger publication, IndexNow submission or external verification remains pending. Those are operational Phase-2 tasks unless new evidence invalidates a frozen historical record.
