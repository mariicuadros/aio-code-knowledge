# AIO CODE — Research Integrity

## Purpose

This document defines the research integrity controls used by AIO CODE to preserve the reliability, traceability, reproducibility, and historical integrity of its research record.

Research integrity applies to observations, experiments, measurements, datasets, interpretations, findings, and public communication.

---

## Core Principle

> **The research record must represent what was actually observed, measured, tested, and supported by evidence.**

AIO CODE must not alter evidence to produce a preferred conclusion.

---

# 1. Data Integrity

Research data must represent the original recorded result as accurately as practical.

AIO CODE must preserve:

- original observations
- original measurements
- original system outputs
- dates and conditions
- experiment states
- negative results
- inconclusive results
- unexpected results

Derived values may be added, but they must remain distinguishable from original observations.

```text
Raw Observation
      ↓
Derived Measurement
      ↓
Interpretation
````

These layers must not be silently merged.

---

# 2. No Fabrication

AIO CODE must never fabricate:

* observations
* measurements
* system responses
* citations
* sources
* experiments
* verification
* corroboration
* research results

An expected result must never be recorded as an observed result.

```text
Expected Result
      ≠
Observed Result
```

---

# 3. No Silent Modification

Historical research records should not be silently modified to make previous results appear more favorable.

When a record requires correction:

```text
Original Record
      ↓
Correction
      ↓
Reason for Correction
      ↓
Updated Record
```

The original state should remain recoverable whenever technically practical.

---

# 4. Historical Integrity

AIO CODE treats research as a time-dependent record.

A conclusion that was reasonable at one point may change after additional evidence becomes available.

This does not make the original observation invalid.

Instead:

```text
Historical Observation
        ↓
Additional Evidence
        ↓
Updated Interpretation
```

The evolution of understanding should remain documented.

---

# 5. Traceability

Every significant finding should be traceable to the evidence supporting it.

The preferred research chain is:

```text
Entity
   ↓
Observation
   ↓
Experiment
   ↓
Measurement
   ↓
Metric
   ↓
Evidence Classification
   ↓
Finding
   ↓
Conclusion
```

Where applicable, records should reference:

* entity ID
* observation ID
* experiment ID
* measurement ID
* metric ID
* system ID
* prompt ID
* source ID
* date
* research conditions

---

# 6. Reproducibility

Research procedures should be documented sufficiently for another researcher to understand how the result was obtained.

Whenever practical, the record should include:

* entity evaluated
* system evaluated
* query or prompt
* language
* environment
* search mode
* date and time
* measurement procedure
* intervention
* expected result
* observed result
* metric
* evidence classification

Reproducibility does not require that every external system produce identical results indefinitely.

Dynamic systems may change over time.

The objective is to preserve enough information to reproduce or meaningfully re-evaluate the research condition.

---

# 7. Baseline Integrity

Before an intervention is evaluated, the pre-intervention state should be preserved whenever practical.

```text
Baseline
    ↓
Intervention
    ↓
Post-Intervention Measurement
    ↓
Comparison
```

A baseline must not be retrospectively changed to make an intervention appear more effective.

If the baseline was incomplete, this limitation must be recorded.

---

# 8. Measurement Integrity

Measurements must remain distinguishable from interpretations.

For example:

```text
Measurement:
Entity Resolution Rate = 70%

Interpretation:
Resolution appears to have improved.

Hypothesis:
Improved source consistency may have contributed to the change.
```

These are three different research statements.

A measurement does not automatically establish its explanation.

---

# 9. Comparability

Research comparisons should use equivalent conditions whenever possible.

Relevant conditions include:

* system
* query
* prompt
* language
* environment
* search mode
* date
* measurement procedure

When conditions differ, the difference must be documented.

A change under different conditions should not automatically be presented as a controlled comparison.

---

# 10. Negative and Inconclusive Results

AIO CODE preserves results regardless of whether they support the expected outcome.

Valid research outcomes include:

```text
Improvement
No Change
Negative Change
Unexpected Result
Inconsistent Result
Failed Intervention
Inconclusive Result
Insufficient Evidence
```

A failed experiment remains part of the research record.

---

# 11. Evidence Classification Integrity

AIO CODE maintains explicit distinctions among:

```text
Observed
Corroborated
Verified
Hypothesized
Unknown
```

The classification must reflect the evidence available for the specific claim.

An observation should not be downgraded simply because its mechanism is unknown.

A hypothesis should not be upgraded simply because it appears plausible.

A verified claim should not be generalized beyond the conditions supporting it.

---

# 12. Causal Integrity

AIO CODE must distinguish temporal association from causation.

```text
Intervention
     ↓
Observed Change
     ≠
Proven Causation
```

When an outcome follows an intervention, alternative explanations should be considered.

Causal conclusions require additional evidence appropriate to the research design.

---

# 13. Entity Integrity

Canonical entities must remain stable and distinguishable from competing representations.

Example:

```text
Canonical Entity:
MC-001 — Marii Cuadros

Competing Representation:
Maria Luisa Cuadros
```

A competing representation may be recorded as an observation.

It must not be silently incorporated into the canonical entity definition.

The same principle applies to AIO CODE:

```text
Canonical Entity:
AIO-001 — AIO CODE

Full Name:
Artificial Intelligence Optimization Code

Entity Type:
ResearchProject
```

---

# 14. Source Integrity

Sources should be identifiable and traceable.

Where practical, AIO CODE should record:

* source identifier
* source type
* source location
* relationship to the research claim
* date of observation
* whether the source is canonical, supporting, or observational

A source should not be presented as authoritative merely because it contains a desired statement.

---

# 15. System Output Integrity

Outputs from AI systems and search engines must be recorded as system observations.

```text
System
   ↓
Query / Prompt
   ↓
Observed Output
   ↓
Research Interpretation
```

A system response should not be altered and presented as the original response.

Summaries or interpretations must remain distinguishable from the original observation.

---

# 16. Intervention Integrity

Research interventions must be documented.

An intervention record should identify:

* what was changed
* why it was changed
* which entity was affected
* which sources were affected
* expected result
* measurement plan
* date of intervention

Interventions must not be described as successful before their outcomes are measured.

---

# 17. Responsible Research

AIO CODE research must use legitimate and proportionate methods.

The project must not intentionally rely on:

* fraud
* deception intended to conceal findings
* unauthorized access
* system abuse
* fabricated identities
* fabricated evidence
* manipulation of research records
* intentional concealment of negative results

Research activity should remain within appropriate platform, legal, and ethical boundaries.

---

# 18. Privacy

AIO CODE should minimize unnecessary collection and publication of personal information.

Research records should contain only information necessary for the research objective.

Sensitive or unnecessary personal information should not be incorporated into public datasets.

---

# 19. Separation of Research Layers

AIO CODE maintains the following distinction:

```text
Observation
      ↓
Measurement
      ↓
Interpretation
      ↓
Hypothesis
      ↓
Finding
      ↓
Causal Conclusion
```

Each layer has a different evidentiary requirement.

No layer should be silently substituted for another.

---

# 20. Public Communication Integrity

Public explanations of AIO CODE research should preserve the distinction between:

### What was observed

What a system actually returned or what was directly measured.

### What was corroborated

What multiple independent observations support.

### What was verified

What has sufficient evidence for the specific claim.

### What was interpreted

What the research team believes an observation may indicate.

### What was hypothesized

What remains a proposed explanation or expected relationship.

### What remains unknown

What the available evidence cannot currently establish.

---

# 21. Research Corrections

If an error is discovered, the correction should:

1. Identify the affected record.
2. Preserve the original state when practical.
3. Describe the correction.
4. Explain why the correction was necessary.
5. Update dependent records if required.
6. Preserve traceability to the correction.

Corrections should improve accuracy without erasing research history.

---

# 22. Auditability

AIO CODE should remain auditable across its research architecture.

An auditor or future researcher should be able to determine:

```text
What was studied?
      ↓
What was observed?
      ↓
What was tested?
      ↓
What was measured?
      ↓
What evidence was available?
      ↓
How was the evidence classified?
      ↓
What conclusion was permitted?
```

---

# Integrity Test

Before publishing a significant finding, AIO CODE should be able to answer:

```text
[ ] Is the entity clearly identified?

[ ] Is the observation documented?

[ ] Is the system identified?

[ ] Are the query or prompt and conditions known?

[ ] Is the baseline preserved where applicable?

[ ] Is the intervention documented?

[ ] Is the result actually measured?

[ ] Are raw observations separated from interpretation?

[ ] Is the evidence classification appropriate?

[ ] Are alternative explanations considered?

[ ] Are negative or inconclusive results preserved?

[ ] Is the conclusion proportional to the evidence?

[ ] Can the finding be traced to its supporting records?
```

If critical information is missing, the strength of the conclusion should be limited accordingly.

---

# AIO CODE Integrity Rule

> **Record what happened.**

> **Preserve how it was measured.**

> **Separate observation from interpretation.**

> **Separate interpretation from hypothesis.**

> **Do not erase negative results.**

> **Do not strengthen claims beyond their evidence.**

> **Preserve the historical research state.**

> **Make conclusions traceable to evidence.**

---

## Status

**Module:** Ethics
**Document:** Research Integrity
**Version:** 1.0
**Status:** Active
**Created:** 2026-09-02

AIO CODE — Artificial Intelligence Optimization Code

```

