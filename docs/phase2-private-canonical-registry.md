# Phase 2 PR B — isolated private canonical registry

Base: knowledge/main `864115934cc7a13f1cf26c68af8557e7d35982be` (merged PR A). Scope: private backend library and simulated-provider verification. No endpoint, signer, configured production instance, migration, real reservation, real Vault read/write, public identity change or deployment is delivered.

## Architecture and contracts

`CanonicalRegistry.change(command, capability)` accepts version 1 commands for REQUEST, REVIEW, RESERVE, BIND and WITHDRAW. The command always identifies a private case, exact current immutable case revision and data hash, request version, operation key and decision reason. REQUEST records the explicit claimed name/type/namespace and private evidence references. The claimed identity must match the submitted case revision; no inference from aliases or URLs is performed.

REVIEW requires an independent registrar subject (not the requester). Approval requires explicit identity, sources, homonym and rights checks, plus private evidence references. Rejection is an auditable decision and cannot reserve an ID. These are verified-authority attestations, not automated account-ownership or legal certification.

RESERVE explicitly selects an ID within the reviewed namespace. It excludes the committed public graph, protected core IDs, reviewed public targets, all historical private case links and all registry reservations, including archived/withdrawn. It also prevents two active reservations for the same private case. IDs are not generated from names, aliases, URLs, request IDs or ENT IDs.

BIND requires the approved, reserved request and unchanged exact case revision/hash. One Git commit appends both the bound registry decision and a new immutable case revision with the reserved ID. It resets data-release approval, package and public URL and leaves the case draft. It does not call ordinary EntityService append or relax PR A. The Console activity retains the existing single-administrator label for response compatibility; the private registry event is authoritative for the exact registrar subject, issuer and role.

WITHDRAW is a separate privileged decision. For a bound identity it atomically archives the current exact case revision and clears data-release approval/package, retaining its historical canonical link. The immutable reservation remains occupied forever in this implementation. Withdrawal is not deletion, public takedown or authorization to recycle an ID. Existing ordinary CRUD semantics are unchanged; a future public publisher must independently require a current bound registry decision and release approval. This PR exposes no publisher.

JSON schemas:

- schemas/canonical-registry-command-v1.schema.json: strict action-specific request contracts.
- schemas/canonical-registry-event-v1.schema.json: strict immutable event contract; publication_authorized is always false.

Runtime validation additionally enforces state transitions, complete event chains, prior-event hashes, independent review, immutable identity data, request versions, markers and reservation consistency. Unknown fields and versions fail closed. Schema tests validate runtime-generated synthetic commands/events, not handwritten production snapshots.

## Private persistence and atomicity

Only these namespaces may be produced by the planner:

- canonical-registrations/v1/requests/REQ-UUID/NNNNNNNN.json: append-only decisions.
- canonical-registrations/v1/ids/DEMO-001.json: illustrative synthetic ID lock; actual runtime path uses the explicitly authorized ID.
- canonical-registrations/v1/operations/SHA256.json: immutable idempotency marker.
- entity-console/v1/ENT-UUID/NNNNNNNN.json: one new case revision in a BIND or bound WITHDRAW transaction.

No such actual records are committed in this public repository. Tests generate fictional provider contents in memory only. Evidence references, case hashes, actors and decisions remain private; error codes contain no record identifiers, token values or provider body.

`CanonicalRegistryVaultStore` reuses the existing private-repository check and immutable Git client. The read token loads registry and complete case history from one snapshot. Before every optimistic commit attempt, the planner rechecks authorization, exact versions/hash, availability, all historical links and registry state against the tree used for that commit. Git commits use that head as their parent and update the ref with force=false; a competing divergent commit is rejected, reread and revalidated. This is cross-instance concurrency control, not a process Map lock.

An identical operation from another instance returns the committed event; changed payload or actor with the same key is rejected. A provider failure after ref acceptance is resolved through a fresh snapshot and the operation marker. Failures before acceptance leave the active tree unchanged. Optimistic failed attempts may leave unreachable provider tree/commit objects; no active decision or case revision is partially installed. There is no history deletion or compensating reset. Unknown result after a persistent provider outage must be resolved by an authorized later read/retry, never a blind second allocation.

The planner is pure. The adapter accepts explicit credentials only and is never instantiated by configuredStore(), an environment variable or an API route. Like other persistence adapters, it is trusted server composition code, not a caller-facing security boundary on its own.

## Independent authority and threat model

A configured Ed25519 public key verifies a short-lived capability signed by a separate authority. Claims bind issuer, audience, subject, role, one exact action scope, issued/expiry times (maximum 300 seconds) and the digest of the entire command including its idempotency key. Operator capabilities allow REQUEST only; REVIEW/RESERVE/BIND/WITHDRAW require a registrar role and corresponding scope. Validation occurs before any private read and again during each transaction plan/retry. The common dashboard token, unsigned objects, expired tokens and wrong command/action/audience cannot grant authority. The module does not store or log bearer capabilities or implement a signer.

| Threat | Control/test |
| --- | --- |
| Ordinary administrator allocates or replaces identity | PR A files unchanged; its 33 tests plus registry integration regression |
| Forged/reused/wrong-scope authority | Signature, audience/issuer, role/action, expiry and exact command digest |
| Requester self-approves / incomplete rights or homonym review | Different authenticated registrar subject and required reviewed checks/evidence |
| Concurrent same-ID or same-case reservations | Immutable ID lock plus full snapshot revalidation and non-force Git ref update |
| Historical/archived/withdrawn ID recycling | All historical case links and registry reservations remain unavailable |
| Case edit races privileged BIND | Exact revision/hash checked on every retry; decision and case written together |
| Lost provider acknowledgement | Persistent operation marker resolves identical replay once |
| History/marker/lock corruption | Strict fields, filenames, contiguous versions, hash chain and cross-record consistency |
| Private information reaches static site, RAG or HF | No route/import/allowlist changes; manifest tests and existing publication gates |

## Exposure dependency — deliberately not implemented

No new HTTP endpoint exists. There is no deployed registrar identity provider or approved key-management procedure available in the current single-administrator MVP. A future endpoint proposal must first specify a trusted issuer, reviewed role delegation, key rotation/revocation, authenticated session, exact Origin/CSRF checks, request limits, redacted audit logging, rate limiting and private response policy. The browser must never hold a signing key or provider write credential. Passing a boolean/role from a browser is not an authority mechanism. A separate integration review is required before constructing this adapter against real Vault credentials. No new secret variable is configured by PR B.

The cryptographic capability authorizes execution; the private Git event records actor/issuer/decision, not a durable copy of the bearer token. Tamper resistance assumes trustworthy private Git permissions and signing authority. It does not protect against a compromised private-repository owner or signing key. Public graph/target exclusions come from the deployed source revision; integrating a changing public registry requires coordinated source versioning. Snapshot sizes remain bounded (10,000 registry entries; existing 1,000 case-record cap); pagination/scalability is not certified. Existing historical duplicate bindings fail availability checks but are not migrated or repaired.

## Compatibility and publication boundary

PR A domain/service/store, API endpoints, public targets and release gate are byte-for-byte unchanged. Create still yields null; ordinary edit cannot assign/change/remove a link. Privileged operations are not actions accepted by api/entities.mjs. Previously linked DAN-001, MC-001 and AIO-001 receive no migration or registry writes. All graph/target IDs are unavailable for new reservations, including DAN-001. No frontend source or OIDC change is included; frontend issue #11 remains separate.

Reservation, identity approval, private data-release approval and public deployment are distinct. BIND resets data-release approval, and WITHDRAW clears it for bound cases. Every registry event has publication_authorized=false. There are no changes to Entity Homes, passports, rights, graph, RAG policies, export manifests, Vercel, indexing or HF configuration. Frozen sources and existing records are not altered.

## Reproducible local validation

Windows, Node 24 and Python 3.12; LF checkout outside OneDrive. Python validators use a temporary venv with the workflow jsonschema/PyYAML ranges. No remote private data/provider was used.

- New registry Node suite: 19 passed, including lifecycle, signature/role denials, independent review, stale versions, idempotency, same-ID/same-case races across instances, CAS retry/exhaustion, provider lost acknowledgement, historical nonreuse and PR A regressions.
- JSON contract suite: 4 passed against runtime-generated synthetic commands/events.
- Combined existing/new CI Node suites: 92 passed (including the original 33 Entity Console checks).
- Complete Python unittest suite: 113 passed.
- check_frozen_core.py: passed, 11 locked files plus protected graph/claims/social/assets invariants.
- validate_external_org_template.py --self-test, validate_release_safety.py, validate_core.py, audit_repository_integrity.py, validate_intake.py, validate_brain.py brain/contracts/examples.synthetic.json, validate_site.py and validate_entities.py: passed.
- build_public_rag.py --check: passed, 189 passages; no index regeneration.
- compileall rag, CLI query and rag.evaluate: passed; 21/21 eligible gold-source hits over 24 questions.
- npm ci --ignore-scripts --no-audit --no-fund, check:gateway, check:precontent, check_public_entity_sync.mjs, validate_rag_safety.mjs and npm run build: passed; 62 allowlisted public files.
- One initial negative-test fixture accidentally used review-only fields for REQUEST; corrected the fixture without weakening validation. One Windows CLI output failed under cp1252; rerun with PYTHONIOENCODING=utf-8 passed.

CI must be checked separately against the opened PR SHA. Remote session/CSRF, real signer integration, real Vault permissions/writes, provider outages at scale, actual human evidence review and public takedown are not verified by these simulations.

## Files, rollback and stopping point

New domain/service/store modules implement the isolated registry; two JSON schemas define v1; Node fixtures/tests and Python contract tests cover it. The validate workflow adds the registry Node suite; Python discover already includes its schema checks. This document records architecture and limitations. No existing PR A guard is modified.

Before merge, rollback is closing this unmerged PR. If a later explicitly authorized integration persists decisions, disable that integration first and use a reviewed compensating WITHDRAW where appropriate; retain every immutable decision and ID lock. Reverting code never authorizes deleting registry history or reusing withdrawn IDs. No actual migration or rollback operation is executed here.

Stop after PR B. No merge, deployment, PR C interface or PR D publisher is authorized by this work.
