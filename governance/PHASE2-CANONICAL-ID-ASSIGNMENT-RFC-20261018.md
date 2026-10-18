# Phase 2 RFC — Controlled Canonical Identity Assignment

**Status:** DESIGN / NOT IMPLEMENTED. **Owner:** AIO CODE founder approval required per independent entity. **Date:** 2026-10-18.

## Problem

The Console's private `ENT-UUID` is an immutable case-file identifier; it is **never** a public entity ID. The existing `canonicalEntityId` field is currently supplied through API data and can be viewed read-only in the lab UI. A display-only control is not server-side authority for allocating identities. Current backend validation rejects core IDs in Console and prevents duplicate active links but does not independently issue/reserve *new* public IDs or adjudicate real-world identity conflicts. Private package `publish` only means `pending_deployment`; it is not a public release.

No `MC-001` or `AIO-001` data, rights or canonical representations can change as part of this design.

## Proposed separated states and actors

1. **Private intake:** create `ENT-UUID` with `canonicalEntityId=null`. Draft sources, evidence and permissions remain in the private Vault. An intake is not a public identity.
2. **Request:** operator submits a *canonical-link request* referencing a specific immutable revision, claimed public display name, type, existing URLs, proposed namespace and reasons for disambiguation. Never generate an ID from a name, browser field or model suggestion.
3. **Evidence review:** human checks the declared name, type, independence, homonyms, legitimacy of `sameAs` URLs, social profiles, provenance, scope of legal/photographic rights, disclosure approval, deletion/withdrawal terms and public consent. A signed agreement is tracked if required; a checkbox by itself does not resolve rights.
4. **Reservation:** founder (or separately delegated identity registrar with an auditable, authenticated role) reserves a unique public ID in **private** `canonical-registrations/v1/` via an atomic Git ref compare-and-swap, checking (a) current canonical graph, (b) prior reservations **including withdrawn/archived**, (c) existing approved entity targets and (d) all active `ENT` links. Do not recycle retired IDs without an explicit exceptional review.
5. **Link approval:** authorize one exact `ENT-UUID` and reviewed revision to one reserved public ID. Persist a signed-off decision record, timestamp, evidence references (private), purpose, limitations, actor and operation key. Only a dedicated privileged backend operation may insert/change `canonicalEntityId`; deny that field in ordinary create/edit requests unless unchanged from the previously approved binding. Avoid last-writer-wins.
6. **Public target review:** approve canonical `pageUrl`, `@id`, type, precise display name and selected source URLs. Add them explicitly to a reviewed registry and corresponding public schema/Entity Home via a gated PR. Being linked is not authorization to publish.
7. **Publication authorization:** separately accept a publication-specific release of an exact revision, including rights/provenance and public fields. Future publisher MUST call `publicReleaseCandidate()`, verify no `ENT-UUID` disclosure, compare source approval hash, require explicit human approval of PR/deployment and inspect published URL.
8. **Follow-up and revocation:** log deployment SHA and observed public response. Withdrawal removes active publication/approval, preserves private immutable history as governed by retention/privacy policy, and handles external provider takedown separately. Do not assume deletion from third-party caches.

## Example of proposed **private-only** reservation record (illustrative schema)

```json
{
  "schema_version": 1,
  "request_id": "REQ-SYNTHETIC-EXAMPLE",
  "case_file_id": "ENT-11111111-1111-4111-8111-111111111111",
  "case_revision": 3,
  "proposed_public_id": null,
  "decision_status": "requested",
  "identity_type": "organization",
  "claimed_name": "ENTIDAD FICTICIA DE DEMOSTRACION",
  "evidence_refs_private": [],
  "consent_scope": "not_reviewed",
  "approver_role": null,
  "approved_at": null,
  "public_target": null,
  "deployment_authorized": false
}
```

This shape is **illustrative**, not a production schema. In particular, `request_id` is **not** a canonical ID. No actual entity or company names, accounts, secrets, signatures or private agreement contents belong in public examples.

## Non-negotiable technical acceptance tests for implementation

- [ ] Caller with ordinary admin editing permissions cannot mint, change or impersonate a public ID.
- [ ] Anonymous caller, untrusted Origin, invalid CSRF/session and expired credential cannot submit or approve a reservation.
- [ ] Two concurrent reservations for the same ID cannot both commit, including retries across workers.
- [ ] A reservation for `DAN-001` must not displace its existing approved identity. Core `MC-001`/`AIO-001` are never assignable by Console.
- [ ] Homonyms do not merge; independent entities have separate permanent IDs, profiles and authority records.
- [ ] Archived or withdrawn IDs cannot be silently reassigned.
- [ ] Idempotency keys distinguish a safe retry from a changed request and guarantee no double registration.
- [ ] A failed reservation or revision-conflict makes **zero** changes to active links or public files.
- [ ] Approval produces a scoped, immutable decision record; ordinary edits invalidate data-release approvals as appropriate.
- [ ] Private `ENT-UUID`, admin tokens, claims evidence references, identity documents, contracts and rights-holder fields cannot appear in release candidate or public JSON-LD, RAG, HF or deployed pages.
- [ ] No canonical ID allocation, Hugging Face upload, search indexing, PR merge or public deployment happens automatically during onboarding.

## Decisions not yet authorized

**No namespace chosen** for Sergio Impulsa or other new clients. No roles beyond single administradora are implemented. No customer tenancy or legal rights certification is inferred. Backend authorization changes and a new endpoint require threat modeling and another PR before deployment. Avoid describing this RFC as a working feature.

## Existing validated references

- `lib/entity-domain.mjs` existing private input/ID validation and allowed fields.
- `lib/entity-service.mjs` immutable revision lifecycle, conflict and link checks.
- `lib/public-identity-targets.mjs` explicitly reviewed DAN-001 public URI.
- `lib/entity-public-release-gate.mjs` future (not yet wired) public-release candidate check.
- Independent private GitHub Vault revision evidence for the synthetic Laboratorio Prisma test (six revisions ending archived).
