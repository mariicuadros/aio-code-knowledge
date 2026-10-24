# AUD-CODEX-DEOS-20261020 — backend remediation, 2026-10-21

Status: **DRAFT FOR REVIEW. P0 remains OPEN. No operational authorization or global production uniqueness is certified.**

## Scope and provenance

AIO CODE is a Digital Entity Operating System (DEOS). This change implements the backend plan authorized in the chat on 2026-10-21. It does not implement the frontend audit or enable a registrar, IdP, signer, publisher, external integration or deployment.

- Issue: https://github.com/mariicuadros/aio-code-knowledge/issues/73 (audit work order, no attached findings report at inspection).
- Base: `main` at `23ff245b4d18d38e254c0bb2e1f995edd19f23a9`.
- Compared console branch: `codex/entity-console-api` at `dbe65ccf8da86ed87ad5cb1ab6352706a08cd43d` (13 ahead / 155 behind main at comparison).
- Blocked reference PR #71: `bcf9797e5c4850aa59533dbc90b1b9ad96bdd71b`, base console branch. It is not merged or copied wholesale.
- Implementation: `codex/deos-backend-p0-p1-20261021`, clean worktree outside OneDrive. Founder checkout and pre-existing changes are untouched.

## Corrections and evidence

| Finding | Correction | Synthetic acceptance evidence |
| --- | --- | --- |
| P0: ordinary token can invoke historical canonical-link action | `api/entities.mjs` and `EntityService.change` reject `link_canonical` with HTTP 403 / `canonical_registrar_required` before storage or duplicate lookup. No role/header/payload grants registrar authority. | Authenticated POST/PATCH and direct service calls with payload variants; storage deliberately throws if accessed. No writes. |
| P0: historical duplicate bypasses current policy | Shared `assertOrdinaryReplay` checks predecessor, preserved binding, allowed action and transition policy. All ordinary store duplicate exits, marker short-circuit and lost-response recovery use it. Registry reserve/bind replay also checks current protected IDs. | Unsafe create/edit/link, missing predecessor, changed payload, archived reactivation, stale approval hash, marker race and lost acknowledgement; legitimate retry after a later archive still returns its historical revision once. |
| P1: optional field breaks old clients | Retain main's own-property omission handling; no backport of the console branch's direct undefined/null comparison. Archive cannot be undone by ordinary edit. | Authenticated PATCH for linked and unlinked synthetic records with omitted ID; exact ID preserved; explicit removal/replacement rejected. Approval/hash/package/URL cleared on edit. |
| P0/P1: latest-only uniqueness ignores past links and reservations | All revisions count. New shared `readRegistryLedger` reuses the existing registry history/marker/lock validation. Ordinary append and registry snapshot read cases and reservations from the same Git tree; preflight rechecks on each CAS retry. | Archived, omitted and replaced historical IDs; cross-instance reserve race; ordinary edit versus bind; injected historical collision at CAS; orphan locks; unknown/mismatched case files; duplicate revisions. |
| P1: approval, identity and rights confused | Keep main's trust boundary and pure release gate isolated. Preserve `publication_authorized=false`. Private package preparation additionally requires an intact approved-data hash. No rights schema/state is promoted. | Existing 37 trust tests and six release-gate tests remain green. Synthetic bind resets approval/package; withdrawal retains the ID; `useAuthorized` never grants registrar authority or public release. |

Code commits, deliberately separated:

1. `45152ba` authority denial.
2. `ee73d0d` ordinary replay validation.
3. `2991e65` historical compatibility / archived-state and approval protection.
4. `7dbadcc` historical occupancy and atomic snapshot validation.
5. `a4e3e67` registry replay against current protected-ID policy.

The final documentation/CI commit adds `npm run test:backend` and runs the same four backend suites under the network-denial preload. No existing suite is removed.

## Atomicity and fail-closed boundaries

Within the supported `entity-console/v1/` and `canonical-registrations/v1/` namespaces on the **same private Git ref**, writes use the existing `commitFiles` immutable tree creation and `force:false` ref update. The preflight reads all case revisions and registry locks from that exact tree. A competing ref advance causes a fresh snapshot and revalidation. A bind event, case revision, operation marker and reservation history must agree. No blind retry or compensating deletion is introduced.

An ID remains occupied after archive/withdrawal or a later revision omitting/changing the field. A reservation may coexist with case history only for its matching bound request/case. A case with any historical binding cannot request a second identity merely because its current revision omits it.

Inconsistent occupancy rejects writes with `canonical_link_conflict`; malformed case history uses `vault_history_invalid`; orphan/inconsistent registry history uses `registry_history_invalid`. **The write path conservatively blocks all writes in an inconsistent snapshot, including unrelated case edits.** Reads remain separate; no automatic data repair, migration or historical rewrite occurs. This availability cost is deliberate.

The historical reader remains bounded (1,000 case revisions; 10,000 registry entries). Exceeding these limits rejects work. Pagination is not implemented. Every write now reads the registry history too, increasing read cost/latency.

These are laboratory guarantees, NOT global production verification:

- No real Vault, permissions, case history, independent users or live providers were inspected or exercised.
- Public graph/target policy is loaded from this application version; it is not in an atomic transaction with a separate public repository or another deployed version.
- Older writers, direct Git write access, unsupported namespaces, other refs/repositories or external allocators are outside the atomic boundary. The application cannot prove their absence. Ordinary assignment stays disabled and no registrar is activated.
- LocalStore has no registry adapter and its queue is only per instance; it is a test persistence mode, forbidden in production. It does not establish distributed uniqueness.
- Existing trust-library limits remain: a revocation after the last authority check can race a successful ref update. A reported provider failure is not proof that an accepted decision rolled back.

**P0 cannot close** until a separately authorized operational review verifies privileged authority and the complete global allocation boundary. No production enablement is proposed by this PR.

## Compatibility matrix

| Existing record/request | Result |
| --- | --- |
| Unlinked + omitted ID or explicit null | Ordinary create/edit remains available. |
| Linked + omitted ID | Preserve the exact stored ID; non-identity edits remain available. |
| Linked + same explicit ID | Preserve; edit resets approval and private package. |
| Linked + null or another ID | 409, no new revision. |
| Ordinary `link_canonical`, even a historical key | 403; UI clients using this action must handle denial. |
| Legitimate repeated operation after later revisions | Return the original historical operation, not a new transition or current approval. |
| Historical unsafe assignment, reactivation or stale package preparation | Reject; retain immutable history. |
| Archived case edited ordinarily | 409; no implicit reactivation. |
| Legacy link collides with another history/reservation | Reject writes; independent investigation required. |
| Missing predecessor or malformed history | Reject rather than infer or reconstruct authority. |

Clients must distinguish a historical idempotent response from present status; a current GET is required for current state. No new schema version or data migration is performed. New error codes are fixed and contain no private data. Registrar safe-error projection continues to map unlisted internal errors to its generic unavailable response.

## Separation of responsibilities

1. **Canonical registration:** isolated request/review/reserve/bind/withdraw library with independent authority. Ordinary admin cannot invoke it.
2. **Private data approval:** `approved` and `pending_deployment` refer to reviewed data and private package preparation. `publish` retains that legacy private meaning.
3. **Public release:** existing `publicReleaseCandidate` remains a pure gate, not a publisher. Human publication authorization and a separate release remain required.
4. **Rights:** `useAuthorized` is an operator assertion; neither it nor a canonical ID proves a signature, legal rights or consent for a new public use. Existing rights execution states and evidence are untouched.

## Executed validation

Environment: Node v24.21.0, Python 3.12.10; temporary jsonschema 4.26.0 / PyYAML 6.0.3. Dependency install: `npm ci --ignore-scripts --no-audit --no-fund` (11 packages). No dependency version or lockfile change.

| Check | Actual result |
| --- | --- |
| `npm run test:backend` | 119/119 pass: Console 43, registry 33, trust 37, release gate 6 (counts include subtests). |
| All nine Node test suites, network-denial preload | 153/153 pass; includes the 119 backend tests, not additive. |
| `python -m unittest discover -s tests -v` | 113/113 pass. |
| `python scripts/check_frozen_core.py` | PASS: 11 locked files plus graph, claims, social map and assets. |
| Release safety, core, repository integrity, intake, Brain, site, entities, external-employer self-test | PASS. |
| `python -m compileall -q rag`; RAG CLI; `python -m rag.evaluate` | PASS. |
| `python scripts/build_public_rag.py --check` | PASS: 189 passages; index not regenerated. |
| Gateway / pre-content | PASS: source recall 21/21; no model invocation. |
| RAG safety | PASS: 52 query fixtures, 15 unsupported draft fixtures; no live generation. |
| Public entity synchronization | PASS: no errors/warnings; read-only. |
| Local public build | PASS: 65 allowlisted files; no deployment. |
| `git diff --check` | PASS. |

All mutating backend tests use temporary local files or in-memory MockPrivateGit, fictitious cases and ephemeral signing keys. The preload removes inherited Vault/admin credentials and denies real sockets/fetch. Mock fetch implementations have no network fallback. Existing core/public-data checks are read-only consistency tests; no client expediente is used.

Initial failures and corrections are recorded rather than hidden: Windows sandbox denied temporary-file rename (same tests passed outside that restriction); autocrlf changed checkout bytes (restored exact Git blobs, never baseline hashes); a Windows absolute preload path needed a file URL; repository integrity must run before npm installs node_modules as in CI (dependencies temporarily moved aside and restored); gateway/RAG needed those dependencies restored. No assertion or security check was disabled to obtain green results.

### Reproduction

Use a clean checkout with LF bytes, Node 24 and Python 3.12. Run source integrity before installing npm dependencies, matching CI. On Windows create the checkout with `git -c core.autocrlf=false`; do not refresh frozen baselines.

```sh
python -m pip install 'jsonschema>=4.23,<5' 'PyYAML>=6,<7'
python scripts/check_frozen_core.py
python scripts/validate_external_org_template.py --self-test
python scripts/validate_release_safety.py
python scripts/validate_core.py
python scripts/audit_repository_integrity.py
python scripts/validate_intake.py
python scripts/validate_brain.py brain/contracts/examples.synthetic.json
python -m unittest discover -s tests -v
python -m compileall -q rag
python scripts/validate_site.py
python scripts/validate_entities.py
python -m rag.cli ask 'What is AIO CODE?'
python -m rag.evaluate
python scripts/build_public_rag.py --check
npm ci --ignore-scripts --no-audit --no-fund
npm run test:backend
node --import ./tests/synthetic-network-guard.mjs --test tests/*.test.mjs
node --import ./tests/synthetic-network-guard.mjs scripts/validate_gateway.mjs
node --import ./tests/synthetic-network-guard.mjs scripts/validate_precontent.mjs
node --import ./tests/synthetic-network-guard.mjs scripts/check_public_entity_sync.mjs
node --import ./tests/synthetic-network-guard.mjs scripts/validate_rag_safety.mjs
npm run build
git diff --check
```

Node subprocesses in the executed Python suite also received the preload through NODE_OPTIONS. On Windows its absolute value must use a `file:///` URL, not a bare drive path.

## Rollback and review gates

Before merge, close the draft or revise the branch; main and deployed systems remain unchanged. If this code is ever integrated under later authorization, revert the relevant code commits through a reviewed PR. Do not restore the unsafe ordinary link endpoint, enable the registrar, reset Git history, remove reservation/receipt/event files or recycle IDs. An operational incident requires disabling writes first; reverting code is not permission to erase history or migrate data.

PR #71 remains blocked as an operational solution. This draft is ready for code review only. Remote CI status must be checked on its exact head SHA; local results do not imply remote success. No merge, deploy, Vault connection, entity publication, rights approval or P0 closure is authorized.
