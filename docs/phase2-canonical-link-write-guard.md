# Phase 2 PR A — ordinary canonical-link write guard

Scope: backend engineering only. Base knowledge/main: `1de8bdbf792704839130830f5a9768f53200b058`. No release, migration or canonical allocation is authorized by this change.

## Diagnosis and controls

Previously the API administrator could supply a syntactically valid, non-core canonicalEntityId through create or replace it through edit. Active-link uniqueness was not assignment authority; a read-only browser control did not protect the API.

The domain assertion compares the previous immutable binding with the proposed binding. The service applies it before append; creation normalizes an absent/null field to null and rejects any non-null ID. Ordinary edits accept the exact previous ID. An omitted optional field preserves the binding for older clients; explicit null removes a binding and is rejected. Existing field, URL, authorization, version and uniqueness validators remain active.

Persistence applies the same assertion to LocalStore appends and VaultStore initial/preflight checks. The existing Git ref optimistic retry revalidates the binding against each current snapshot. A rejected operation appends no entity revision. A failed ref attempt can leave unreachable provider tree/commit objects, but cannot advance the active history. Historical unsafe create/edit idempotency replays fail rather than reauthorizing an old allocation; valid binding-preserving retries retain existing semantics.

Errors reuse the existing allowlisted `invalid_canonical_link` code (409 for forbidden transitions; existing malformed/core format errors remain 400). No credential or identifier value is included in error bodies. No registrar capability, endpoint, reservation ledger or privileged token is introduced. Those require a separately reviewed PR B.

## Threat model

| Threat | Control | Evidence |
| --- | --- | --- |
| Administrator bypasses read-only UI | Backend rejects all ordinary null-to-ID transitions | Service and authenticated HTTP negative tests |
| Replacement, removal or DAN impersonation | Exact binding comparison; explicit null rejected | No-new-revision assertions |
| Same name, alias or official URL grants identity | No identity inference; unlinked record remains null | Homonym fixture and release-gate denial |
| Parallel allocations or edits | Allocations all denied; expectedVersion and append checks retained | Concurrent negative/valid edit tests |
| Retry bypass through old unsafe operation | Replay checks source and resulting binding | Historical synthetic replay denial |
| Direct append or Git ref race bypass | Store guard and per-retry preflight | Local append negatives and mocked Vault optimistic race |
| Private fields reach public output | Existing public-field allowlist and release gate retained | Canary, URI parity and release tests |

The ordinary dashboard token remains sufficient for private CRUD, never for allocating canonical IDs. Existing persisted bindings are trusted as historical input; this PR does not certify their legal/identity approval or repair tampered Vault history. No real Vault record was read or written.

## Compatibility matrix

| Existing input/record | Behavior |
| --- | --- |
| New record, omitted ID or null | Creates private ENT record with canonicalEntityId null |
| New record, any non-null canonical ID | Rejected without revision |
| Legacy unlinked record (field absent) | Read remains supported; ordinary edit normalizes null |
| Linked record, exact ID echoed | Link preserved; normal data-release approval invalidation on edit remains |
| Linked record, field omitted by old client | Link preserved by server; all supplied fields still validated |
| Linked record, explicit null or another ID | Rejected without revision |
| Prior DAN-001 binding | Preserved; private edits, lifecycle, archive and public projection tests pass |
| Archived identity | Link retained; another ordinary record cannot acquire it |
| MC-001 / AIO-001 and existing protected IDs | Existing Console input rejection retained; canonical source files untouched |

A private package preview is not a public release. Legacy unlinked previews still contain their administrative identifier under the existing response contract. They cannot acquire a public @id or pass publicReleaseCandidate(), which requires an explicit canonical target and rejects private ENT occurrences. No publisher is connected here. Do not export these authenticated previews as public files.

## Frontend comparison and integration boundary

| Repository branch | Inspected SHA | Compatibility |
| --- | --- | --- |
| frontend codex/entity-console | b5b721036ff1aa792422c6d041e7ef4414e7dbc9 | Separate default branch; nullable/default-null canonical field accepted |
| frontend codex/lab-oidc-20261011 | 08f0df2df2d55d863f4e30f7fc0340c5615258cc | Laboratory branch; read-only canonical field; preserves values on save |
| knowledge main | 1de8bdbf792704839130830f5a9768f53200b058 | Base of this backend PR |

Both frontend response schemas retain canonicalEntityId. The lab BFF already allowlists invalid_canonical_link and retains session, Origin, idempotency and server-only OIDC checks. No response shape or frontend source change is necessary for this PR. The default branch is not substituted for the lab. Frontend local-backend copies are separate fixtures and are not migrated here; contract checks use the actual hardened knowledge service. A full integration deployment remains separately authorized work.

The dated governance register reports API Lab at bc11317dbf102694e087f4fe3e801291a9b26399 and Console Lab at 08f0df2df2d55d863f4e30f7fc0340c5615258cc. These are documentary observations, not live deployment verification in this PR. No Vercel request or change was made.

## Local validation

Windows, Node 24, Python 3.12; jsonschema/PyYAML installed in a temporary venv using workflow ranges. Validation commands run on an LF checkout of the same base plus byte-identical modified code/tests. The initial CRLF checkout failed the exact frozen-file hash for index.html; a new worktree created with core.autocrlf=false passed. No frozen source or baseline hash was edited to bypass this check.

- node --test tests/entity-console.test.mjs: 33 passed, including 9 additional cases and replacement of ordinary-allocation fixtures with explicit preexisting synthetic records.
- Combined seven CI Node suites: 73 passed.
- python -m unittest discover -s tests -v: 109 passed.
- python scripts/check_frozen_core.py: passed, 11 locked files plus graph/claims/social/assets invariants.
- validate_external_org_template.py --self-test, validate_release_safety.py, validate_core.py, audit_repository_integrity.py, validate_intake.py, validate_brain.py brain/contracts/examples.synthetic.json, validate_site.py and validate_entities.py: passed.
- build_public_rag.py --check: passed, 189 passages; index not regenerated.
- python -m rag.evaluate: 21/21 eligible gold sources retrieved over 24 questions; not a claim of external recognition.
- npm ci --ignore-scripts --no-audit --no-fund: passed.
- npm run check:gateway and npm run check:precontent: passed, no provider invocation.
- node scripts/check_public_entity_sync.mjs: passed, seven existing DAN profiles.
- node scripts/validate_rag_safety.mjs: passed, 52 query fixtures and 15 unsupported drafts.
- npm run build: passed, 62 allowlisted public files; no publication.
- Both current frontend response contracts: 12 synthetic response validations passed (create, prior binding, omission edit, review, approval and private package); no frontend change required.
- git diff --check: passed.

CI result must be checked on the opened PR's exact commit, independently of these local results. Remote authentication, distributed rate limits, real Vault persistence, legal approval of historical links, privileged future assignment and customer tenancy were not tested or implemented.

## Files and rollback

- lib/entity-domain.mjs: shared binding-preservation assertion; no projection or canonical-target changes.
- lib/entity-service.mjs: ordinary-operation and replay guards; legacy omission compatibility.
- lib/entity-store.mjs: binding checks at storage/preflight boundary.
- tests/entity-console.test.mjs: synthetic fixtures and negative/regression tests.
- This document: threat model, compatibility, evidence and limitations.

No edits to api/entities.mjs, public-identity-targets.mjs or entity-public-release-gate.mjs were needed: API writes already funnel through EntityService, the public target registry stays explicit, and release authorization remains separate. Frozen MC-001/AIO-001 files, graph, passports, DAN public identity, RAG policy, production configuration and Vault remain unchanged.

Before merge, rollback is simply closing this unmerged PR. If separately approved and merged/deployed later, revert the PR commit through another reviewed PR and explicitly authorize a backend release. Never remove private revisions or rewrite historical bindings. Reverting restores the old allocation weakness, so keep the API unavailable to new canonical assignments until a safer replacement is approved.
