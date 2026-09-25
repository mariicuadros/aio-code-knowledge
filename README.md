# AIO CODE

## AIO CODE — primary methodology and public brand

AIO CODE remains the primary public/project brand through 2027. OZCU is the company/venture layer and a reserve corporate identity; it does not replace or demote AIO CODE. Marii Cuadros develops AIO CODE and VOID MODE. VOID MODE is AIO CODE’s creative system for artists. This repository does not assert that a legal company has been incorporated.

## Artificial Intelligence Optimization Code

**Research Methodology · Entity Architecture · Evidence · AI Representation · Information Retrieval**

**Primary public brand and methodology:** `AIO-001` — AIO CODE  
**Company/venture layer:** `OZCU-001` — OZCU  
**Creative System:** `VOID-001` — VOID MODE  
**Canonical Type:** `ResearchMethodology`  
**Creator:** Marii Cuadros  
**Current Stage:** Pre-pilot evidence and replication preparation  
**Methodology Spec:** `AIO-METHODOLOGY-SPEC-v1.md`

> **Identity before visibility. Evidence before conclusions. Replication before generalization.**

## What is AIO CODE?

AIO CODE is a **research and implementation methodology** for structuring digital entities, documenting claims and relationships, and observing how third-party AI/search systems retrieve, resolve, represent, cite and potentially recommend those entities over time.

AIO CODE does **not** control third-party AI systems and does **not** guarantee recognition, ranking, citation or recommendation.

## What is already implemented?

The repository includes:

- canonical entity passports and an Entity Master Record;
- entity and platform relationship mapping;
- Claim Ledger;
- AI Observatory;
- Entity Labs;
- metrics and measurement protocols;
- Provenance Architecture;
- evidence and ethics rules;
- operational per-entity workspaces;
- content registries;
- prompt and baseline infrastructure.

## What remains under validation?

- contribution of individual public signals;
- retrieval/indexing timing;
- cross-platform effects;
- multilingual stability;
- reproducibility across additional entities;
- relationship between representation and recommendation;
- causal effects of specific interventions;
- commercial willingness to pay and recurring-monitoring value.

## Canonical entities

```text
AIO-001 — AIO CODE — Primary public brand and ResearchMethodology
OZCU-001 — OZCU — Company / venture layer; reserve corporate identity
MC-001 — Marii Cuadros — Person; develops AIO CODE and VOID MODE
VOID-001 — VOID MODE — CreativeSystem for artists
NUX-001 — NUX — DigitalCreativeEntity
```

Canonical relationships currently include:

```text
MC-001 → CEO_of → OZCU-001
MC-001 → creator_of → AIO-001
MC-001 → develops → VOID-001 and NUX-001
OZCU-001 → applies → AIO-001
AIO-001 → includes_creative_system → VOID-001
```

## Repository source-of-truth rule

The repository intentionally contains two related namespaces:

### `/entity/`

Canonical cross-entity identity specifications and passports.

### `/entities/<entity-slug>/`

Operational per-entity workspaces containing implementation records such as content, observatory data, evidence, provenance and platform-specific artifacts.

**Operational workspaces MUST reference canonical identity and MUST NOT silently redefine it.**

## Current methodology pipeline

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

## External-system stages

AIO CODE treats these as separate research variables:

```text
Indexation
Retrieval
Entity Resolution
Entity Representation
Citation
Recommendation
```

Success at one stage does not prove success at another.

## Evidence model

Evidence governance is defined in `EVIDENCE-STANDARD-v1.md`.

Evidence states:

- `unknown`
- `hypothesized`
- `observed`
- `corroborated`
- `verified`

Claim lifecycle is separate:

- `draft`
- `active`
- `superseded`
- `withdrawn`

> **First-party definition ≠ independent validation. Observation ≠ explanation. Correlation ≠ causation. Recognition ≠ recommendation.**

## Representation measurement

`RECOGNITION-RUBRIC-v1.md` replaces a single recognition ladder as the primary measurement framework.

AIO CODE now evaluates separate dimensions including:

- entity resolution;
- disambiguation;
- identity accuracy;
- attribute accuracy;
- relationship accuracy;
- official-source discovery;
- citation quality;
- hallucination;
- completeness;
- consistency;
- cross-system agreement;
- recommendation (separate dimension).

A global commercial **AIO Score is deferred** until benchmark calibration and reliability testing exist.

## Observatory

The Observatory is governed by `OBSERVATORY-PROTOCOL-v1.md`.

It records what external systems did under documented conditions. It does not claim access to private model weights, knowledge graphs, crawler pipelines or internal entity-resolution mechanisms unless such behavior is independently documented by the provider.

## Frozen Prompt Registry

`prompt-registry-v1.json` is the first frozen benchmark prompt registry for Baseline v1 preparation.

Material prompt wording changes require a new prompt version.

## Baseline status

`MC-001-BASELINE-v1-20260925` is frozen **partially**: 14 of 49 planned observations are recorded; 35 pairs are documented as missing. It is not complete coverage, a stability finding, or a causal comparison. The 35 missing observations are not zero results. See the frozen snapshot and its missing-pair register.

## Internal RAG readiness

See `RAG-READINESS-AUDIT-2026-09-24.md` for the initial gap assessment. A first **local, public-only lexical retrieval prototype** is now in `rag/`: an exact corpus allowlist, source/commit citations, 24 frozen acceptance questions, and an optional model-assisted draft generator. The source retrieval check currently finds an approved gold source in the first five results for 21/21 cases with a declared gold source. This is not a correctness or abstention score. No hosted answer service or independently validated generated answers exist yet. Public files do not determine how third-party AI systems retrieve information.

The Observatory has a planned 49-pair first measurement window and local capture/report tools in `observatory/`. `MC-001-BASELINE-v1-20260925` is frozen **partially at 14/49**, with 35 pairs documented as missing. It is not complete coverage or a causal comparison. The separate OZCU post-intervention window is also prepared but awaits its 28 platform captures.

Before the controlled Hugging Face export, `scripts/validate_core.py` checks the current JSON schemas and key canonical cross-references. Historical `ER-001` remains a legacy observation and is not silently converted to the new benchmark schema. Repository-only corrections are recorded in `governance/methodology-change-log.md`.

## Intervention governance

`INTERVENTION-PROTOCOL-v1.md` establishes the rule:

> **No material experimental change without an Intervention ID or Confounder Log entry.**

Changes observed after an intervention may be temporally associated with it without proving causation.

## Pilot governance

External pilots are governed by `PILOT-PROTOCOL-v1.md`.

The recommended initial pilot cohort is three structurally different external entities. The pilot validates whether the methodology is executable, traceable, comparable and useful—not whether AIO CODE can force third-party systems to return predetermined answers.

## Provenance

`PROVENANCE-ARCHITECTURE.md` documents creator/work origin, versions, human contribution, AI assistance, distribution and evidence history.

Provenance documentation does not itself create copyright or guarantee ownership/enforcement.

## Current primary case

`MC-001 — Marii Cuadros` is the primary longitudinal human reference case.

Historical observations, including entity-resolution errors, are preserved rather than rewritten.

MC-001 is a reference case; it is not sufficient by itself to establish general validity.

## Pre-pilot audit

See `AUDIT-2026-09-23.md`.

The audit identified the current critical path:

```text
Freeze
  ↓
Define
  ↓
Baseline
  ↓
Intervene
  ↓
Observe
  ↓
Measure
  ↓
Compare
  ↓
Replicate
```

## Core standards

- `AIO-METHODOLOGY-SPEC-v1.md`
- `EVIDENCE-STANDARD-v1.md`
- `RECOGNITION-RUBRIC-v1.md`
- `OBSERVATORY-PROTOCOL-v1.md`
- `INTERVENTION-PROTOCOL-v1.md`
- `PILOT-PROTOCOL-v1.md`
- `prompt-registry-v1.json`
- `claim-ledger.json`
- `observatory/observation-schema.json`
- `PROVENANCE-ARCHITECTURE.md`
- `brain/AIO-CODE-BRAIN-v1.md`
- `brain/templates/README.md`
- `semantic/search-map-v1.json`
- `commerce/commerce-register-v1.json`
- `product/checker-v0.1-spec.md`

## Methodology integrity rules

1. Identity before visibility.
2. Observation before interpretation.
3. Measurement before improvement claims.
4. Evidence before conclusions.
5. Historical observations are preserved.
6. Platform presence does not prove AI recognition.
7. Source appearance does not prove causation.
8. Evidence strength determines claim strength.
9. Recommendation is separate from recognition/retrieval.
10. Missing data is not zero.
11. A baseline is not complete until empirical records exist and are frozen.
12. Material interventions are traceable by ID.
13. First-party definitions are not automatically independent validation.
14. Replication is required before broad generalization.

## Current validation path

```text
AIO CODE 0 — Architecture
        ↓
AIO CODE 1 — Evidence
        ↓
AIO CODE 2 — Replication
        ↓
AIO CODE 3 — Market Validation
        ↓
AIO CODE 4 — Product
```

**Current focus: AIO CODE 1 — Evidence.**
