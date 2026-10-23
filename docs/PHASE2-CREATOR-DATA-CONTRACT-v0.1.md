# AIO CODE · Phase 2 Creator Data Contract v0.1
Date: 2026-10-18 · Status: **proposal / not deployed** · Owner: AIO CODE
Canonical source: README.md, AIO-CODE-SYSTEM-SPEC-v2.md, PROVENANCE-ARCHITECTURE.md, EVIDENCE-STANDARD-v1.md.
Principle: **Identity before visibility; evidence before conclusions; authorization before external action.**

## Scope
Extend the existing DEOS without replacing canonical IDs, baseline records, vault policy, or public graph. Market focus: creators with multiple profiles, creative works, characters, and collaborators. This document is a data contract proposal, not a rights verification, court, agent system, or live payment product.

## Domain objects

### 1. Entity (existing)
Canonical `entityId` such as `MC-001`, `NUX-001`, `DAN-001`; `entityType`, `canonicalName`, `aliases`, `relationships`, `officialProfiles`, and evidence-linked claims. Preserve existing schemas and admin-vs-canonical ID distinction. `sameAs` only for URLs that denote the *same* entity, never cross-entity relations.

### 2. CreativeWork (new linked record)
`workId` (stable locally unique), `creatorEntityIds[]`, `title`, `workType`, `description`, `createdAt`, `versions[]`, `contributions[]`, `sourceEvidenceIds[]`, `publicationRefs[]`, `rightsStatementIds[]`, `visibility`, `reviewStatus`. Distinguish composer, lyricist, performer, producer, AI-assisted generation and tool terms; roles are declared facts with evidence status. Never infer percentages of human authorship.

### 3. Contribution (new nested or linked record)
`contributionId`, `workId`, `actorEntityId` or `toolReference`, `role`, `description`, `timeRange`, `evidenceIds[]`, `evidenceState`. AI systems are tools/services unless a separate modeled agent is relevant. Contribution is not equivalent to legally recognized ownership.

### 4. RightsStatement (new)
`rightsStatementId`, `workId`, `assertedByEntityId`, `basis` (contract, provider terms, creator declaration, statutory reference, other), `jurisdictions[]`, `rightsTypes[]`, `evidenceIds[]`, `evidenceState`, `effectiveFrom`, `effectiveUntil`, `reviewStatus`, `visibility`.
Claims can be contested or unknown. Never label ownership legally 'verified' merely from uploaded documents.

### 5. RightsGrant (new)
`grantId`, `workId`, `grantorEntityId`, `granteeEntityId`, `permissions[]` (view, publish, reproduce, modify, distribute, train, license, other), `constraints`, `territory`, `channels[]`, `effectiveFrom`, `expiresAt`, `revokedAt`, `signedEvidenceIds[]`, `approvalStatus`, `visibility`. Default-deny any machine-executed action when authorization evidence is missing or ambiguous; no claims of globally enforceable opt-out.

### 6. AgentAuthorization (future simulation, **not deployed**)
`authorizationId`, `principalEntityId`, `agentId`, `scope`, `permittedActions[]`, `workIds[]`, `maxValue`, `currency`, `validFrom`, `expiresAt`, `revokedAt`, `approvalEvidenceIds[]`, `humanApprovalRequired`, `status`. A mandate restricts what our controlled workflow will perform; it does not bind outside systems or confer legal personhood.

### 7. ActionRecord (future simulation, **not deployed**)
`actionId`, `agentId`, `authorizationId`, `workId`, `requestedAction`, `decision` (allow, deny, review), `policyVersion`, `evaluatedAt`, `evidenceIds[]`, `actor`, `correlationId`. Append-only, no silent overwrites.

### 8. DisputeCase (research only, **not a tribunal**)
`caseId`, `workIds[]`, `partyEntityIds[]`, `claimIds[]`, `evidenceIds[]`, `status`, `humanReviewer`, `resolutionExternalReference`. No automated binding adjudication or enforcement.

## Common minimum fields
Each record must carry `schemaVersion`, `recordId`, `createdAt`, `updatedAt`, `revision`, `responsibleEntityId`, `visibility` (`private` or `approved_public`), `approval`, `evidenceRefs[]`, and `auditRef`. Do not expose a personal name or document merely because the record is linked to a public entity.

## Canonical graph
```
Entity (MC-001) --creates--> CreativeWork (WORK-...)
Entity (NUX-001) --creative_project_of--> Entity (MC-001) [only if approved fact]
CreativeWork --hasVersion--> WorkVersion
CreativeWork --hasContribution--> Contribution
CreativeWork --hasRightsStatement--> RightsStatement
RightsGrant --governs--> CreativeWork
AgentAuthorization --authorizedBy--> principal Entity
AgentAuthorization --restricts--> permitted action + work + period
ActionRecord --recordsDecisionFor--> AgentAuthorization + CreativeWork
```
Relationships are domain-specific; do **not** transform them into `sameAs`.

## Boundary and workflow
1. Intake draft in private Entity Console; verify participant consent and authority to process information.
2. Attach immutable or version-addressed evidence and provenance references in the private vault. No secrets in files, public URLs or logs.
3. Human review of identity, contributions, rights claims, grant scope and applicable terms; uncertain means uncertain.
4. Approval of exact revision; subsequent edits invalidate the old approval.
5. Build an allowlisted public projection (optional) *only* for authorized fields, omitting raw contracts, prompts, personal records, secrets and private evidence.
6. Maintain separately a machine-readable public reference and a privately exportable evidence packet.
7. Record retrieval/representation observations independently of publication; publishing a record does not guarantee third-party indexing, citation or payment.
8. For future agents, default to `deny` or `review`, respect expiry/revocation, do not execute irreversible contracts or transactions without explicit human approval and legal/partner validation.

## Local fictional acceptance test (not production)
Create Entity `Demo Artist — FICTIONAL` linked to `WORK-DEMO-001`; attach two fictional versions, a declared human edit, a fictional AI tool reference, one grant permitting **view-only**, and one hypothetical agent mandate to read metadata.
Expected:
- metadata read => allow;
- request to publish/remix => deny;
- request to license => human review (no automatic signing);
- revoked authorization => deny;
- expired grant => deny;
- export => public projection contains no private evidence, contract body or administrative ID;
- altered work revision => prior approval withdrawn;
- foreign entity IDs, broken references, missing mandatory evidence => validation error.

## Repository allocation
- `aio-code-knowledge`: schemas, validators, integration API contract, source-of-truth relationships, evidence classification.
- `aio-code-frontend`: authenticated intake UI; rights review, provenance timeline, safe export preview.
- `aio-code-vault`: private originals, contracts, consent and immutable/audited revisions.
- `aio-code-entities` / public Vercel Entity Home: allowlisted, explicitly approved projections, not automatic mirrors.
- `aio-code-journal`: dated experiment and evaluation notes, no private client raw data.
- `aio-code-portfolio` content: mission, vision, implemented-vs-future status (see portfolio PR), no unsupported partnership claims.

## Delivery sequence
1. Agree on names, invariants and schema boundaries (this PR).
2. Create versioned JSON schemas and cross-reference validators, with negative privacy/authorization tests.
3. Extend backend **without enabling** remote public writes.
4. Extend frontend intake/review only in local or authenticated preview.
5. Validate end-to-end with synthetic data: Console → API → Vault → reload → allowlisted private/public previews.
6. Pilot with real creators only after explicit permissions, security checks and human review.
7. Separately research W3C VC, C2PA interoperability, license vocabularies, agent delegation and dispute-support workflow.

## Success gates before Dubai (Oct 28, 2026)
- This contract reviewed by Marii and Israel.
- Current system demo kept stable; no confidential cases.
- Optional synthetic test demonstrating scope-deny/review based on *simulated* agent actions.
- Portfolio distinguishes **built**, **in progress**, **future vision**.
- No claims of arbitrary external AI control, automatic royalties, international arbitration, global registries, universal copyright verification or legal incorporation.
