# AIO CODE — Evidence Classification

## Purpose

This document defines how AIO CODE classifies research evidence.

The purpose is to ensure that observations, corroborated findings, verified findings, interpretations, hypotheses, and unknowns remain clearly separated throughout the research lifecycle.

---

## Core Rule

> **Evidence determines the strength of the claim.**

AIO CODE must never strengthen a claim beyond what its supporting evidence permits.

---

## Evidence Classification Model

AIO CODE uses five primary evidence states:

```text
Observed
    ↓
Corroborated
    ↓
Verified

Hypothesized
    ↓
Potential explanation

Unknown
    ↓
Insufficient evidence
````

These states do not represent a mandatory progression.

A result may remain Observed without becoming Corroborated or Verified.

A hypothesis may remain Hypothesized indefinitely.

Unknown is a valid research state.

---

## 1. Observed

### Definition

An observation is a result directly recorded under defined conditions.

An observation describes what occurred.

It does not require that the underlying mechanism be known.

### Minimum requirements

An observation should identify, whenever applicable:

* entity
* system
* date
* query or prompt
* language
* environment
* search mode
* observed result
* observation stage

### Example

```text
Entity:
MC-001 — Marii Cuadros

System:
Google Search

Environment:
Incognito

Language:
Spanish

Observed result:
"Maria Luisa Cuadros" appeared as an associated representation.
```

This is an observed result.

The cause of the association is not automatically established.

---

## 2. Corroborated

### Definition

A finding may be classified as Corroborated when the same or substantially similar phenomenon is supported by multiple independent observations, systems, measurements, sources, or controlled conditions.

Corroboration increases confidence that a phenomenon is recurring or consistently observable.

### Important limitation

```text
Corroboration ≠ Causation
```

Corroboration can strengthen confidence in the existence of a phenomenon without proving why it occurs.

### Example

If a particular entity-resolution behavior is independently observed:

* across multiple measurements
* across multiple systems
* across multiple dates
* or under multiple defined conditions

the phenomenon may qualify for Corroborated status.

The exact evidence supporting the classification must be recorded.

---

## 3. Verified

### Definition

A finding is Verified only in relation to a specific claim for which sufficient evidence has been established.

Verification is therefore claim-specific.

```text
Verified claim
    ≠
Verified complete mechanism
```

A system behavior may be verified without the underlying algorithm, mechanism, or causal explanation being verified.

### Example

A specific statement such as:

> "System X produced representation Y under condition Z."

may become Verified if the evidence is sufficiently documented and reproducible.

This does not automatically verify:

* why the system produced Y
* the complete mechanism responsible
* whether the same behavior occurs universally
* whether an intervention caused the behavior

---

## 4. Hypothesized

### Definition

A hypothesis is a proposed explanation, mechanism, relationship, or expected outcome that has not yet been sufficiently established.

Hypotheses guide experimentation.

They must not be presented as observed facts.

### Example

```text
Observation:
A competing representation appeared.

Hypothesis:
Strengthening canonical identity consistency may improve entity resolution.
```

The first statement describes an observation.

The second proposes a possible explanation or intervention effect.

They must remain separate.

---

## 5. Unknown

### Definition

Unknown means that the available evidence is insufficient to establish the relevant claim.

Unknown is not a failure of research.

It is an explicit representation of the current boundary of knowledge.

### Examples

```text
Unknown:
The exact cause of an entity-resolution error.

Unknown:
Whether an observed change was caused by a specific intervention.

Unknown:
Whether a behavior generalizes to systems that have not been tested.
```

Unknown must not be silently converted into either confirmation or rejection.

---

# Evidence Classification Rules

## Rule 1 — Observation Must Remain an Observation

If a result was directly recorded, it should not be downgraded to a hypothesis merely because its mechanism is unknown.

```text
Observed behavior
        ≠
Unknown mechanism
```

An unknown mechanism does not invalidate an observed result.

---

## Rule 2 — Interpretation Must Remain Separate

An interpretation explains what an observation might mean.

It is not automatically evidence.

```text
Observed result
      ↓
Interpretation
      ↓
Possible hypothesis
```

The interpretation should be explicitly labeled.

---

## Rule 3 — Corroboration Requires Independent Support

Repeatedly observing the same result under identical conditions does not automatically establish independent corroboration.

The research record should document what makes the supporting observations independent or meaningfully distinct.

---

## Rule 4 — Verification Is Bounded

A Verified finding applies only to the claim actually supported by the evidence.

Verification must not be generalized beyond the tested scope.

---

## Rule 5 — Causality Requires Additional Evidence

A temporal sequence does not by itself establish causation.

```text
Intervention
     ↓
Observed Change
     ≠
Proven Cause
```

Causal conclusions require appropriate experimental evidence and consideration of alternative explanations.

---

## Rule 6 — Expected Results Are Not Evidence

An expected result belongs to the experimental hypothesis.

It must not be entered as an observed result until it has actually been measured.

```text
Expected Result
     ≠
Observed Result
```

---

## Rule 7 — Negative Results Remain Evidence

The absence of expected improvement is still a research result.

AIO CODE preserves:

* no change
* negative change
* unexpected change
* inconsistent change
* failed intervention
* inconclusive result

---

## Rule 8 — Historical Classification Must Be Preserved

If a finding was classified as Observed at the time of recording, later evidence should not rewrite the original observation.

Instead:

```text
Original Observation
        ↓
Additional Evidence
        ↓
Updated Classification
```

The historical record remains available.

---

# Evidence and Research Architecture

Evidence classification connects the major AIO CODE modules:

```text
ENTITY
   ↓
OBSERVATORY
   ↓
ENTITY LABS
   ↓
METRICS
   ↓
ETHICS
   ↓
RESEARCH FINDING
```

### Entity

Defines the canonical identity being studied.

### Observatory

Records what systems actually produce.

### Entity Labs

Tests possible explanations and interventions.

### Metrics

Measures changes and comparisons.

### Ethics

Determines how evidence and claims must be classified and communicated.

---

# Evidence Traceability

Every significant research finding should be traceable through the architecture:

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
```

Where applicable, records should reference:

* entity ID
* observation ID
* experiment ID
* measurement ID
* metric ID
* system
* query or prompt
* date
* conditions
* supporting sources

---

# Current AIO CODE Evidence State

The current research record contains multiple types of evidence.

### Established identity definitions

The canonical identities of:

```text
MC-001 — Marii Cuadros
AIO-001 — AIO CODE
```

are explicitly defined within the AIO CODE entity architecture.

### Established relationship

The relationship:

```text
MC-001
    ↓ creator_of
AIO-001
```

is recorded as a canonical project relationship.

### Recorded entity-resolution observation

The observation:

```text
MC-001 — Marii Cuadros
        ↓
Observed representation:
Maria Luisa Cuadros
```

was recorded in Google Search under defined conditions.

The observation itself is established as an observation.

The underlying cause of that representation remains under investigation.

### Structured research architecture

AIO CODE has established structured research components for:

* entities
* relationships
* claims
* sources
* entity resolution
* observations
* systems
* prompts
* experiments
* metrics
* ethics

These artifacts constitute the documented research infrastructure.

---

# What AIO CODE Must Not Do

AIO CODE must not:

* convert an observation into a hypothesis simply because the mechanism is unknown
* present an interpretation as a verified fact
* present an expected result as an observed result
* claim causation from temporal sequence alone
* treat repeated identical observations as automatically independent corroboration
* generalize a verified claim beyond its tested scope
* erase negative or inconclusive results
* rewrite historical observations after new evidence appears
* fabricate evidence to strengthen a claim

---

# Claim Language

Research communication should use language proportional to evidence.

### Observed

Appropriate:

> "We observed..."

> "The system returned..."

> "The search result showed..."

### Corroborated

Appropriate:

> "The phenomenon was observed independently across..."

> "Multiple observations support..."

### Verified

Appropriate:

> "Under the tested conditions, the claim was verified..."

### Hypothesized

Appropriate:

> "We hypothesize that..."

> "A possible explanation is..."

> "This may indicate..."

### Unknown

Appropriate:

> "The available evidence is insufficient to determine..."

> "The cause remains unknown..."

---

# Evidence Integrity Principle

AIO CODE maintains the following distinction:

```text
Observed Fact
      ≠
Corroborated Evidence
      ≠
Verified Finding
      ≠
Interpretation
      ≠
Hypothesis
      ≠
Causal Conclusion
```

These categories must remain distinguishable in:

* GitHub documentation
* Hugging Face datasets
* research logs
* experiments
* metrics
* public explanations
* future publications

---

# Core Rule

> **Do not weaken established evidence because the mechanism is unknown.**

> **Do not strengthen a claim beyond its evidence.**

> **Record what happened separately from what you believe explains it.**

> **Preserve uncertainty where evidence is insufficient.**

---

## Status

**Module:** Ethics
**Document:** Evidence Classification
**Version:** 1.0
**Status:** Active
**Created:** 2026-09-02

AIO CODE — Artificial Intelligence Optimization Code

```
