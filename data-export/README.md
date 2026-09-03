---
pretty_name: "AIO CODE Entity Dataset"
language:
  - en
  - es
tags:
  - entity-resolution
  - entity-linking
  - entity-representation
  - information-retrieval
  - knowledge-graph
  - artificial-intelligence
  - ai-research
  - digital-entities
---

# AIO CODE Entity Dataset

## Overview

The **AIO CODE Entity Dataset** is a structured research dataset produced by the AIO CODE project. It records canonical entities, relationships, claims, observations, experiments, metrics, platform representations, and selected content-ecosystem records used to study how digital entities are represented and resolved across AI systems and search environments.

AIO CODE is a research project focused on the pipeline:

```text
Indexation → Retrieval → Entity Resolution → Entity Representation → Citation → Recommendation
```

The dataset is designed as a structured downstream representation of selected machine-readable research artifacts. It is **not** a generative AI model, search engine, ranking system, or claim that any external system recognizes an entity correctly.

## Source and synchronization

GitHub is the project's **Source of Truth**. This dataset is populated through a controlled export generated from the canonical AIO CODE repository.

```text
GitHub Source of Truth
        ↓
Controlled Data Export
        ↓
Hugging Face Dataset
```

Only explicitly listed machine-readable sources are synchronized. The full research and documentation repository is not mirrored automatically.

## Dataset contents

The controlled export currently includes records covering:

- canonical entity graph
- social/entity mapping
- claim ledger
- AI/social baseline records
- entity-resolution observations
- experiment definitions and records
- metric definitions
- entity content registries
- platform registries
- Spotify playlist registry for MC-001

Canonical entities currently represented include:

- **MC-001 — Marii Cuadros** — Person
- **AIO-001 — AIO CODE** — ResearchProject
- **NUX-001 — NUX** — DigitalCreativeEntity

Canonical entities remain distinct. Relationships connect entities but do not collapse their identities.

## Evidence and research integrity

AIO CODE distinguishes between observed facts, interpretations, hypotheses, and verified findings. The dataset may contain records with different evidence states, including `observed`, `corroborated`, `verified`, `hypothesized`, and `unknown`.

An observation in this dataset should not be interpreted as proof of causality or as proof that an external AI system has established an entity identity.

**Evidence strength determines claim strength.**

## Data governance

The export follows these principles:

- Preserve canonical entity IDs.
- Do not invent URLs or platform presence.
- Do not overwrite historical observations with later measurements.
- Do not treat planned records as observed facts.
- Do not treat platform presence as proof of AI recognition.
- Do not treat defined canonical claims as externally verified findings.
- Keep canonical entities distinct unless evidence supports a relationship.
- Keep historical observations separate from later measurements.

No secret, token, credential, or private data belongs in the export layer.

## Intended use

This dataset is intended for research, documentation, structured analysis, entity-resolution experiments, and study of digital-entity representation across distributed information environments.

It should not be used as an authoritative source for claims about external search engines or AI systems without consulting the associated evidence and observation records.

## Project architecture

AIO CODE uses GitHub as its versioned research Source of Truth and Hugging Face as a structured data distribution layer. Public documentation and other representations may exist in additional project components, but they are governed separately from this controlled export.

## Versioning

The dataset is synchronized from the canonical GitHub repository through GitHub Actions. Changes to exported machine-readable sources can therefore produce new dataset revisions.

For methodology, provenance, schemas, and the complete research architecture, consult the AIO CODE Source of Truth repository.