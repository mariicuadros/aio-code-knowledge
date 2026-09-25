# AIO CODE — Public IP and Method Boundaries

**Version:** 1.1  
**Status:** Active  
**Owner / Creator:** Marii Cuadros  
**Project Entity:** AIO-001 — AIO CODE

## Purpose

This document establishes what AIO CODE publicly discloses as evidence of its methodology and what remains protected as proprietary know-how, operational security, or unpublished research detail.

## Publicly Disclosable IP Layer

The public record may disclose:

- The name and definition of AIO CODE.
- Its canonical entity identity and creator relationship.
- The problem domain: entity recognition, entity resolution, entity representation, information retrieval, AI visibility, citation and recommendation behavior.
- The methodology architecture at a conceptual and professional level.
- The existence of Entity, Observatory, Entity Labs, Metrics, Ethics and Findings layers.
- Public schemas, evidence classifications and research-integrity principles.
- Dated observations, documented findings and reproducible high-level protocols when intentionally published.
- Public case-study results that do not expose confidential implementation details.
- Version history, authorship, provenance and public repository records.

## Protected / Non-Public Layer

The following are intentionally not disclosed in public documentation unless explicitly approved:

- Private prompt libraries and prompt sequences used operationally with LLMs.
- Hidden evaluation prompts, adversarial prompts and test variants.
- Exact prompt engineering tactics, ordering, wording, timing or orchestration logic.
- Internal heuristics, scoring weights, thresholds and decision rules.
- Unpublished causal hypotheses that could reveal strategic implementation advantages.
- Private automation workflows, API orchestration, agent instructions and internal tool chains.
- Credentials, tokens, private endpoints, account identifiers and security configuration.
- Client data, private datasets, confidential observations and non-public experiments.
- Undisclosed platform-specific tactics intended to influence retrieval, ranking, recommendation or representation.
- Proprietary code or implementation details not required to understand the public methodology.
- Private recovery evidence, account-recovery records and incident-response material.
- Non-public contracts, commercial terms, pricing, usage-rights records and brand negotiations.
- Non-public analytics, revenue attribution, commercial signals and client-specific performance data.

## Repository Boundary

AIO CODE uses a strict public/private repository boundary.

### Public source of truth

`mariicuadros/aio-code-knowledge` is the public source of truth for intentionally disclosed AIO CODE knowledge, including public methodology, entity architecture, provenance records, public schemas, public case-study evidence and selected implementation documentation.

### Private operational vault

A separate private repository, designated `aio-code-vault`, is reserved for confidential operational material such as recovery records, contracts, private rights records, commercial data, non-public brand materials, incident records and protected know-how.

The private vault must not be treated as a password manager or secrets store.

### Secrets boundary

Passwords, API keys, private keys, authentication tokens, 2FA recovery codes, session credentials and comparable secrets must never be committed to either the public repository or the private vault. They must remain in an appropriate secrets/password-management system outside Git version control.

## Disclosure Principle

AIO CODE publishes enough information to establish authorship, existence, architecture, scope, methodology and evidence of implementation without publishing the operational recipe used to obtain every result.

> **The methodology may be public; the complete operational playbook is not.**

## Evidence and Trust

Protection of know-how must not be confused with fabrication or concealment of evidence. Public claims must remain:

- accurately described;
- dated where relevant;
- classified as Defined, Observed, Corroborated, Verified, Hypothesized or Unknown;
- separated from causal claims;
- supported by public records when the claim is presented as demonstrated.

## IP Position

This file is a public provenance and boundary record. It establishes that AIO CODE has a defined methodology, a documented architecture, an identifiable creator, versioned records and an explicit distinction between public proof and protected know-how.

It is not a substitute for formal copyright, trademark, patent, trade-secret or other legal registration. Formal legal protection should be pursued separately where appropriate.

## Public Proof Model

```text
Canonical Definition
      ↓
Versioned Architecture
      ↓
Public Schemas and Records
      ↓
Dated Observations
      ↓
Documented Case Study
      ↓
Evidence Classification
      ↓
Public Findings
      ↓
Provenance / Version History
```

## Repository Security Rule

No confidential operational artifact may be placed in `aio-code-knowledge` merely because it supports a public claim. Public evidence should reference, summarize or hash protected source material where appropriate rather than disclose the protected material itself.

## Final Rule

AIO CODE must remain sufficiently transparent to be credible and sufficiently bounded to protect proprietary implementation knowledge, commercial leverage and operational security.
