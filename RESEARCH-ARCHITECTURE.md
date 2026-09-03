# AIO CODE — Research Architecture

**Version:** 3.0  
**Updated:** 2026-09-03  
**Status:** Active

## 1. Purpose

AIO CODE combines an **entity architecture** with an **observational research architecture**.

The entity architecture defines what exists and how entities relate. The research architecture records what external systems do with those entities and measures changes over time.

## 2. Canonical Entities

```text
MC-001 — Marii Cuadros       Person
NUX-001 — NUX                DigitalCreativeEntity
AIO-001 — AIO CODE           ResearchProject
```

Canonical relationships:

```text
MC-001 → creator_of → AIO-001
MC-001 → develops → NUX-001
```

## 3. Two-Layer Architecture

### Layer A — Entity Knowledge

```text
Entity Passport
      ↓
Entity Master Record
      ↓
Content Registry
      ↓
Social Entity Map
      ↓
Claim Ledger
      ↓
Entity Graph
```

This layer answers:

> **What is the entity, what belongs to it, what does it connect to, and what claims are documented about it?**

### Layer B — Research and Measurement

```text
AI + Social Baseline
      ↓
Observatory
      ↓
Entity Labs
      ↓
Metrics
      ↓
Evidence Classification
      ↓
Findings
```

This layer answers:

> **How do external systems represent, retrieve, resolve, cite and recommend the entity, and how does that change over time?**

## 4. Complete System

```text
                         AIO CODE
                            │
              ┌─────────────┴─────────────┐
              │                           │
       ENTITY KNOWLEDGE              RESEARCH SYSTEM
              │                           │
      Entity Passports              AI + Social Baseline
              ↓                           ↓
      Content Registries              Observatory
              ↓                           ↓
      Social Entity Map               Entity Labs
              ↓                           ↓
        Claim Ledger                   Metrics
              ↓                           ↓
        Entity Graph                Evidence / Ethics
              └─────────────┬─────────────┘
                            ↓
                         Findings
```

## 5. Entity Passport Standard

Each primary entity passport should contain, where applicable:

- Entity ID
- Canonical Name
- Aliases
- Entity Type
- Description
- Roles
- Projects
- Relationships
- Platforms
- Official Sources
- Languages
- Timeline
- Version
- Status

The passport is the canonical identity layer. It must not be used to rewrite historical observations.

## 6. Content Architecture

Content is organized per entity so that Marii Cuadros and NUX do not become semantically mixed.

```text
entity/content/
├── MC-001/
│   ├── content-registry.json
│   ├── platforms.json
│   └── spotify-playlists.json
│
└── NUX-001/
    ├── content-registry.json
    └── platforms.json
```

New content domains can be added as separate registries without changing entity IDs.

## 7. Claim Ledger

The Claim Ledger records:

```text
Claim ID
Entity ID
Claim
Source
Date
Evidence Status
```

Claims may be:

- defined;
- observed;
- corroborated;
- verified;
- hypothesized;
- unknown;
- superseded.

A claim's status is claim-specific.

## 8. Entity Graph

The Entity Graph is the machine-readable representation of relationships between canonical entities and future documented nodes.

```text
Node → Relationship → Node
```

It prevents accidental identity collapse and makes relationships explicit.

## 9. Social Entity Map

The Social Entity Map records platform-level representations.

For each platform node, record when available:

- platform;
- profile/page name;
- entity ID;
- URL;
- language;
- content role;
- official status;
- first observed;
- last verified;
- status;
- notes.

A social profile is a representation node, not proof of AI recognition.

## 10. AI + Social Baseline

The baseline establishes the pre-intervention state of each entity across relevant AI systems, search environments and social platforms.

A baseline record should preserve:

```text
Date
Entity
System / Platform
Environment
Query / Prompt
Language
Observed Representation
Recognition
Disambiguation
Accuracy
Sources / Citations
Relationship Retrieval
Recommendation
Evidence Status
Notes
```

Historical baseline records are immutable research evidence.

## 11. Research Pipeline

AIO CODE uses the following external-system pipeline:

```text
Indexation
    ↓
Retrieval
    ↓
Entity Resolution
    ↓
Entity Representation
    ↓
Citation
    ↓
Recommendation
```

These are separate stages. Success at one stage does not imply success at another.

## 12. Operational Research Cycle

```text
Observation
    ↓
Research Question
    ↓
Hypothesis
    ↓
Experiment
    ↓
Baseline
    ↓
Intervention
    ↓
Measurement
    ↓
Comparison
    ↓
Evidence Classification
    ↓
Interpretation
    ↓
Finding
    ↓
Replication / Refinement
```

## 13. Evidence Model

```text
Observed
Corroborated
Verified
Hypothesized
Unknown
```

These states must not be collapsed.

> **Observed fact ≠ interpretation ≠ hypothesis ≠ causal conclusion.**

The project may have established observations and corroborated findings even when the underlying mechanism remains unknown.

## 14. Current Case — Marii Cuadros

Observation `ER-001` records an entity-resolution issue in Google Search under an incognito Spanish-language condition on September 2, 2026: an association with **Maria Luisa Cuadros** was surfaced instead of consistently resolving to **Marii Cuadros**.

The observation is established. Its cause is not established.

Experiment `EXP-001` investigates whether strengthening canonical identity signals and cross-source consistency may improve consistent resolution.

## 15. Repository Map

```text
entity/
    Canonical entity passports and per-entity content

observatory/
    External-system observations and schemas

entity-labs/
    Experiments and hypotheses

metrics/
    Measurement definitions and protocols

ethics/
    Evidence classification and research integrity

logbook/
    Chronological research record

schemas/
    Machine-readable schemas

claim-ledger.json
    Claim registry

entity-graph.json
    Relationship graph

social-entity-map.json
    Platform representation map

ai-social-baseline.json
    AI + social baseline
```

## 16. Source-of-Truth Rules

1. Entity IDs remain stable.
2. Canonical names are changed only deliberately and with version history.
3. Historical observations are never silently rewritten.
4. Claims reference sources and dates.
5. External-system observations belong in the Observatory.
6. Hypotheses belong in Entity Labs.
7. Measurements belong in Metrics.
8. Evidence strength determines claim strength.
9. A platform presence does not prove AI recognition.
10. Temporal association does not prove causation.

## 17. Final Architecture Principle

> **Define the entity. Connect the evidence. Observe the systems. Measure the change. Preserve the history.**
