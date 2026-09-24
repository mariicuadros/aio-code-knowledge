# AIO CODE — Evidence Standard v1

**Version:** 1.0  
**Date:** 2026-09-23  
**Status:** Canonical pre-pilot standard

## Purpose

This standard governs how AIO CODE classifies evidence, promotes or downgrades claims, distinguishes first-party definitions from external validation, and prevents unsupported causal or commercial conclusions.

## Three separate fields

Every material claim must separate:

1. **claim_type** — what kind of statement it is.
2. **claim_status** — lifecycle state of the record.
3. **evidence_state** — how strongly the claim is supported.

These fields MUST NOT be collapsed.

### claim_type

- `canonical_definition`
- `research_observation`
- `research_finding`
- `hypothesis`
- `commercial_statement`
- `operational_rule`

### claim_status

- `draft`
- `active`
- `superseded`
- `withdrawn`

### evidence_state

- `unknown`
- `hypothesized`
- `observed`
- `corroborated`
- `verified`

## Evidence states

### Unknown

Insufficient evidence exists to characterize the claim.

### Hypothesized

A proposed explanation, expected relationship or causal mechanism has been formulated but not sufficiently supported.

### Observed

A directly recorded event, output, state or measurement exists. Observation proves that the recorded event occurred under the documented conditions; it does not prove why it occurred.

### Corroborated

Two or more materially independent observations, measurements or sources support the same claim, with no unresolved contradiction large enough to invalidate it.

Corroboration does not automatically imply causation.

### Verified

A claim is `verified` only when a pre-declared verification rule appropriate to that claim type is satisfied and the evidence is traceable.

Verification MUST specify:

- `verification_rule_id`
- `verification_scope`
- `verified_by`
- `verification_date`
- `evidence_refs`
- known limitations

`Verified` is not a synonym for true in every possible context. It means the declared verification rule has been satisfied for the stated scope.

## Evidence classes

Evidence records SHOULD identify one of these classes:

- `E1_first_party_definition`
- `E2_first_party_artifact`
- `E3_external_observation`
- `E4_independent_source`
- `E5_system_output`
- `E6_measurement`
- `E7_legal_or_institutional_record`
- `E8_replicated_result`

Evidence class does not by itself determine strength. Relevance, independence, date, authenticity and scope matter.

## Independence rule

Multiple copies of the same first-party statement across platforms are not automatically independent corroboration.

Example:

A bio copied from the same canonical text to Instagram, Medium and a website is three distribution nodes but may represent one underlying first-party claim.

## Canonical definitions

A canonical definition may be authoritative **within AIO CODE's own entity registry** without being externally verified.

Example:

`Marii Cuadros is the canonical public name of MC-001.`

This can be an active canonical definition supported by first-party records. It does not imply independent public recognition.

## Causal claims

A causal claim MUST NOT be promoted beyond `hypothesized` solely because an AI/search output changed after an intervention.

At minimum, causal evaluation should document:

- baseline;
- intervention;
- comparable post-intervention observations;
- timing;
- material confounders;
- alternative explanations;
- replication when feasible.

## Recommendation claims

Recognition, retrieval, citation and recommendation are separate outcomes. Evidence that a system recognizes an entity does not support a claim that the system will recommend it.

## Commercial claims

Public product statements must be bounded by evidence.

Allowed framing before replicated pilot validation:

- structures digital entity information;
- documents claims, relationships and provenance;
- audits consistency;
- observes third-party AI/search representations;
- measures change under documented conditions.

Not allowed as guaranteed outcomes:

- guarantees AI recognition;
- guarantees recommendation;
- guarantees ranking;
- controls a third-party AI knowledge graph;
- guarantees citation or discovery.

## Promotion rule

No evidence-state promotion may occur without adding the supporting evidence refs and the rule/reason for promotion.

## Downgrade rule

Claims must be downgraded when material contradictory evidence appears, a source becomes invalid, the observation cannot be reproduced where reproducibility was required, or the original scope was overstated.

Historical versions remain preserved.

## Core integrity statement

> First-party definition is not independent validation. Observation is not explanation. Correlation is not causation. Recognition is not recommendation. Verification is always scoped and rule-based.