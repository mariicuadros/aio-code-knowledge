# GitHub branch governance check — 2026-10-17
**Record:** GOV-BRANCH-PROTECTION-20261017-001.
**Repository:** `mariicuadros/aio-code-knowledge`.
**Source:** GitHub REST read-only ruleset #25323523 and default-branch metadata checked by connected authorized app after operator configured the rule.

## Verified active policy
- Ruleset: `AIO CODE - Main Protection`, `enforcement: active`, matching `~DEFAULT_BRANCH` → currently `main`.
- `main.protected: true` observed, despite legacy protection object showing `enabled=false`. This is consistent with enforcement via ruleset rather than classic branch-protection settings.
- Rules: `deletion`, `non_fast_forward`, `pull_request` with 0 required approvals and allowed merge methods merge/squash/rebase.
- Status checks: `validate` required from GitHub Actions (`integration_id: 15368`), `strict_required_status_checks_policy=true` (up-to-date branch).
- `bypass_actors=[]` and GitHub reports current authorized user cannot bypass.
- CI script `scripts/check_frozen_core.py` runs inside `validate`. Pinned baseline currently in `governance/frozen-core-baseline-20261017.json`.

## Limitations and next controls
- CI protects enumerated canonical files and tracked graph/asset/claim entries, NOT all possible errors or indirect semantic drift. Must review every public identity promotion, privacy-sensitive change and PR manually.
- Approval count zero is a practical concession for solo-maintainer workflow, not a human approval barrier.
- Do not silently refresh pinned baseline to evade tests; require governance authorization before lifting freeze.
- Other connected repositories `aio-code-frontend` (private, default `codex/entity-console`) and `aio-code-vault` (private, default `main`) presently report `protected=false` on checked branches. Ruleset endpoint returned HTTP 403 “Upgrade to GitHub Pro or make this repository public to enable this feature.” **Never make the Vault public**. Evaluate account plan/compatible private-repository protection or alternative CI process. Do not pretend this public knowledge ruleset automatically covers other repositories.
- A document PR is used after this ruleset creation to verify `validate` executes on ordinary contributions; passing CI tests the suite, but not every denial/bypass path. A staged negative PR using a synthetic change could further verify the frozen-core gate after explicit review.

## Operational workflow
New entity → independent branch and review → `validate` → PR merge → explicit manual production release → URL/schema/indexing inspection → dated log. Publication to Hugging Face remains a separate explicit SHA-gated workflow, not implied by merging documentation.

**Production/identity safety:** No changes to MC-001 or AIO-001 canonical definitions or main Vercel deployment were part of this branch-rule audit.
