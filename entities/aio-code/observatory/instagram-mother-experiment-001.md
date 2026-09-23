# AIO CODE — Instagram Mother Experiment 001

## Purpose

This experiment tests whether adding a new, explicitly attributable public representation of AIO CODE to Instagram changes the observable retrieval, recognition, resolution, or description of the AIO CODE entity across search and AI systems.

This is an observation protocol, not a claim of causality.

## Entity

- Entity: AIO CODE
- Entity ID: AIO-001
- Public Instagram: @aiocode_
- Public signature on the carousel content: **AIO CODE-2026**

The public carousel signature is intentionally minimal. No additional entity identifier is added to the visible signature for this experiment.

## Experimental structure

### T-9: Pre-publication registration

The carousel content is registered in the AIO CODE repository before its planned public publication.

This establishes a provenance record and a controlled pre-publication state.

### T0: Public publication

The owner publishes the carousel on Instagram on the date assigned to the content.

The publication date is recorded from the actual Instagram publication event. Repository registration date and Instagram publication date must not be conflated.

### T+1 to T+30: Observation window

Observe the same predefined queries and systems over a 30-day window.

Do not interpret a change as causal without considering other simultaneous changes to the web ecosystem, search index, content, or platform behavior.

## Primary hypothesis

A new public representation of AIO CODE, when connected to an existing structured entity/provenance system, may become observable in external retrieval and entity-resolution behavior after publication and subsequent crawling/indexing.

## What this experiment can test

- Whether Instagram becomes a retrievable source associated with AIO CODE.
- Whether the AIO CODE entity is described more consistently after publication.
- Whether @aiocode_ becomes associated with AIO CODE in external results.
- Whether content signed **AIO CODE-2026** becomes associated with AIO CODE.
- Whether entity-resolution behavior changes over time.
- Whether the effect differs across search and AI systems.

## What this experiment cannot prove by itself

- That a specific LLM directly reads Instagram and writes to a private knowledge graph.
- That Instagram caused a particular result.
- That an external system created a specific internal node.
- That publication guarantees indexing or AI visibility.
- That the methodology works universally from one case.

## Baseline

Current observable state before publication:

- AIO CODE is already appearing in incognito/search results.
- Instagram is now being observed as a result associated with AIO CODE.
- Other entities/sources may also appear in results.

Record screenshots, query text, date/time, result ordering, visible sources, and answer text before publication.

## Controlled variables

During the observation window, avoid unnecessary changes to:

- canonical entity name
- entity ID
- core JSON-LD
- canonical relationships
- public Instagram handle
- public carousel signature

Any unavoidable change must be logged as a confounding event.

## Observation fields

For each observation record:

- timestamp
- system/platform
- query
- entity recognition
- entity resolution
- description
- associated sources
- Instagram present/absent
- @aiocode_ present/absent
- AIO CODE-2026 present/absent
- result position when applicable
- competing/confusable entities
- notes
- evidence status: observed / corroborated / verified / hypothesized / unknown

## Interpretation rule

A result is **observed** when directly seen and recorded.

A relationship is **corroborated** only when independently supported by more than one observation/source.

A mechanism is **hypothesized** unless independently demonstrated.

Internal graph construction by an external AI/search provider remains **unknown** unless the provider exposes evidence of that internal process.

## Related records

- Instagram social record: `entities/aio-code/social/instagram.json`
- Instagram carousel registry: `entities/aio-code/content-registry/carousels/instagram-carousel-batch-001.json`
- Instagram evidence source: `entities/aio-code/evidence/sources/instagram-aiocode.json`
- Instagram provenance: `entities/aio-code/evidence/provenance/instagram-media-batch-001.json`
- Instagram media directory: `entities/aio-code/media/instagram/carousels/`
- Entity Labs / observatory records: `entities/aio-code/observatory/`

## Core research question

> Can a structured entity ecosystem plus a new public social representation produce an observable change in how an external search or AI system retrieves, identifies, resolves, or describes that entity?

This question is deliberately narrower than claiming that AIO CODE controls or directly modifies external knowledge graphs.
