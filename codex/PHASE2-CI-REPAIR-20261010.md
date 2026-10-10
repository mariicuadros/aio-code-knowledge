# PR #15 CI repair — 2026-10-10

Branch: `codex/deos-phase2-semantic-audit-20261010`.
Audited remote source commit: `68d9e0bfe0206c5e02c94e97a53ecde86c0d0da5`.

## Cause and correction

GitHub Actions run 38082077501 passed contracts, tests, source validation and retrieval evaluation, then failed public-index freshness. Rebuilt `rag/public-index-v0.json` using `scripts/build_public_rag.py` from the committed approved sources. The 180 passages retain the source commit, source blob hashes, paths and commit-pinned URLs. No builder, evaluation fixture, threshold or source allowlist was weakened.

Windows `core.autocrlf=true` changed intake evidence bytes on checkout and broke the existing SHA-256 assertions. `.gitattributes` disables text conversion for intake JSON. Restored the exact committed bytes; neither evidence content nor expected hashes changed. Also repaired a vacuous name-versus-list assertion to test excluded-name membership in canonical aliases.

## Local verification

- All 68 unittest cases pass: identity, disambiguation, core integrity, Brain, intake, RAG safety and publication boundaries.
- Release safety, core, intake, Brain synthetic contracts, static site and entity validators pass; RAG syntax compilation passes.
- Retrieval: 24 cases, all 21 scored gold-source cases pass.
- Semantic policy: 36/36 queries; 12/12 unsupported drafts rejected, including adversarial cases. No live model generation.
- Public index `--check`: 180 passages valid.
- Gateway and pre-content checks pass, including access gates, 21/21 source recall, case invariance and analytics privacy.
- JavaScript RAG safety passes: 36 queries, 12 rejected drafts, temporal filtering and API abstention.
- Local public build passes: exactly 36 allowlisted files. This does not deploy anything.
- Frozen `ai-social-baseline.json` unchanged: Git blob `3c1c96838ba550429a96e38080ee35d744610b12`; 14 captured / 49 planned, 35 missing.

Canonical identity remains Marii Cuadros / Maria Alejandra Cuadros Lozada, MC-001, with artist, creator, digital model, digital strategist and independent researcher roles. VOID MODE remains an independent creative system rather than MC-001's aesthetic. AIO CODE remains a DEOS. Instagram Views priority does not imply unique reach or an announced removal of followers.

## Human validation still required

The Brain gap register remains the source for open operational work: actual Meta Insights/private ledger integration needs authorized evidence and credentials; participant consent, rights and cross-entity isolation require real end-to-end validation. VOID MODE's separate Entity Home/JSON-LD and the future IndexNow module remain open. These local checks do not establish external AI recognition, legal status, platform configuration or production readiness.

No merge, deployment, secret change or Hugging Face synchronization performed. Remote CI must pass for the pushed correction before review approval.
