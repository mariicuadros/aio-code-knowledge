# AIO CODE — Brain gap register, 2026-10-10

Status: ongoing targeted review, not a complete file-by-file independent audit or production approval.

| ID | Area | Finding | Status/action |
|---|---|---|---|
| GAP-01 | MC-001 | Public name and full name absent from aligned schemas; digital strategist role missing | Corrected in PR #15: canonical Marii Cuadros, owner-declared full name Maria Alejandra Cuadros Lozada; consistent same person ID |
| GAP-02 | VOID-001 | Creative system blended with MC-001 aesthetic and narrative | Corrected definition in PR #15; separate public Entity Home and JSON-LD still required |
| GAP-03 | Master | Contradictory baseline `not_frozen` and `empty` | Corrected in PR #15, historical frozen 14/49 untouched |
| GAP-04 | RAG | Approved MC and VOID exact answers still pointed to superseded text | Reviewed answer policy and semantic test expectations updated; live retrieval and CI still must pass |
| GAP-05 | RAG freshness | Canonical source edits invalidate public index blob provenance | BLOCKER. Regenerate index from exact approved checkout and run --check; never bypass or fabricate commit metadata |
| GAP-06 | Metrics | Instagram Views is primary content visibility metric; version-dependent API field deprecations | Documented in analytics and measurement protocol; retain reach, followers, saves, shares, watch time separately |
| GAP-07 | Hypothesis | Possible removal of follower counts | NOT VERIFIED. Record only as user hypothesis; no product change based on predicted removal |
| GAP-08 | CI and public release | Draft PR #15 needs full green CI, public-surface review and gated API verification | NO-GO until evidence; no merge or deploy |
| GAP-09 | Cohort intake | Participant consent/rights and cross-entity isolation not yet verified end-to-end | P1 validation work; test separate participant data flows and non-leakage |
| GAP-10 | Actual performance | Meta Insights endpoint and private ledger linkage not proven operational | P1 integration test with authorized credentials; never place secrets in Git |
| GAP-11 | IndexNow | Verification key and approved-URL submission endpoint still absent | Future gated module, not proof of AI ingestion or indexing |
| GAP-12 | Historical coverage | 14/49 historical capture count is not a recognition accuracy rate | Keep frozen; separately version Phase-2 measurement windows |

External evidence: Meta public 2026 performance statement https://about.fb.com/news/2026/01/2026-ai-drives-performance/ ; historical API metric replacement report https://support.supermetrics.com/support/solutions/articles/19000164739-instagram-insights-field-changes-march-25-2025 . The owner's discussion with Meta was not independently captured or verified.

Important boundary: update living guidance, not frozen observations, screenshots or historical model outputs. Production promotion, secrets, payment actions, HF sync and branch merge require separate approval.
