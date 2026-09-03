# AIO CODE — Technical Knowledge Base

**Artificial Intelligence Optimization Code**  
**Version:** 3.0  
**Updated:** 2026-09-03  
**Creator:** Marii Cuadros

> **AIO CODE is a research project and experimental framework investigating how artificial intelligence systems and search engines identify, retrieve, resolve, represent, connect, cite and potentially recommend digital entities.**

## 1. Core Model

AIO CODE has two connected systems:

```text
ENTITY KNOWLEDGE
Entity → Content → Platforms → Claims → Relationships

RESEARCH SYSTEM
Baseline → Observation → Experiment → Measurement → Finding
```

The entity layer defines the objects being studied. The research layer measures how external systems behave toward those objects.

## 2. Canonical Entities

```text
MC-001 — Marii Cuadros
Entity Type: Person

NUX-001 — NUX
Entity Type: DigitalCreativeEntity

AIO-001 — AIO CODE
Entity Type: ResearchProject
```

Canonical relationships:

```text
MC-001 → creator_of → AIO-001
MC-001 → develops → NUX-001
```

These are separate entities. NUX is not an alias for Marii Cuadros, and AIO CODE is not Marii Cuadros.

## 3. Entity Passport Model

Each primary entity may be described using:

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

Passports establish canonical identity. They do not claim that external systems recognize the entity correctly.

## 4. Per-Entity Content Architecture

Content is separated by entity so that different identities remain semantically distinct.

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

Future registries may include videos, music, publications, campaigns, social posts, visual assets, playlists, projects and other documented content.

## 5. Claim Ledger

The Claim Ledger records the claims used by the project:

```text
Claim → Entity → Source → Date → Status
```

Evidence states remain distinct:

```text
Defined
Observed
Corroborated
Verified
Hypothesized
Unknown
Superseded
```

A claim is never strengthened merely because it is repeated across documents.

## 6. Entity Graph

The Entity Graph represents explicit relationships:

```text
Node → Relationship → Node
```

It provides a machine-readable map of the semantic structure surrounding the project.

## 7. Social Entity Map

The Social Entity Map represents public platform nodes belonging to each entity.

A platform node may record:

- platform;
- profile/page name;
- canonical entity ID;
- URL;
- language;
- content role;
- official status;
- first observation;
- last verification;
- status;
- notes.

A social profile is an information node. Its existence does not prove external AI recognition, entity resolution, citation or recommendation.

## 8. AI + Social Baseline

The AI + Social Baseline records the state of each entity before or at the start of an intervention.

A record should preserve:

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

Baseline data must remain historically preserved.

## 9. Research Pipeline

The AIO CODE external-system pipeline is:

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

A result at one stage does not automatically establish success at another.

## 10. Research Cycle

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

## 11. What Has Been Established vs. What Remains Open

AIO CODE has documented observations across search and AI systems. Those observations must retain their individual evidence classifications.

Established architecture includes:

- canonical entity definitions;
- entity separation;
- canonical relationships;
- structured research architecture;
- documented observations;
- evidence classification rules;
- measurement architecture.

Open research questions include:

- which individual signals contribute to recognition;
- how quickly changes become retrievable;
- how sources interact across systems;
- how structured data contributes to representation;
- how stable recognition becomes across systems and languages;
- whether recognition develops into recommendation;
- which parts of the methodology reproduce across additional entities.

## 12. Current Marii Cuadros Observation

On September 2, 2026, an incognito Google Search observation in Spanish surfaced an association with **Maria Luisa Cuadros** rather than consistently resolving to **Marii Cuadros**.

This is recorded as `ER-001`.

```text
Stage: Entity Resolution
Evidence: Observed
Status: Under Observation
Cause: Not Established
```

The competing representation is not incorporated into the canonical entity definition without separate evidence.

## 13. Current Experiment

`EXP-001` investigates whether strengthening canonical identity signals and cross-source consistency may improve consistent entity resolution in Google Search.

The hypothesis is explicitly treated as a hypothesis until measurements support a stronger conclusion.

## 14. Technical Principles

### Identity before visibility

Canonical identity must be defined before optimization is evaluated.

### Observation before interpretation

The recorded external result is separate from the explanation of why it occurred.

### Measurement before improvement claims

A later result is not automatically an improvement without an equivalent baseline and comparison.

### Source appearance does not prove causation

A source appearing in an AI response does not prove that it caused the response.

### Distributed architecture

GitHub, Blogger, Hugging Face, social platforms, publications and other public nodes can form a distributed information environment. Their evidentiary status is tracked separately.

## 15. Related Technical Assets

- `ENTITY-MASTER-RECORD.md`
- `RESEARCH-ARCHITECTURE.md`
- `AI-REPRESENTATION-PROTOCOL.md`
- `entity/`
- `entity/content/`
- `observatory/`
- `entity-labs/`
- `metrics/`
- `ethics/`
- `claim-ledger.json`
- `entity-graph.json`
- `social-entity-map.json`
- `ai-social-baseline.json`
- `schemas/`

## 16. Final Model

```text
DEFINE ENTITIES
      ↓
CONNECT CONTENT + SOURCES
      ↓
MAP RELATIONSHIPS
      ↓
ESTABLISH BASELINE
      ↓
OBSERVE EXTERNAL SYSTEMS
      ↓
TEST HYPOTHESES
      ↓
MEASURE CHANGE
      ↓
CLASSIFY EVIDENCE
      ↓
PUBLISH FINDINGS
```

> **AIO CODE is not a promise that AI systems will represent an entity in a particular way. It is a research system for observing, structuring and measuring that behavior.**
