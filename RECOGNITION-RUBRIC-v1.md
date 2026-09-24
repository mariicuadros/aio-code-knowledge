# AIO CODE — Representation Measurement Rubric v1

**Version:** 1.0  
**Date:** 2026-09-23  
**Status:** Canonical pre-pilot rubric

## Principle

AIO CODE does not use a single recognition ladder as the primary representation metric. AI/search representation is multidimensional.

## Required dimensions

Each comparable response should be evaluated independently on:

1. **entity_resolution** — did the system resolve the intended entity?
2. **disambiguation** — did it avoid or correctly distinguish confusable entities?
3. **identity_accuracy** — was the basic identity correct?
4. **attribute_accuracy** — were stated attributes supported?
5. **relationship_accuracy** — were entity/project relationships correct?
6. **official_source_discovery** — were canonical/official sources found when relevant?
7. **citation_quality** — were cited sources relevant and supportive?
8. **hallucination** — did the system introduce unsupported material claims?
9. **representation_completeness** — how much of the benchmark claim set was represented?
10. **consistency** — did repeated equivalent tests produce stable outcomes?
11. **cross_system_agreement** — how similar were materially comparable representations across systems?
12. **recommendation** — did the entity appear in a category/recommendation query? This is separate and must never be interpreted as a higher level of recognition.

## Suggested ordinal coding

Use small descriptive scales, not one composite commercial score.

### entity_resolution
- `0` not resolved
- `1` ambiguous/confusable
- `2` intended entity resolved

### disambiguation
- `0` incorrect merge
- `1` unresolved ambiguity
- `2` correctly distinguished

### identity_accuracy
- `0` incorrect
- `1` mixed/partial
- `2` substantially correct

### attribute_accuracy / relationship_accuracy
- `0` material errors
- `1` mixed
- `2` mostly supported

### official_source_discovery
- `0` none
- `1` indirect/partial
- `2` canonical source located

### citation_quality
- `0` absent/irrelevant/contradictory
- `1` partially supportive
- `2` directly supportive

### hallucination
- `0` material unsupported claim present
- `1` minor unsupported detail or uncertainty
- `2` no material unsupported claim detected

### recommendation
- `0` absent
- `1` appears only with strong narrowing/leading context
- `2` appears in the frozen category query under documented conditions

## Claim-set evaluation

For a benchmark entity, maintain a frozen set of expected claims with evidence refs. Evaluate system output against that set.

Recommended fields:

- `claim_id`
- `expected_state`
- `mentioned`
- `correct`
- `supporting_source`
- `contradicted`
- `notes`

## Repeatability

One response is an observation, not a stable system property.

For stability claims, repeat equivalent tests under the same benchmark protocol and report denominator explicitly.

Example:

`entity_resolution_rate = correctly_resolved_runs / comparable_runs`

## No global AIO Score yet

A composite score is deferred until:

- an external benchmark exists;
- weights can be justified;
- inter-rater consistency is tested;
- calibration is documented;
- score interpretation is shown to be useful.

Until then, AIO CODE reports a **representation profile**, not a universal score.

## Output format

Preferred client/research output:

- strengths by dimension;
- conflicts;
- unsupported claims;
- missing canonical relationships;
- source gaps;
- repeated-run stability;
- observed changes from baseline;
- limitations and confounders.

## Integrity rule

> Recommendation is not recognition. Completeness is not accuracy. Citation is not causation. One successful run is not stability.