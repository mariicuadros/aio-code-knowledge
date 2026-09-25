# MC-001 case study — AIO CODE reference case

**Case ID:** `CASE-MC-001-AIOCODE-v1`  
**Status:** Active; descriptive draft  
**Entity:** MC-001 — Marii Cuadros  
**Methodology:** AIO CODE (AIO-001)  
**Public brand:** AIO CODE  
**Snapshot date:** 2026-09-25

## Purpose

Document the first-party longitudinal reference case used to develop AIO CODE’s entity records, evidence rules, baseline workflow, and observation rubric. This case demonstrates the workflow and its current limits; it does not independently validate the methodology or establish that AIO CODE caused external system behavior.

## Research question

Can a documented entity architecture, provenance-aware public sources, and controlled observations support repeatable analysis of how search and AI systems retrieve, resolve, represent, and cite information about a person and related projects?

## Scope

- Primary entity: MC-001 — Marii Cuadros.
- Related entities: AIO-001 (AIO CODE), NUX-001 (narrative entity), and VOID MODE where a specific relationship question requires it.
- Systems and prompts: see the frozen Prompt Registry and baseline plan.
- Research stages are evaluated separately: retrieval, entity resolution, identity/attribute accuracy, relationship accuracy, grounding, citation validity, and recommendation.

## Intervention history

Preserve the dated Intervention IDs and exact scope in the repository. The September 2026 public identity updates and AIO CODE source changes precede the available baseline snapshot. Record deviations and later edits as separate interventions; do not reconstruct an unobserved counterfactual.

## Available observation

`MC-001-BASELINE-v1-20260925` is a **partial post-intervention snapshot**: 14 of 49 planned system-prompt pairs are represented; 35 missing pairs are enumerated with reasons. The snapshot is not complete coverage and is not a clean pre-intervention control.

See `ai-social-baseline.json`, `observatory/baseline-plan-v1.json`, and `observatory/runs/` for the raw records and plan. The snapshot includes recorded instances of ambiguous or incorrect resolution and instances where systems request more identifying context. Interpret each observation under its actual prompt and session conditions.

## Findings status

No aggregate uplift, stability, causal effect, or general-population result is asserted. The partial observations can support case-specific descriptions only. Raw responses and citations remain the authority; summary notes must not replace them.

## Method and data handling

For each observation, retain the exact prompt, full response, date/time, interface/model label when visible, language, login/session state, browsing state, environment, visible links/citations, and evaluation notes. Keep raw capture distinct from evaluator judgments. Record access barriers as missing observations, never as negative outcomes.

## Limitations

1. The snapshot is partial (14/49).
2. It is post-intervention; no equivalent pre-intervention data establish a before/after effect.
3. One person’s case cannot establish external validity.
4. Interface outputs may change by model, account state, retrieval configuration, geography, date, and prompt context.
5. First-party identity records and self-reports are not independent validation.
6. Search visibility, retrieval, entity resolution, citation, and recommendation are different outcomes.

## Next evidence gates

- Keep the partial baseline frozen as its own dated snapshot.
- Complete or explicitly account for the planned missing pairs when ordinary access permits; preserve new runs separately.
- Run the separate OZCU post-intervention snapshot using its own protocol and prompts.
- Replicate the manual workflow with structurally different external entities, consent and documented conditions before making generalized or commercial performance claims.

## Approved description

> MC-001 is AIO CODE’s first-party reference case for developing and demonstrating a provenance-aware entity observation workflow. Its current 14/49 post-intervention snapshot is partial and does not establish causal impact or general validity.

## Change log

| Date | Change | Evidence |
|---|---|---|
| 2026-09-25 | Created descriptive case record from the frozen partial snapshot and current repository state. | `MC-001-BASELINE-v1-20260925`; source commit recorded in bitácora. |
