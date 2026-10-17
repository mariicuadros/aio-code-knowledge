# AIO CODE — engineering agent rules

AIO CODE is a **Digital Entity Operating System (DEOS)**. Its research methodology is a component of this system, not its product category.

Read `audits/2026-10-17/ECOSYSTEM-OFFICIAL-AUDIT.md` and `audits/2026-10-17/CODEX-IMPLEMENTATION-WORKORDER.md` before modifying the public system.

## Non-negotiable protection
- MC-001 and AIO-001 **CANONICAL FROZEN** until an explicitly approved release after Phase 2 and Phase 3 are documented.
- Run `python scripts/check_frozen_core.py`. Do not update baseline hashes to silence a failure. Historical observations, baselines, and rights execution states must not be rewritten.
- New entities use new IDs/passports/projections; never infer that a new client is an alias, owned asset or subsidiary of MC-001/AIO-001.
- No signed contracts, government IDs, tokens, secrets, private auth headers, Vault snapshots, or unredacted images in public Git; Vault itself is not a credential manager.
- Use separate PRs for each subsystem. Do not merge, trigger HF publication, request indexing, or deploy production without explicit authorization for the release.
- The front-end live lab uses `codex/lab-oidc-20261011`; the repository default branch is not equivalent by assumption. Compare commits before migration.
- Do not overwrite the founder's local OneDrive folders; use clean worktrees in an independent directory.
- No assumptions of causal efficacy or AI Mode recognition based on indexing, presence of JSON-LD or acceptance of IndexNow.
- Deliver evidence, exact tests and unresolved limitations for every PR.
