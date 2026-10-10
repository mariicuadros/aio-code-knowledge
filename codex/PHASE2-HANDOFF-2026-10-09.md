# Phase 2 / Codex handoff — 2026-10-09

This folder is a *review candidate*, **NOT a deployed or GitHub-synced repository**. It was copied from the user-uploaded ZIP with `.git` removed to protect Git history and avoid overwriting uncommitted changes.

## Non-negotiable identity decisions
- AIO CODE (AIO-001) is a **Digital Entity Operating System (DEOS)**; *not* a methodology. Methodology is a subordinate component. Preserve historical documents as historical.
- Marii Cuadros (MC-001) = Person; OZCU-001 = declared venture/company identity, not necessarily a legally registered entity; AIO-001 remains primary public brand. NUX and VOID MODE stay distinct.
- Cuadros María Luisa and Mari Chordà are *confusable external entities*, not MC-001 aliases or sameAs.
- Do not claim external search engine rankings, Knowledge Graph merges, indexing, social account ownership or causation without evidence.

## Changes in this review candidate
See `codex/PHASE2-CHANGE-MANIFEST-2026-10-09.json`. HTML Open Graph without invented image; stronger public identity boundaries; `identity/confusable-entities.json`; historical spec warning; three phase-2 observations; automated regression tests.

## Codex procedure in the user's real cloned repository
1. BACK UP working tree including uncommitted edits and `git status --short` first. Do not use force reset/clean. Compare ZIP snapshot against GitHub main, PRs and production.
2. Copy ONLY the manifest-listed changed files after reviewing diffs; do not overwrite newer branches blindly.
3. Run `python -m unittest discover -s tests -p 'test_*.py'` (if Python available), `node scripts/validate_precontent.mjs`, and `npm ci` followed by relevant gateway checks when dependencies permit.
4. Audit all entity IDs, URL redirects, actual social account ownership, Google/Bing console verification, Meta Page connections and Vercel published HTML. Unsupported remote verifications must be reported as pending.
5. Make one reviewable PR; deploy only after tests, security inspection, and user approval.

## Next-pass manual audit
- Real domain canonical HTTP status and social profiles; decide whether to keep `CreativeWork` for documented DEOS or use `SoftwareApplication` **only if genuinely supported**. Never claim it is a computer OS.
- Verify Open Graph image file availability before adding `og:image`.
- Verify published canonical pages, sitemap, noindex/robots, Bing/Google console, Meta search observations.
- Evaluate current/historical filters in RAG and Hugging Face exports, plus all remaining stale terms and user-facing page copies.
- Instagram collectors, authentication and Vercel deployment remain unverified: never embed API tokens or passwords in files.
