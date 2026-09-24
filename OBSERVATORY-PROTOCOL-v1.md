# AIO CODE — Observatory Protocol v1

**Version:** 1.0  
**Date:** 2026-09-23  
**Status:** Canonical pre-pilot protocol

## Purpose

The Observatory Protocol defines how AIO CODE records comparable observations of third-party AI/search systems without claiming knowledge of their private internal mechanisms.

## Unit of observation

One observation is:

`Entity + System + System Version/Interface if known + Prompt ID + Prompt Text + Language + Environment + Context Condition + Timestamp + Output + Sources + Evaluation`

## Required fields

Every benchmark observation MUST include:

- `observation_id`
- `timestamp`
- `entity_id`
- `system`
- `system_interface_or_model_if_visible`
- `prompt_id`
- `prompt_registry_version`
- `prompt_text`
- `language`
- `country_or_location_context_if_relevant`
- `logged_in_state`
- `context_condition`
- `browsing_or_search_state_if_visible`
- `response_snapshot_or_ref`
- `observed_result`
- `sources_or_citations`
- `evaluation`
- `stage`
- `status`
- `evidence_state`
- `research_window_id`
- `related_intervention_ids`
- `confounder_ids`

## Context conditions

Use controlled labels:

- `fresh_context` — new conversation/session with no supplied entity context.
- `contextual` — prior conversation context may affect output.
- `incognito_or_private` — browser/private mode used where relevant.
- `unknown_context` — condition cannot be established.

Fresh-context observations are preferred for independent retrieval tests.

## Prompt immutability

Before a baseline/intervention comparison begins, freeze the Prompt Registry version.

A prompt change creates a new prompt version. Results from materially different prompt versions must not be treated as directly comparable without qualification.

## Response preservation

Preserve either:

1. full response text where lawful/appropriate and operationally feasible; or
2. an immutable snapshot/reference plus structured extraction.

Do not silently rewrite historical outputs.

## Evaluation

Evaluate using `RECOGNITION-RUBRIC-v1.md` and claim-level checks where applicable.

Primary dimensions include resolution, disambiguation, identity accuracy, attribute accuracy, relationship accuracy, official-source discovery, citation quality, hallucination, completeness, consistency and recommendation.

## Repeat runs

A single run can establish an observation. Stability requires repeated comparable runs.

The number of repetitions must be declared in the experiment or benchmark plan. Always publish numerator and denominator for rates.

## Cross-system comparison

Treat each AI/search system as a distinct environment. Do not infer that one system's result proves another system has the same knowledge, index, retrieval stack or internal representation.

## Internal mechanism boundary

Allowed:

`The system returned X and cited Y under condition Z.`

Not allowed without reliable provider documentation/evidence:

`The model stored X in its knowledge graph because Y caused ingestion.`

## Baseline freeze

A baseline version is frozen only when:

- its entity set is declared;
- its Prompt Registry version is declared;
- required runs are completed or explicitly marked missing;
- conditions are documented;
- snapshots/refs exist;
- the baseline receives a version ID and freeze timestamp.

An empty schema/container is not a baseline.

## Missing data

Missing is not zero. Use explicit null/missing states.

## Negative results

Preserve not-found, incorrect, degraded, contradictory and unstable outputs.

## Core rule

> The Observatory records what external systems did under documented conditions. It does not certify how those systems work internally.