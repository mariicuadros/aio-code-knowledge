# AIO CODE Observatory

## Purpose

The AIO CODE Observatory is the observation layer of the research project.

It formalizes the observations already recorded through the AIO CODE logbook and provides a consistent structure for monitoring how digital entities are discovered, retrieved, resolved, represented, cited, and potentially recommended by AI systems, search engines, and distributed information environments.

The Observatory does not replace the logbook. The logbook preserves the chronological narrative of the research. The Observatory provides a structured analytical layer over those observations.

## Core Principle

> Observation must be separated from interpretation.

An observed change is recorded as evidence. A possible explanation is recorded as a hypothesis and must not be presented as an established causal mechanism without additional evidence.

## Observation Model

Each observation should be represented through the following sequence:

```text
Entity
↓
System / Environment
↓
Query or Observation Trigger
↓
Observed Result
↓
Evidence / Source
↓
Interpretation
↓
Confidence
```

## Research Pipeline

The Observatory follows the AIO CODE visibility pipeline:

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

These stages are treated as distinct research variables. Recognition at one stage does not imply success at every subsequent stage.

## AI Observation Layer

AI observations may include:

- ChatGPT
- Gemini
- Perplexity
- other AI systems used in the research

Tests may compare:

- Spanish vs. English queries;
- contextual vs. reduced-context queries;
- direct entity queries;
- definition queries;
- relationship queries;
- source-restricted queries;
- recommendation queries;
- entity-disambiguation queries.

For each test, the research records what the system actually returned rather than assuming the intended outcome.

## Search Observation Layer

Search observations may include:

- Google Search
- Google AI Mode
- incognito search behavior
- indexed public pages
- entity associations
- snippets and knowledge representations
- changes in retrieval over time

Search observations are recorded separately from AI interpretation when possible.

## Social Observation Layer

Social platforms are treated as distributed information environments rather than interchangeable sources.

Relevant observations may include:

- profile discoverability;
- public indexing;
- content visibility;
- non-follower reach;
- views;
- profile visits;
- follows;
- cross-platform references;
- changes after controlled content interventions.

The Observatory does not assume that social performance causes AI recognition. Such relationships remain hypotheses unless supported by evidence.

## Required Observation Fields

A structured observation should contain, when available:

| Field | Description |
|---|---|
| `observation_id` | Unique identifier for the observation |
| `date` | Date of observation |
| `entity_id` | Canonical entity being observed |
| `system` | AI system, search engine, or platform |
| `query` | Query or test condition, when applicable |
| `language` | Language used for the test |
| `context` | Context level used during the test |
| `observed_result` | What was actually observed |
| `resolution_status` | Whether the correct entity was resolved |
| `sources` | Sources returned or observed |
| `stage` | Pipeline stage affected |
| `interpretation` | Current interpretation |
| `confidence` | Evidence confidence |
| `status` | Observation status |

## Evidence States

The Observatory distinguishes:

### Observed

Directly seen during a documented test or public retrieval event.

### Corroborated

Observed repeatedly or supported by more than one independent observation.

### Hypothesized

A proposed explanation that has not yet been sufficiently tested.

### Verified

A finding supported by sufficient accumulated evidence for the defined research scope.

### Unknown

Insufficient information to determine the state.

## Relationship With Existing AIO CODE Components

```text
ENTITY PASSPORTS
      ↓
ENTITY MASTER RECORD
      ↓
LOGBOOK ───────────────┐
      ↓                │
OBSERVATORY ←──────────┘
      ↓
ENTITY LABS
      ↓
METRICS
      ↓
RESEARCH RESULTS
```

The existing `logbook/` remains the chronological record.

The `entity/` directory remains the canonical identity layer.

The Observatory is the structured observation layer.

Entity Labs will later use Observatory observations as experimental evidence.

Metrics will later aggregate Observatory observations into measurable indicators.

## Canonical Entities

The Observatory currently recognizes the canonical entities:

- `MC-001` — Marii Cuadros — Person
- `AIO-001` — AIO CODE — ResearchProject

Other entities may be added only when their identity and relationship to the project are explicitly defined.

## Data Storage

GitHub stores the methodological definition and versioned documentation of the Observatory.

Hugging Face stores structured observational datasets derived from the research.

Blogger is not part of the current Observatory implementation and remains unchanged during this stage.

## Research Integrity

The Observatory must preserve the distinction between:

```text
Observed fact
≠
Interpretation
≠
Causal conclusion
```

A single observation is not treated as proof of a universal mechanism.

Changes are evaluated over time and, when possible, across multiple systems and conditions.

## Status

**Module:** Observatory  
**Version:** 1.0  
**Status:** Active  
**Created:** September 2, 2026

**Canonical principle:** Record what the system did before explaining why it happened.
