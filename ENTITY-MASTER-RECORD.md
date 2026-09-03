# AIO CODE — Entity Master Record

**Version:** 3.0  
**Status:** Active  
**Updated:** 2026-09-03  
**Project:** AIO CODE  
**Creator:** Marii Cuadros

## 1. Purpose

This document defines the canonical entity layer of AIO CODE. It is the source-of-truth reference for entity identity, semantic boundaries, canonical relationships and the structure used to connect each entity to its content, platforms, claims and research observations.

## 2. Canonical Entity Set

The current canonical entity set contains three primary entities:

```text
MC-001 — Marii Cuadros
NUX-001 — NUX
AIO-001 — AIO CODE
```

These entities are distinct. A relationship between entities must be explicit; an alias does not automatically create a new entity.

## 3. Entity Registry

### MC-001 — Marii Cuadros

- **Entity Type:** Person
- **Canonical Name:** Marii Cuadros
- **Role in AIO CODE:** Creator, researcher and primary human case entity
- **Passport:** `entity/ENTITY-PASSPORT-MARII-CUADROS.md`
- **Content Registry:** `entity/content/MC-001/content-registry.json`

### NUX-001 — NUX

- **Entity Type:** DigitalCreativeEntity
- **Canonical Name:** NUX
- **Role in ecosystem:** Distinct digital creative entity developed in association with Marii Cuadros
- **Passport:** `entity/ENTITY-PASSPORT-NUX.md`
- **Content Registry:** `entity/content/NUX-001/content-registry.json`

### AIO-001 — AIO CODE

- **Entity Type:** ResearchProject
- **Canonical Name:** AIO CODE
- **Full Name:** Artificial Intelligence Optimization Code
- **Role in ecosystem:** Research project and experimental framework
- **Passport:** `entity/ENTITY-PASSPORT-AIO-CODE.md`

## 4. Canonical Relationships

```text
MC-001 — Marii Cuadros
   │
   ├── creator_of → AIO-001 — AIO CODE
   │
   └── develops → NUX-001 — NUX
```

Canonical relationship records are maintained in `relationships.json` and mirrored in `entity-graph.json`.

## 5. Entity Passport Standard

Every primary entity passport should maintain, where applicable:

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

The passport defines the entity. It does not substitute for the evidence systems that measure external recognition or retrieval.

## 6. Entity Content Layer

Each entity receives its own content namespace. Content is organized by entity rather than mixed into the master identity record.

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

Additional content registries can be added without changing the canonical entity IDs.

## 7. Claim Ledger

`claim-ledger.json` tracks claims by:

```text
Claim → Entity → Source → Date → Evidence Status
```

The ledger separates canonical definitions from observations, hypotheses and verified findings.

## 8. Entity Graph

`entity-graph.json` is the machine-readable relationship layer connecting entities and their explicit relationships.

```text
Entities + Relationships → Entity Graph
```

The graph must not collapse distinct entities into a single identity merely because they are associated.

## 9. Social Entity Map

`social-entity-map.json` records how each entity is represented across public platforms.

A social profile is treated as a representation node. Its existence does not by itself prove successful AI recognition, entity resolution, citation or recommendation.

## 10. AI + Social Baseline

`ai-social-baseline.json` establishes the pre-intervention state across AI systems, search environments and social platforms.

Baseline records preserve:

- date;
- entity;
- system/platform;
- environment;
- query/prompt;
- language;
- representation;
- recognition;
- disambiguation;
- accuracy;
- citations/sources;
- relationship retrieval;
- recommendation;
- evidence status.

Historical baseline records must not be overwritten by later interventions.

## 11. Research Architecture

The entity layer feeds the research architecture:

```text
ENTITY PASSPORTS
        ↓
ENTITY MASTER RECORD
        ↓
CONTENT + PLATFORM NODES
        ↓
SOCIAL ENTITY MAP
        ↓
CLAIM LEDGER
        ↓
ENTITY GRAPH
        ↓
OBSERVATORY
        ↓
ENTITY LABS
        ↓
AI + SOCIAL BASELINE
        ↓
METRICS
        ↓
ETHICS
        ↓
FINDINGS
```

## 12. Evidence Integrity

AIO CODE distinguishes:

```text
Observed
Corroborated
Verified
Hypothesized
Unknown
```

Core rule:

> **Evidence strength determines claim strength.**

A canonical identity definition can be established even when an external system's mechanism remains unknown. Conversely, a temporal association does not establish causation.

## 13. Current Entity-Resolution Observation

```text
Observation ID: ER-001
Entity: MC-001 — Marii Cuadros
System: Google Search
Environment: Incognito
Language: Spanish
Observed representation: Maria Luisa Cuadros
Stage: Entity Resolution
Evidence: Observed
Status: Under Observation
Cause: Not Established
```

The competing representation remains an observation and is not added as a canonical alias without separate evidence establishing that relationship.

## 14. Related Documents

- `entity/ENTITY-PASSPORT-MARII-CUADROS.md`
- `entity/ENTITY-PASSPORT-NUX.md`
- `entity/ENTITY-PASSPORT-AIO-CODE.md`
- `entity-graph.json`
- `claim-ledger.json`
- `social-entity-map.json`
- `ai-social-baseline.json`
- `observatory/`
- `entity-labs/`
- `metrics/`
- `ethics/`
- `logbook/`

---

**Canonical Entity Set:** MC-001, NUX-001, AIO-001  
**Project:** AIO CODE  
**Version:** 3.0  
**Updated:** 2026-09-03
