# AIO CODE — Methodology Specification v1

**Company context:** OZCU-001 (OZCU)
**Entity:** AIO-001  
**Version:** 1.0  
**Date:** 2026-09-23  
**Status:** Canonical pre-pilot specification

## 1. Definition

AIO CODE is the methodology developed by Marii Cuadros and applied by OZCU. It is a **research and implementation methodology** for structuring digital entities, documenting claims and relationships, and observing how third-party AI/search systems retrieve, resolve, represent, cite and potentially recommend those entities over time.

AIO CODE does not control third-party AI systems and does not guarantee their outputs.

## 2. Core problem

Public digital identities are often fragmented across websites, repositories, social platforms, media, projects and brands. AI/search systems may therefore resolve, describe or connect the same entity inconsistently.

AIO CODE provides an auditable layer for:

- canonical identity;
- entity relationships;
- claims and evidence;
- content and provenance;
- platform representations;
- external-system observations;
- interventions;
- measurements;
- longitudinal comparisons.

## 3. Canonical pipeline

```text
Canonical Entity
    ↓
Claims + Evidence
    ↓
Relationships + Content + Provenance
    ↓
Platform Representations
    ↓
Baseline Observation
    ↓
Intervention
    ↓
Post-Intervention Observation
    ↓
Measurement
    ↓
Comparison
    ↓
Finding
    ↓
Replication / Refinement
```

## 4. External-system stages

AIO CODE distinguishes:

```text
Indexation
Retrieval
Entity Resolution
Entity Representation
Citation
Recommendation
```

Success at one stage does not prove success at another.

## 5. Architecture roles

### Canonical identity layer

Defines what an entity is and its stable identifiers.

Primary cross-entity specifications currently live under `/entity/` and the Entity Master Record.

### Operational entity workspaces

`/entities/<slug>/` contains operational records for a specific entity. These workspaces may contain content, evidence, observatory records, provenance and other implementation artifacts, but MUST reference rather than silently redefine canonical identity.

### Evidence layer

Governed by `EVIDENCE-STANDARD-v1.md`.

### Observatory

Governed by `OBSERVATORY-PROTOCOL-v1.md`. Records outputs and conditions; does not claim access to private third-party mechanisms.

### Intervention layer

Governed by `INTERVENTION-PROTOCOL-v1.md`.

### Measurement layer

Uses component metrics and `RECOGNITION-RUBRIC-v1.md`. A global commercial AIO Score is deferred pending calibration.

## 6. Canonical entity typing

`AIO-001` canonical entity type: `ResearchMethodology`.

Commercial forms such as service, audit, software product, platform or future company are separate descriptors and MUST NOT replace the canonical methodological entity type.

## 7. Evidence principle

```text
First-party definition ≠ independent validation
Observation ≠ interpretation
Correlation ≠ causation
Recognition ≠ recommendation
One run ≠ stability
```

## 8. What AIO CODE can currently claim

AIO CODE can claim that it provides a documented framework for:

- defining and separating entities;
- mapping explicit relationships;
- recording evidence-backed claims;
- tracking source and content provenance;
- auditing consistency;
- recording external AI/search representations;
- comparing observations across time under documented conditions;
- registering interventions and confounders;
- preserving positive, negative and inconclusive results.

## 9. What remains under validation

- contribution of individual public signals;
- timing of retrieval/indexing changes;
- cross-platform interaction effects;
- cross-language stability;
- generalization beyond MC-001;
- repeatability of outcomes across entities;
- relationship between representation and recommendation;
- commercial willingness to pay;
- value of recurring monitoring;
- calibration of any future composite score.

## 10. Product boundary

Before replicated pilot validation, product language SHOULD focus on:

**Audit → Structure → Document → Observe → Measure**

not:

**Guarantee recognition → guarantee ranking → guarantee recommendation.**

## 11. Primary current case

`MC-001 — Marii Cuadros` is the primary longitudinal human case. It is a reference case, not sufficient by itself to establish general validity.

## 12. Validation path

```text
Architecture
    ↓
Evidence
    ↓
Replication
    ↓
Market Validation
    ↓
Product
```

## 13. Pre-pilot gate

External pilots should begin only after:

- frozen Prompt Registry;
- MC-001 Baseline v1;
- operational Evidence Standard;
- operational Intervention Protocol;
- representation rubric;
- Observatory protocol;
- Pilot Protocol;
- participant/data boundaries;
- manual audit template.

## 14. Core methodological rule

> Define the entity. Connect the evidence. Freeze the baseline. Register the intervention. Observe the systems. Measure the change. Preserve uncertainty. Replicate before generalizing.