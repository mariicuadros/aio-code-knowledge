# AIO CODE — Intervention Protocol v1

**Version:** 1.0  
**Date:** 2026-09-23  
**Status:** Canonical pre-pilot protocol

## Purpose

This protocol makes every material experimental change traceable and prevents undocumented simultaneous changes from being mistaken for causal evidence.

## Mandatory rule

> No material experimental change without an Intervention ID or Confounder Log entry.

## Intervention ID

Format:

`INT-{ENTITY_ID}-{YYYYMMDD}-{NNN}`

Example:

`INT-MC-001-20260923-001`

## Intervention record fields

Every intervention SHOULD record:

- `intervention_id`
- `entity_id`
- `timestamp`
- `research_window_id`
- `intervention_type`
- `target_system_or_platform`
- `target_url_or_record`
- `before_state_ref`
- `after_state_ref`
- `changed_variables`
- `unchanged_controls`
- `related_claim_ids`
- `related_prompt_registry_version`
- `hypothesis_id`
- `expected_effect`
- `evidence_refs`
- `operator`
- `reversibility`
- `confounders_known_at_time_of_change`
- `status`

## Material intervention examples

- changing a canonical biography;
- adding/removing structured data;
- publishing or deleting an entity page;
- changing entity relationships;
- adding public source links;
- changing public handles/names;
- publishing experimental content;
- changing metadata intended to affect discovery or resolution;
- syndicating the same claim to additional nodes.

## Non-experimental methodology correction

Documentation fixes that only clarify internal rules without changing the public target entity may be recorded as:

`intervention_type: methodology_correction`

They must not be attributed as entity-performance interventions.

## Confounder Log

A material uncontrolled event during a measurement window receives a `CONF-*` ID.

Examples:

- viral post;
- unrelated press coverage;
- platform algorithm/update;
- major profile change not part of the planned intervention;
- independent third-party mention;
- crawler/indexing change discovered after the fact;
- changed account/login/personalization condition.

## Bundled interventions

If several changes are intentionally released together, assign one parent intervention and child actions. The project may measure the bundle but MUST NOT attribute the outcome to an individual child action unless separately tested.

## Timing

Use explicit measurement points where feasible:

`T-1 / T0 / T+1 / T+N`

The unit may be hours or days, but it must be declared in the experiment.

## Causal language

Post-intervention change may be described as:

- observed after intervention;
- temporally associated with intervention;
- consistent with the hypothesis;
- not observed;
- mixed;
- inconclusive.

Do not say the intervention caused the outcome unless the evidence standard for that causal claim has been satisfied.

## Integrity rule

> If we cannot reconstruct what changed, when it changed, and what else changed around it, we cannot make a defensible attribution claim.