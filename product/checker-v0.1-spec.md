# AIO CODE Checker v0.1 — product and evaluation contract

**Status:** Free, no-API prototype scope  
**Public brand:** AIO CODE  
**Version date:** 2026-09-25  
**Deployment:** Source is in the repository; live Vercel publication must be verified separately.

## User promise

Help a creator or small organization identify missing building blocks in its public entity documentation and provenance workflow. The tool returns a descriptive checklist of completed, partial, unknown, and missing items.

It does not query external AI/search systems, certify a person or brand, predict rankings, or guarantee recognition, citations, recommendations, audience growth, legal clearance, or commercial readiness.

## v0.1 workflow

1. User selects statuses for a fixed set of evidence and operational checks.
2. Browser displays category-level gaps and next actions.
3. User can print/save the report locally via the browser print dialog.
4. The page makes no network calls, stores no answers, and collects no email or personal data.

## Domains

- Identity and entity boundaries.
- Canonical public source and structured identity.
- Claims, evidence and source traceability.
- Cross-platform representation and relationship consistency.
- Content provenance.
- Rights, permission and disclosure documentation.
- Observation and measurement readiness.

## Evaluation rules

- Status vocabulary: `yes`, `partial`, `no`, `unknown`.
- No weighted score, ranking, recommendation, or pass/fail certificate.
- A category is “documented” only when all its checks are `yes`.
- A category with unresolved rights or source evidence must be presented as a gap.
- Report wording must say it is a creator-entered self-assessment; answers are not independently verified.
- The UI must clearly distinguish documentation readiness from external AI recognition.

## Inputs and outputs

Input fields are categorical selections only. No free-text fields or URLs are collected in v0.1. Output includes the selected statuses, grouped gaps, generated time and the tool limitation statement. Data remains in page memory and is not submitted to a server.

## Next gates before any commercial scoring

1. Validate each item with at least five external users across different entity types.
2. Review agreement between users and an independent evaluator.
3. Separate observed external recognition from self-reported infrastructure.
4. Define privacy, retention, consent and data export before collecting lead data.
5. Do not add a composite score until reliability and construct validity have been tested.

## Acceptance checks

- Works on a current desktop/mobile browser without API credentials.
- Can complete and print a report with no network requests.
- States prominently that no external AI/search systems were queried.
- Uses keyboard-accessible radio controls and visible labels.
- Does not call the result an audit, certification, or validated AIO score.
