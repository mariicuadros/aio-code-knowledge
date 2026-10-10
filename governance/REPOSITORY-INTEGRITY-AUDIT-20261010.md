# Repository Integrity Audit — 2026-10-10

**Branch:** `codex/hf-journal-release-audit-20261010`  
**Scope:** full repository structural/machine-readable pass plus targeted canonical/social/media corrections.

## Inventory at audit cut

- 420 repository blobs
- 121 JSON/JSON-LD files
- 1 JSONL append-only journal source
- 125 Markdown files
- 78 image files
- 1 MP4 media file

## Corrections performed

1. Catalogued the AIO CODE Instagram carousel archive: 63 media assets (62 images + 1 MP4), preserving original filenames and not inferring publication timestamps from date-like labels.
2. Corrected AIO Instagram living descriptions from methodology-oriented wording to current Digital Entity Operating System terminology.
3. Marked the empty generic posts registry as reserved instead of observed media; current archived media points to the carousel registry/manifest.
4. Added repository-wide media binary validation: PNG/JPEG signatures and dimensions; MP4 `ftyp` header; zero-byte media rejected.
5. Enforced exact Facebook manifest/image/record counts and exact carousel manifest/directory membership.
6. Enforced canonical five-entity types, MC canonical + alternate full name separation, sameAs equality and confusable-name exclusion.
7. Enforced platform registry URLs against the canonical public asset inventory for MC-001 and AIO-001.
8. Enforced controlled vocabulary enum equality with Brain schema definitions.
9. Removed stale `.gitkeep` placeholders from populated directories; retained placeholders only for reserved empty directories.
10. Added path-reference validation while explicitly exempting private vault/restricted paths from public-file existence requirements.
11. Added AIO-JOURNAL-015 and corrected the generated Journal card update date without editing historical journal rows.
12. Updated Phase-2 backlog so Blogger, IndexNow, Meta Insights and downstream integrations are not mislabeled as Phase-1 incompleteness.

## What CI proves

CI proves the repository's machine-readable structures, references, media binary integrity and documented identity contracts are internally coherent at the tested commit.

It does **not** prove visual/semantic truth of every image, ownership/existence of every third-party social account at request time, third-party AI indexing, Meta API access, Blogger live installation or IndexNow acceptance. Those remain external operational checks.

## Merge criterion

PR #16 is mergeable only after the latest head passes the complete existing CI plus `audit_repository_integrity.py`. After merge, run the separately approved Hugging Face workflow for the exact main SHA and verify Entities + Journal public metadata before proceeding to Blogger.
