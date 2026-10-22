# DEOS Phase 2 — Repeatable Multi-Entity Onboarding and Canonical Registration Contract
Date: 2026-10-21
Status: PROPOSED ENGINEERING CONTRACT — not implemented, not a public registration authority
Owner: AIO CODE (Digital Entity Operating System)
Scope: reusable product workflow; never modify frozen MC-001 / AIO-001 identity, schemas or publication code per new client.

## Product invariant
**Adding an entity is a controlled data transaction, not a Git feature deployment.** Each client may be a person, organization, brand, or creative project; different kinds are linked with explicit sourced edges, never conflated. A registration cannot be asserted in the public graph, HF, RAG or JSON-LD merely because editorial material was published.

## One-time platform building blocks
1. **Intake form (Entity Console):** typed fields, provenance attachments, rights-holder/authorized approver, relation assertions, requested public fields, consent scope, expiration/withdrawal, legal/business status, official social URLs and evidence classification. Server validates all, with revision-aware persistence.
2. **Private event store:** immutable source versions with per-field claim origin and evidence states; idempotent writes; globally unique tenant ownership; no client identifiers used as authority. Review/approval is version-bound.
3. **Canonical registrar (separate authenticated privileged service):** compare all historical and active reservations/archives across supported sources, atomically reserve immutable globally unique IDs, return signed binding receipt and audit trail. Ordinary create/edit endpoints MUST reject assignments; do not invent the next numeric suffix or imply UUID administrative ENT is canonical.
4. **Human review and rights gate:** distinct approvals for collection, internal research, public profile, imagery, use of brand, cross-platform syndication, case studies, withdrawal. Approval is per entity and immutable revision, not per customer order or payment.
5. **Public projection generator:** derive safe fields from approved version and registered target; build canonical URL, schema.org JSON-LD, passport, linked entity graph edges, source/evidence ledger, public discovery page, sitemap and indexable public asset inventory. Validate no private fields, no conflicting `sameAs`, source legitimacy, duplicate identity, old revision, or unpublished proof.
6. **One publication orchestrator:** stage preview, deterministic static/API build, preview tests and identity/rights checks; approve exact immutable bundle; atomically promote and record deployment receipt; failed deployments do not imply published; preserve rollback and tombstones.
7. **Downstream sync queue:** after confirmed public publication, enqueue RAG allowlist+index rebuild with pinned commit and gold tests, then optional HF datasets with revision/schema/privacy comparison. External systems may lag and are explicitly recorded as `pending`, `verified`, `failed`, or `withheld`; none may be silently marked synchronized.
8. **Observatory and renewal:** baseline per entity before changes; monitor indexing independently of publication; correction/consent withdrawal propagates across public surfaces and index updates with evidence receipts.

## Status machine and prohibited transitions
`intake_draft -> evidence_review -> consent_review -> canonical_registration_pending -> canonical_registered -> publication_review -> publication_approved -> deployment_pending -> published -> downstream_sync_pending -> synchronized`.
Separate `rejected`, `archived`, `revoked`, `sync_failed` branches. No direct jump from `intake_draft` to published. Changes after approval create new revisions; never reuse stale receipt.

## Invariants / adversarial tests
- Concurrent registration of same person/brand in multiple accounts and two separate writers produces one global canonical binding or conflicts, never two.
- Replays, previous revisions, archived IDs, reused idempotency keys and partial network failures do not allocate a second ID or bypass permissions.
- No `ENT-...` administrative ID reaches public `@id` or URL; canonical `@id` is stable across HTML, generated JSON-LD, API and registry.
- No public URL inferred from user's display name; slug collision requires deterministic review.
- Every relationship has two distinct source/target identities and approved evidence. UGE project is not an incorporated legal company just because a person says it is their business.
- DUE/legal proof stays outside static site, Git public branches, RAG, Hugging Face and API public payload. A business tax number appears only in an explicitly authorized public projection.
- A fee/payment may fund services but must NOT bypass consent, registrar, privacy, approval or legal validity gates; unpaid entities and paid entities use same technical checks.
- Revocations, updated business status, name changes and merged profiles have versioned event receipts and safe migration; never silently change previously assigned IDs.
- HF and RAG ingestion require exact content commit, privacy validation, rollback and negative retrieval tests; no claim of external LLM recognition from a public record.

## Explicitly blocked today (audit 2026-10-21)
- Current `lib/entity-service.mjs` generates immutable administrative `ENT-UUID` and prevents ordinary `canonicalEntityId` changes. It is NOT an authorized canonical registrar.
- `lib/public-identity-targets.mjs` defines a reviewed DAN-001 target only; one-off hardcoded targets cannot be the final scalable registration path.
- Backend PR #74 has protections but explicitly does not solve independent registrar/global-source uniqueness.
- Frontend PR #23 is draft and error handling / stale logout P0 remains; do not activate real clients based on CI green.
- `rag/public-index-v0.json` remains pinned to earlier sources; widening the allowlist without regenerating fails the expected CI freshness guard.
- HF dataset metadata is visible, but its complete rows and revision parity have not been proven.

## Definition of done (end-to-end synthetic acceptance)
- Synthetic Person + Company + Project enroll consecutively **without modifying application source, the frozen core, a hardcoded target map, or hand-editing the public graph**.
- Same-name distinct persons remain distinct; same-person duplicates are detected without auto-merging.
- Authorized reviewer can validate, register, approve, publish and re-publish an edited revision from GUI; a rejected record cannot go public.
- Registrations survive concurrent requests, provider outages and historical replays, with tests using independent writers/store instances.
- Public profile and structured data share the registered ID; sitemap/search/RAG/HF receive only approved fields with receipts.
- Negative tests cover private legal artifacts, unsolicited publication, stale approvals, paid-customer bypass, deletion and revoked rights.
- Operator view shows per-entity lifecycle, source and synchronization status; no empty dashboard when backend fails.

## Implementation sequence (one-time system work)
P0: Backend registrar service, independent global uniqueness/authority; vault permissions + immutable receipts.
P0: Resolve frontend security/concurrency P0, preserve state on provider outages.
P1: Generic schema-driven intake and approval GUI; disambiguation and relationship editor.
P1: Template-based public projector and release pipeline with revision-bound approval and rollback.
P1: RAG/HF downstream sync adapters; no silent writes.
P2: Analytics and Observatory; billing/service agreements managed separately from identity integrity.

## Existing candidates
- Person: Sergio Martín Contreras — awaiting canonical registrar allocation.
- Spanish company: Sergio Impulsa S. L. — DUE evidence, final registry status independently unverified.
- Project: UGE — no separately registered corporate status established.
- Further people/clients: no IDs and no assumptions until intake and approval.

## Compliance and economics
AIO CODE is a **system**, not a standalone methodology. Services may be free or paid by separate contract; client fees do not automatically purchase ownership of DEOS, an indexation guarantee, a legal certification, priority of canonical identity, or public exposure without approval.
