# AIO CODE Brain v1

**Status:** v1 architecture specification  
**Primary public brand:** AIO CODE  
**Company/venture layer:** OZCU (reserve corporate identity)  
**Methodology:** AIO CODE  
**Creative system:** VOID MODE  
**Reference case:** MC-001 (Marii Cuadros)  
**Version date:** 2026-09-25

## Purpose

AIO CODE Brain is the operating layer that keeps entity identity, content provenance, semantic discovery, performance observations, commercial context, rights, and reusable procedures connected. It is a documented system of records and rules, not a claim that external AI systems are controlled or trained by AIO CODE.

## Canonical identity and namespaces

Public content signature: `AIO CODE — VOID MODE — MC`. Keep OZCU as the company/venture layer and reserve corporate identity through 2027; it is not the primary public/project brand.

Use the existing repository conventions: `/entity/` is canonical; `/entities/<slug>/` is operational. Do not create a competing entity namespace.

Canonical entity IDs:

- `OZCU-001` — company/brand.
- `AIO-001` — AIO CODE methodology, developed by Marii and applied by OZCU.
- `VOID-001` — VOID MODE creative system, developed by Marii and applied by OZCU.
- `MC-001` — Marii Cuadros, person and reference case.
- `NUX-001` and Twins remain narrative representations; never conflate them with real people.

Content identifier pattern: `AIO-VOID-MC-[master]-[platform]-[YYYYMMDD]-V##`. Every record must include a stable ID, parent entity, content type, hook, objective, language, rights/disclosure state, fingerprint, and `first_seen_at`. A platform-specific derivative points back to its master asset.

## Semantic layer

Each content record uses controlled values:

- Entity: `MC-001`, `AIO`, `VOID`.
- Type: `CANON`, `TRIAL`, `LIFE`, `EDIT`, `SPEC`.
- Distribution/commercial context: `ORGANIC`, `GIFT`, `PAID`, `AFF`, `OWN`.
- Readiness flags: `BRANDREADY`, `PAIDREADY`.

Relationships are explicit and directional. Records link question → concept → methodology → evidence; content → master asset → platform derivative; and entity → parent/creator/application relationship. Unknown or unverified relationships must be marked as such rather than inferred.

The Semantic/Search Map records intended audience questions, canonical concepts, answer-first definitions, linked evidence, aliases/disambiguation terms, and the relevant entity IDs. Search language variants must not create new entities by default.

## Provenance and performance

The Content Provenance Graph records the master asset, derivatives, edits, platform, publication time, content and intervention IDs, source evidence, and rights/disclosure references.

The Content Genome records reusable creative attributes (format, hook, narrative beat, visual/audio elements, CTA, and intended audience) as descriptive metadata. It does not infer causal drivers from performance.

The Performance Ledger stores platform, measurement window, reach/impressions, views, watch time, completion/retention when available, engagement actions, clicks, and capture source/time. Metrics remain platform-specific; do not collapse them into a cross-platform score without a validated method.

## Commerce, music, and brand layer

Record the commercial status of each asset or campaign as organic, gifted, paid, affiliate, or owned. Capture the brand/partner, deliverable, disclosure requirement, campaign/brief reference, usage term, territory, paid amplification permission, and approval state when applicable.

Music records link track/version, rights holder or source, license/permission evidence, territories, term, platform restrictions, and permitted commercial use. Missing rights evidence blocks a `PAIDREADY` designation. A readiness flag is an internal checklist state, not legal advice or a warranty.

## Rights and disclosure

Every asset must carry a rights status and evidence reference for image, likeness, voice, music, footage, and third-party marks where applicable. Record AI-generation or alteration disclosure when required by platform policy, campaign terms, or applicable law. Keep permission scope, duration, territory, channels, edits, paid use, and revocation/contact terms explicit. Unknown rights stay `unknown`; do not treat silence as consent.

## Resilience and change control

Maintain source records in version control, stable IDs, dated snapshots, checksums for master assets, and a change log. Exports to public hubs must be reproducible from canonical records. If a sync, source, or platform is unavailable, preserve the last verified snapshot and label freshness; never silently replace missing data or report a failed retrieval as a negative observation.

Every meaningful change receives an Intervention ID before execution; a batch of related publications receives a Changeset ID. Store raw observations separately from evaluation and interpretation.

## Templates and minimum records

v1 requires templates for:

1. Content Provenance Graph.
2. Semantic/Search Map.
3. Performance Ledger.
4. Content Genome.
5. Commerce/Music/Brand Layer.
6. Rights/Disclosure record.
7. Case record.

A record is usable only when it has a stable ID, entity link, date, provenance/source, status, and owner. Use `unknown`, `not_collected`, or `not_applicable` explicitly; do not leave ambiguous blanks in finalized records.

## Operating sequence

1. Resolve and validate the entity and its claims.
2. Create the master content record and rights/disclosure record.
3. Link semantic intent, evidence, and intended platform derivatives.
4. Publish only after required approvals and rights checks.
5. Record the publication as an intervention/change set.
6. Capture platform observations with exact conditions.
7. Store raw results first; evaluate and interpret separately.
8. Export verified records to the Observatory, Entity Home, and approved datasets.

## v1 limits

AIO CODE Brain v1 organizes and traces records. It does not guarantee reach, recommendation, search indexing, AI recognition, legal clearance, or causal performance gains. Scores and readiness labels remain internal until independently validated.
