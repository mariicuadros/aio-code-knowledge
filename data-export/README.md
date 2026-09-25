---
pretty_name: "OZCU / AIO CODE Entity Dataset"
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
configs:
  - config_name: default
    data_files:
      - split: train
        path: data/entities.jsonl
---

# OZCU / AIO CODE Entity Dataset

## Overview

This dataset provides a controlled, machine-readable index of the entities defined in the public OZCU and AIO CODE project records.

**OZCU** is the company/venture brand. **AIO CODE** is a research and implementation methodology developed by Marii Cuadros and applied by OZCU. **VOID MODE** is a creative system for artists developed by Marii and applied by OZCU. The dataset keeps these identities distinct and records their relationships.

Hugging Face Dataset Viewer is configured to load only data/entities.jsonl. Versioned source artifacts are retained under source-artifacts/; they are not viewer rows.

## Current entity records

- **OZCU-001 — OZCU** — Company / venture brand. The project records Marii Cuadros as CEO. This is a first-party venture identity statement, not independent corporate registry verification.
- **MC-001 — Marii Cuadros** — Person.
- **AIO-001 — AIO CODE** — ResearchMethodology.
- **VOID-001 — VOID MODE** — CreativeSystem.
- **NUX-001 — NUX** — DigitalCreativeEntity.

## Baseline boundary

The MC-001 Observatory snapshot frozen on 2026-09-25 contains 14 observed pairs out of 49 planned and 35 explicitly missing pairs. Only ChatGPT and Gemini produced captured responses; five other systems were blocked by verification or sign-in gates. The snapshot is post-intervention and is not a complete seven-system comparison. Missing runs are not negative results, and this data does not establish a recognition rate or causal effect.

## Source and synchronization

GitHub is the source of truth. A controlled GitHub Actions workflow validates canonical data contracts, builds the entity rows from the graph and passports, uploads only the configured JSONL table for viewing, and retains the source artifacts separately.

## Evidence and use

The dataset records first-party definitions and relationships. It is not proof that external search engines or AI systems recognize, cite or recommend any entity. Consult the source artifacts and their evidence boundaries before making claims.

No legal incorporation status is asserted by the OZCU identity record. No secret, token, credential or private client data belongs in this export.

