# Phase 2 PR C2A — isolated canonical registry trust boundary

Issue: [knowledge #57](https://github.com/mariicuadros/aio-code-knowledge/issues/57).
Verified bases on 2026-10-18: knowledge/main d809fde2059f004087d460cd943f6bad0c208df6;
frontend OIDC lab 5b61ca1ad616111a0ce4253b9325431846ec7603.
The dated ecosystem register remains a historical snapshot, not live telemetry.

Status: laboratory library, NOT an operational registration service. No HTTP
handler, environment configuration, production signer, IdP, credential issuer
deployment, frontend connection or Vault instance is installed. Missing dependencies
throw registry_trust_unconfigured. Ordinary Console authentication grants nothing
here. Frontend unavailableRegistry and DEMO restrictions are unchanged.

## Server composition and contracts

The only composition entry is createRegistryTrustBoundary(dependencies).execute(command,
context), imported by synthetic tests only. Dependencies are trusted server code,
never browser parameters:

- identityProvider.verifySession(opaqueSession): independent verified identity,
  delegation, fresh authentication, current session/revocation status, CSRF binding,
  and independent human confirmation for an exact privileged command.
- keyProvider.current(): authoritative, monotonically versioned public-key and
  revocation policy. A snapshot must expire within 30 seconds and remain current.
- signer.sign(keyId, encodedClaims): server-only signing service. The module neither
  accepts nor loads a private key. Tests use ephemeral Ed25519 keys; no persistent
  key, environment secret, administrative token or Vault credential is provisioned.
- RegistryTrustVaultStore: explicit, unconfigured private persistence adapter with
  durable admission receipts in the same Git CAS transaction as the PR B decision.
- Exact HTTPS console origin and capability audience, fixed by server configuration.

Context has exactly session, origin, csrf, nonce. It has no role, public ID override,
authority flag, grant or signing-key parameter. Origin must match the configured
HTTPS origin exactly. CSRF is compared in constant time against the digest attested
by the session provider. Nonces are 32–128 base64url characters; future transport
should generate 256 random bits. Transport cookies and OIDC are untouched because
no transport has been added.

The trusted session adapter returns exactly subject, session_id, expires_at,
authenticated_at, mfa, roles, grants, csrf_hash, human_confirmation. Subject identifiers
must be stable and globally qualified within the configured IdP: changing issuer,
aliases or account names must not evade independent-review checks or actor limits.
Authentication must be at most 300 seconds old; privileged actions require MFA.
Grants contain case_id, case_revision, case_hash, action, command_hash. Every field
must match the complete validated PR B command. No wildcard grants are implemented.
A human confirmation contains subject, command_hash, confirmed_at and is valid for
at most 120 seconds. Its issuance requires an independently verified human action,
not a request checkbox or an object decoded without signature verification.
The laboratory does not implement that identity provider or claim real human review.

Operator -> authenticated private REQUEST -> independently authenticated human
registrar -> exact-command delegated grant -> server signer -> Ed25519 verifier ->
PR B planner -> private Git CAS. REQUEST and identity approval remain distinct from
data-release approval and public publication.

| Operation | Required authority | Additional boundary |
| --- | --- | --- |
| REQUEST | operator, exact case/revision/hash/action/command grant | Existing case must be unlinked; identity is explicitly submitted |
| REVIEW | registrar, fresh MFA, exact human confirmation | Actor differs from original requester; PR B evidence/rights/homonym checks |
| RESERVE | registrar, fresh MFA, exact human confirmation | Independent actor; previously approved exact revision; historical uniqueness |
| BIND | registrar, fresh MFA, exact human confirmation | Independent actor; existing reservation; immutable case + decision atomically |
| WITHDRAW | registrar, fresh MFA, exact human confirmation | Independent actor; preserve history and occupied ID; no publication action |

No identity is inferred from names, aliases or links. No automatic promotion from
ordinary administrator to operator/registrar exists.

The private v1 capability envelope is exactly schema_version=1, key_id, capability.
The capability itself retains PR B's signed claims and byte format: issuer, audience,
subject, role, scope, issued_at, expires_at, command_hash. Claims are signed over the
base64url payload and checked by the original registryAuthority. The complete command
digest includes reason, evidence, revision, payload, operation key and action. TTL is
at most 60 seconds, further bounded by session/key expiry. The selected key must be
active and Ed25519; verification happens before private reads and on every plan/retry.
A malfunctioning signer returning another key's signature is rejected before storage.

The envelope key selector does not itself grant trust: only configured public keys
are considered, their public materials must be unique, and the selected key must
verify the signature with the configured issuer/audience. Keep the issuer stable
across rotations within the same authority; changing issuer intentionally changes
the PR B actor/idempotency identity. Bearer capabilities never leave execute().

## Key management, expiry and revocation

The authoritative policy contains version, valid_until, active_key, keys,
revoked_sessions, revoked_subjects. Each key contains id, issuer, public_key,
not_before, not_after, revoked. No private key belongs in this policy or the Vault.
Key-provider availability and freshness are prerequisites, not an optional cache.
A policy version change during execution aborts; retry must obtain a fresh exact
grant/session. Persisted receipts prevent a lower policy version from executing
against a ledger that already accepted a newer version.

Production provisioning remains a separately authorized dependency:

1. Establish an independent IdP tenant and explicit operator/registrar delegation
   process, stable subjects, MFA, session revocation, human-confirmation workflow,
   and founder-reviewed separation of duties.
2. Establish a server-only nonexportable Ed25519 signer/KMS with narrowly scoped
   workload identity, independent approvers, audit logs, backup and recovery.
   The Vault is not a key/credential manager.
3. Distribute authenticated, monotonic key/revocation policy independently of request
   data; provision a new unique public key before selecting it for issuance.
4. Retain an old public key only for its reviewed overlap/expiry interval. Mark
   compromised keys revoked immediately; never fall back to the old key on error.
   Rotate the signing authority and invalidate affected grants/sessions as needed.
5. Test issuer outages, propagation, clock discipline, incident response and durable
   authorization fencing before exposing any route or real Vault adapter.

Revalidation is performed at every preflight and CAS retry. It does not make a
remote IdP/key manager and Git one atomic system. A revocation after the final
authorization check may race a successful ref update. Production needs reviewed
authorization leases/fencing and a defined in-flight revocation linearization policy;
this PR does not certify instantaneous distributed revocation. A revocation or
provider failure after an accepted commit may prevent confirmation: resolve through
an authorized later inspection/idempotent retry; never assume a reported error
rolled back an accepted decision. No compensating deletion/reset is implemented.

## Atomic admission, idempotency and limits

Private namespace: canonical-registration-trust/v1/receipts/SHA256(nonce).json.
Version 1 receipts have schema_version, policy_version, nonce_hash, session_hash,
subject_hash, command_hash, key_id, issued_at, operation_key. No cookie, bearer
capability, CSRF secret, raw nonce, evidence or signing key is stored. These digests
are still private, not exportable public metadata.

The store extends PR B snapshot validation, associates each immutable receipt with
its registry event and rejects malformed/orphan/duplicate receipts. The planner first
revalidates session, capability, command, review and case. Only then it checks admission
and appends a receipt to the same files as the decision, ID lock and optional case
revision. Rejected plans create no active writes or receipts. Git force=false CAS
rechecks the exact winning snapshot on each retry. No process Map or lock is used
for concurrency; the Git ledger is shared across instances. Tests simulate Git
objects in memory but exercise the real immutable client/ref-CAS logic.

Identical command + actor + original nonce + session replays the one accepted event.
Reusing a nonce for another operation/session/actor is rejected. Replaying a PR B-only
event without an original trust receipt is rejected, not retroactively authorized.
Revoked/expired sessions and capabilities cannot use idempotency as an authority
bypass. Fresh retries may reissue a capability internally, but require the exact
original command and nonce with active current authorization.

Admission defaults to ten successful commands per authenticated subject in a
60-second issuance window, checked against persisted receipts. Admission leases
expire at 60 seconds. This is a conservative laboratory admission budget, not a
certified wall-clock HTTP request-per-second service. It does not rate-limit rejected
unauthenticated requests or replace edge/IP/tenant limits. An independently reviewed
distributed abuse-control service must protect a future transport and IdP/signer
before private work begins. Append-only receipts are capped at 10,000; capacity,
pagination, retention and authoritative time synchronization need separate design.
There is no automatic pruning or nonce recycling.

PR B service/store now await authorization and transaction plans. Synchronous
authorities/planners remain supported. All PR A guards, registryPlan, registryAuthority,
case/version checks, historical ID locks and vault-client force=false behavior are
retained. The extension does not expose an API action.

## Threat model and remaining trust assumptions

| Threat | Implemented control / synthetic evidence |
| --- | --- |
| Ordinary admin password or caller-provided role acquires identity | Independent verified adapter, strict context, no fallback; operator denied all four privileged actions |
| Requester approves own identity with a registrar role | Subject separation in PR B plus all privileged trust operations; explicit self-approval negative test |
| CSRF, bad Origin, expired/unverified session | Exact Origin, session-bound constant-time CSRF, fresh identity and action-specific grant |
| Modified evidence/revision/decision or stolen capability for another command | Signed full-command digest, audience/scope/subject checks; stale case and human confirmation denied |
| Signer/key substitution, unknown or compromised key | Trusted Ed25519 key selection, signature verification, key/session/subject revocations and bounded policy freshness |
| Revocation during a conflicting transaction | Async authorization recheck on each CAS attempt; no winning decision after denied retry |
| Same nonce or limit used concurrently on different instances | One shared immutable receipt + Git CAS; identical replay commits once; competing admission limit rechecked |
| Historical corruption or withdrawn ID recycling | Strict history/receipt validation, preserved PR B locks and public ID exclusions |
| Provider exception leaks private detail | Fixed safe error allowlist; no-store/private/noindex headers; no command/token/provider body in safe failure |
| Public publication or protected identity mutation | No endpoint/export wiring; publication_authorized=false; frozen guard and existing suites |
| Compromised IdP, signer, server composition or private Git owner | Not solved by this library; independent approval, least privilege, auditing and incident response required |

An adapter that trusts unsigned browser claims or manufactures human confirmations
would violate this trust contract. Arbitrary server code with Vault write permission
can bypass library composition; production least-privilege enforcement and review are
mandatory. No real provider/keys, Vault read/write, remote auth E2E, capacity or incident
response is asserted by these simulations.

Safe response policy is supplied as data, not a handler. Future routes must exclusively
use redacted fixed errors, no-store/private/noindex headers on success and failure,
restrict payload size/media type, use secure HttpOnly SameSite cookies, preserve
OIDC/origin/CSRF protections, and avoid logging raw inputs. Current API files are unchanged.

## Conditions for any operational integration

A separate approval must authorize the actual identity provider, human registrar
workflow, signer/KMS, key distribution/revocation fences and distributed abuse controls.
Then obtain explicitly scoped access to a separate synthetic Vault Lab, test E2E with
fictional cases and independent users, complete security review and record results.
The founder must explicitly authorize operational connection afterward. Only then
propose private real intake with canonicalEntityId=null. Identity reservation does
not authorize public release; future publication remains PR D and requires separate
authorization. Frontend C2B and real credentials are not part of C2A.

## Validation and rollback

New suite: tests/canonical-registry-trust.test.mjs (37 synthetic tests).
Existing PR A/B regression: 52 tests passed. Includes protected MC-001/AIO-001/DAN-001,
historical nonreuse, races, approvals, public privacy and ordinary API denials.
The initial new-suite run had one incorrect fixture that reauthorized its own
intentionally modified command; corrected without weakening validation.

Local workflow-equivalent validation passed: 113 Python tests; 112 combined registry,
Console, governance and release Node tests plus 17 Instagram tests (129 total); frozen
core (11 locked files and graph/claims/social/assets); template self-test; release,
core, integrity, intake, Brain, site and entity validators; compileall, RAG CLI and
rag.evaluate; existing public index --check (189 passages, no regeneration); npm ci
--ignore-scripts --no-audit --no-fund; gateway/precontent and public-sync/RAG-safety
checks; build (62 allowlisted files); git diff --check. Exact remote CI SHA/status
is recorded in the PR.
The validate workflow adds the new suite; no existing test or public policy is disabled.
Original OneDrive changes are preserved in place. No API, frontend, passport, graph,
rights, public RAG, HF, Vercel or real Vault data is modified.

Before merge, rollback is closing the unmerged PR. If this library were later enabled
under separate approval, disable its composition/issuance first; retain immutable
events, receipts and ID locks. Reverting code is not authority to erase history or
reuse a withdrawn ID. Stop after delivering PR C2A; no merge, deployment, real Vault
connection or PR D is authorized.
