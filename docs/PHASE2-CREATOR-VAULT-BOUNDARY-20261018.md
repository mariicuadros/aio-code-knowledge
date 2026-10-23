# Phase 2 — Creator Records / Vault integration boundary (draft)
Date: 2026-10-18. Documentation only. No remote data writes or deploy.

## Verified by code inspection
- Existing `lib/entity-store.mjs` `VaultStore` uses a strict `entity-console/v1/ENT-<uuid>/<revision>.json` layout and entity-specific `assertCanonicalLinkPreserved`. Its append and snapshot selection assume existing Entity Console event shape and operation keys.
- New `LocalCreatorRecordsStore` persists creator bundles under `CASE-...--<revision>.json` with `draft -> review -> approved`, and different `bundleHash`, `approvedRevision` and keys.
- Therefore **DO NOT** reuse `VaultStore.append()` directly for creator bundles or widen its existing prefix filter. This could break entity records and identity protections.

## Minimal isolated next adapter (not yet implemented)
1. Reuse only lower-level `vault-client.mjs` immutable `state`, `textBlob`, `commitFiles` primitives, with a separate prefix `creator-records/v1/<CASE-ID>/<revision>.json` and separate idempotency markers.
2. Verify repository snapshot and creator record chain before **each** optimistic retry, including contiguous versions, allowed state transitions, expected revision, and active review hash. Never modify canonical entity binding or source records.
3. Reject unknown record fields, malformed paths/IDs, missing revisions and private/public crossover. Use response whitelists for public projection and never publish a raw bundle.
4. Bind approvals to **exact record content hash** (not only revision number), record human approver attribution securely, and withdraw approval automatically on edit/archive.
5. Add mock-only tests for concurrent writes, tampering, stale retry, replays, approval-without-review, revoke-before-export, secret redaction, remote failures. No remote writes in tests.
6. Add explicit secure caller identity to agent evaluation before it can inform any live permissions; current `agentId` is untrusted request input in the simulation.
7. Privacy/security review required before enabling any Vercel route, importing real client data or granting clients access.

## Current evidence and limitations
- Local persistence, concurrency and simple bundle-hash tamper detection have local Node tests.
- A raw unkeyed SHA-256 of bundle detects accidental modification but is **not** tamper-evident against a malicious party who can recompute the hash. Vault Git history is not itself a legal attestation.
- Existing Entity Console VaultStore mock tests do not validate the new Creator Records adapter because that adapter does not exist yet.
- Do not claim external agent control, remote persistence, fully conformant JSON Schema instance validation or commercial readiness.

## Immediate gate
First rerun complete local suite including new integrity tests:
`node --test tests/creator-*.test.mjs tests/entity-console.test.mjs`.
Only then implement isolated remote adapter under its own `creator-records/v1/` prefix with mock-only tests.
