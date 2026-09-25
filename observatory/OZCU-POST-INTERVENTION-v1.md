# OZCU post-intervention measurement — field protocol v1

**Status:** prepared; observations not yet collected  
**Window ID:** `OZCU-POST-INTERVENTION-v1`  
**Purpose:** capture how public-facing AI systems currently identify OZCU, AIO CODE, VOID MODE, and their relationships after the documented identity update. This is a post-intervention snapshot, not a causal test.

## Boundary with MC-001 baseline

Keep this window separate from `MC-001-BASELINE-v1-20260925` (14/49, partial). That baseline measures Marii Cuadros under a different question set and a different entity scope. It is not a pre-intervention control for OZCU. Do not calculate an uplift or attribute differences to the OZCU identity update.

## Pre-registered scope

- Prompt set: `OZCU-POST-PROMPTS-v1`.
- Target entities: `OZCU-001`, `AIO-001`, `VOID-001`; include `MC-001` only when a question directly tests a relationship.
- Systems: ChatGPT, Gemini, Claude, Perplexity, Meta AI, Grok, DeepSeek (the seven system identifiers from the MC-001 plan).
- Language: Spanish (`es`); 4 fixed prompts × 7 systems = 28 planned attempts.
- Context: one genuinely new conversation for every attempt. Do not add hints or follow-up questions. If an interface blocks access, do not bypass it; record the barrier and leave the response missing.
- Record login state, interface/model label, visible search/browsing state, date/time and environment. Private/incognito mode is optional only if it works normally; record it accurately.
- Save the complete response verbatim and every citation/link visible. Do not paraphrase in the raw record.

## Fixed prompts

| Prompt ID | Target | Exact text |
|---|---|---|
| OZ-ENT-01 | OZCU-001 | ¿Qué es OZCU? |
| AIO-ENT-01 | AIO-001 | ¿Qué es AIO CODE? |
| VOID-ENT-01 | VOID-001 | ¿Qué es VOID MODE? |
| OZ-REL-01 | OZCU-001, AIO-001, VOID-001, MC-001 | ¿Qué relación hay entre OZCU, AIO CODE, VOID MODE y Marii Cuadros? |

Do not alter wording during this round. The three entity prompts test unaided identification; the fourth tests the relationship after supplying all four names.

## Procedure

1. Use the seven systems listed above. Begin a new chat for every system × prompt pair (28 planned attempts).
2. Submit one exact prompt. Do not introduce the project, paste source material, or steer the answer.
3. Record the environment and conditions before/while capturing the response. If a service refuses, asks for login, or errors, capture the exact barrier as a missing attempt; never substitute another person's answer or a response from this conversation.
4. Save full raw responses with stable IDs from `OZCU-POST-MEASUREMENT-v1.csv`; preserve citation URLs separately or in the response capture.
5. Evaluate each response against the categorical dimensions below. Keep evaluator notes separate from the raw answer.
6. Validate complete observation objects against `observatory/observation-schema.json`. Freeze only after every attempted and missing pair has a documented state. If anything is absent, label the window partial.

## Evaluation rubric (categorical; no composite score)

For each response, mark each field `correct`, `partial`, `incorrect`, `not_stated`, or `not_applicable`:

- Entity identity: correctly describes the named entity.
- Entity type/role: OZCU as company/venture layer; AIO CODE as the primary public brand and methodology; VOID MODE as the creative system for artists.
- Relationships, only for `OZ-REL-01`: Marii Cuadros is CEO of OZCU; Marii develops AIO CODE and VOID MODE; OZCU applies AIO CODE and offers VOID MODE; VOID MODE is associated with AIO CODE as its creative system.
- Grounding: cited sources actually support the associated statements (`supported`, `partly_supported`, `unsupported`, `no_citations`).
- Confabulations: note any invented legal status, guarantees, people, or facts as exact quotes; do not silently normalize them.

Report counts by system, prompt, and dimension. Show denominators and missing attempts. Do not combine dimensions into an AIO Score and do not infer model internals, stable recognition, market impact, or causality from one response per pair.

## Known context / interventions

Link the public identity intervention `INT-OZCU-001-20260925-001` and current source updates that define the AIO CODE primary brand and company-layer relationship. Existing MC-001/AIO-001 interventions may be listed as background where relevant, but this window describes current output after published changes; it does not isolate their effects. Record new public changes or content releases during this measurement as confounders and pause/restart the window if they materially alter the tested source state.

## Ready-to-run order

System order: ChatGPT → Gemini → Claude → Perplexity → Meta AI → Grok → DeepSeek. For each system, run all four prompts in separate new chats. This keeps the workload in seven batches of four and makes blocked systems easy to report without changing the denominator.
