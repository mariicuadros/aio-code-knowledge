# AIO CODE Brain v1

**Status:** FROZEN v1 architecture specification  
**Primary public brand:** AIO CODE  
**Company/venture layer:** OZCU (reserve corporate identity)  
**Methodology / operating system:** AIO CODE  
**Creative system:** VOID MODE  
**Reference case:** MC-001 (Marii Cuadros)  
**Version date:** 2026-09-25

## Purpose

AIO CODE Brain is the operating layer that keeps entity identity, content provenance, semantic discovery, performance observations, commercial context, rights, human authorship and reusable procedures connected. It is a documented system of records and rules, not a claim that external AI systems are controlled or trained by AIO CODE.

## Canonical identity and namespaces

Public content signature: `AIO CODE — VOID MODE — MC`. Keep OZCU as the company/venture layer and reserve corporate identity through 2027; it is not the primary public/project brand.

Use the existing repository conventions: `/entity/` is canonical; `/entities/<slug>/` is operational. Do not create a competing entity namespace.

Canonical entity IDs:

- `OZCU-001` — company/venture layer; reserve corporate identity.
- `AIO-001` — AIO CODE system/methodology, developed by Marii.
- `VOID-001` — VOID MODE creative system, developed by Marii.
- `MC-001` — Marii Cuadros, real person, creator and reference case.
- `NUX-001` — male androgynous narrative alter-ego representing Marii's present/internal conflict; not a separate real person.
- `TWINS` — narrative representation of Marii's projected future self; not a separate canonical real-world person entity.
- `Maria` — the real-world/past-facing creator perspective used inside the narrative; it resolves to MC-001 rather than a new person entity.

Content identifier pattern: `AIO-VOID-MC-[master]-[platform]-[YYYYMMDD]-V##`. Every record must include a stable ID, parent entity, content type, hook, objective, language, rights/disclosure state, fingerprint, and `first_seen_at`. A platform-specific derivative points back to its master asset.

## Semantic and narrative layer

Each content record uses controlled values.

### Content types

`CANON`, `TRAILER`, `LIFE`, `CUT`, `EDITORIAL`, `STORY`, `DOC`, `SHORT`, `TRIAL`, `SPEC`.

`SPEC` may describe a speculative brand-facing creative asset, but commercial relationship is recorded separately and must never imply sponsorship or authorization.

### Narrative subjects

`MARIA`, `MARII`, `NUX`, `TWINS`, `FRANK`, `AGGIN`, `ALIENS`, `ENSEMBLE`.

Narrative subjects are story roles. They do not automatically become canonical person entities.

### Lens

`REAL`, `VOID`, `HYBRID`.

The lens distinguishes direct real-world creator perspective from symbolic/cinematic VOID MODE representation and mixed forms.

### Narrative function

`SEED`, `TEASE`, `BRIDGE`, `EXPAND`, `REVEAL`, `CALLBACK`, `PAYOFF`, `STANDALONE`.

This allows non-linear discovery while preserving a coherent internal story graph.

### Distribution / commercial relationship

`NONE`, `ORGANIC`, `SPEC`, `GIFT`, `PAID`, `AFF`, `OWN`.

`features_brand` is not equivalent to `sponsored_by`; `uses_product` is not equivalent to `endorses_product`; `SPEC` is not equivalent to commissioned work.

### Readiness flags

`ORGANIC_ONLY`, `BRANDREADY`, `PAIDREADY`, `REVIEW`, `RESTRICTED`.

Relationships are explicit and directional. Records link question → concept → methodology → evidence; content → master asset → platform derivative; and entity → parent/creator/application relationship. Unknown or unverified relationships must be marked as such rather than inferred.

The Semantic/Search Map records intended audience questions, canonical concepts, answer-first definitions, linked evidence, aliases/disambiguation terms, and relevant entity IDs. Search language variants must not create new entities by default.

## Platform role architecture

- **TikTok:** discovery, search, personality, micro-scenes and sound-led hooks.
- **Instagram:** canonical multiverse narrative, creator/cinematic contrast, loops, editorial identity and primary brand-facing proof.
- **Facebook:** human perspective, Frank voice, selected multiverse distribution and community interaction.
- **Pinterest:** editorial archive / magazine-style visual world-building.
- **YouTube / Bilibili:** depth, documentary, process, creation and educational context.
- **Spotify / music surfaces:** music identity, curation, original tracks and cross-asset sound relationships.

Platform roles guide creative intent; they do not guarantee distribution or performance.

## Provenance and performance

The Content Provenance Graph records the master asset, derivatives, edits, platform, publication time, content and intervention IDs, source evidence, and rights/disclosure references.

The Content Genome records reusable creative attributes including content type, subject, lens, hook family, narrative function, narrative beats, visual/audio elements, pause type, CTA, intended audience, music relation, brand presence and semantic/search intent. It describes the asset; it does not infer causal drivers from performance.

The Performance Ledger stores platform, measurement window, reach/impressions, views, watch time, completion/retention when available, engagement actions, profile/search actions, clicks, commercial signals and capture source/time. Metrics remain platform-specific; do not collapse them into a cross-platform score without a validated method.

Recommended observation windows may include `1h`, `6h`, `24h`, `72h`, `7d`, and `30d` when the platform and experiment make them useful. Missing windows are recorded as `not_collected`, not zero.

## Commerce, music, and brand layer

Record the actual commercial relationship of each asset or campaign as none, organic, spec, gifted, paid, affiliate, or owned. Capture the brand/partner, vertical, placement role, deliverable, disclosure requirement, campaign/brief reference, usage term, territory, paid amplification permission, approval state and commercial signal when applicable.

Music records link track/version, rights holder or source, license/permission evidence, territories, term, platform restrictions, permitted commercial use and relationship to playlist or original music assets. Missing rights evidence blocks a `PAIDREADY` designation. A readiness flag is an internal checklist state, not legal advice or a warranty.

## Rights, disclosure and human authorship

Every asset must carry a rights status and evidence reference for image, likeness, voice, music, footage, third-party marks and AI-generated/altered components where applicable. Record disclosure when required by platform policy, campaign terms or applicable law. Keep permission scope, duration, territory, channels, edits, paid use and revocation/contact terms explicit. Unknown rights stay `unknown`; do not treat silence as consent.

Human authorship must be documented separately from AI assistance when material. Relevant contributions may include concept, writing, performance, direction, selection, arrangement, editing, compositing, music creation/selection and final creative decisions. AI tool output alone must not be silently represented as human authorship.

## Creative constitution

MC-001 / VOID MODE follows these v1 creative rules:

1. **No niche lock.** Marii is an artist/entity, not a single content category.
2. **Artist-first.** Technology supports the creative world; it does not replace the artistic identity.
3. **No saturation.** Volume must not erase meaning, identity or visual coherence.
4. **No deletion by performance alone.** Poor performance remains evidence; removal requires a legal, safety, rights, privacy, platform or deliberate archival reason.
5. **No fake commercial relationship.** Brand presence must not imply sponsorship, authorization or endorsement that does not exist.
6. **Human perspective remains visible.** Psychological, spiritual, astrological and symbolic themes are narrative lenses, not substitutes for factual or clinical claims.
7. **Narrative complexity, surface clarity.** Each asset should work for a first-time viewer while offering deeper continuity to returning viewers.
8. **External people are not growth props.** Collaborations involving real third parties require deliberate approval and appropriate rights/commercial context.

See `MC-CREATIVE-CONSTITUTION-v1.md`.

## Resilience and change control

Maintain source records in version control, stable IDs, dated snapshots, checksums for master assets, and a change log. Exports to public hubs must be reproducible from canonical records. If a sync, source, or platform is unavailable, preserve the last verified snapshot and label freshness; never silently replace missing data or report a failed retrieval as a negative observation.

Private recovery, contracts, sensitive brand records, private rights evidence, incident records and protected know-how belong in `mariicuadros/aio-code-vault`. Passwords, API keys, authentication tokens, private keys, 2FA/recovery codes and similar secrets belong outside Git entirely.

Every meaningful change receives an Intervention ID before execution; a batch of related publications receives a Changeset ID. Store raw observations separately from evaluation and interpretation.

## Templates and minimum records

v1 requires templates for:

1. Content Provenance Graph.
2. Semantic/Search Map.
3. Performance Ledger.
4. Content Genome.
5. Commerce/Music/Brand Layer.
6. Rights/Disclosure + Human Authorship record.
7. Case record.

A record is usable only when it has a stable ID, entity link, date, provenance/source, status and owner. Use `unknown`, `not_collected`, or `not_applicable` explicitly; do not leave ambiguous blanks in finalized records.

## Operating sequence

1. Resolve and validate the entity and its claims.
2. Create the master content record and rights/authorship/disclosure record.
3. Link semantic intent, narrative metadata, evidence and intended platform derivatives.
4. Publish only after required approvals and rights checks.
5. Record the publication as an intervention/change set.
6. Capture platform observations with exact conditions.
7. Store raw results first; evaluate and interpret separately.
8. Assign a decision state such as `SCALE`, `ITERATE`, `REPACKAGE`, `RETEST`, or `ARCHIVE` based on documented evidence rather than intuition alone.
9. Export verified records to the Observatory, Entity Home and approved datasets.

## Brain Freeze rule

Brain v1 is frozen for content production as of 2026-09-25. New ideas do not block publishing unless they expose a material risk in legal/compliance, rights/IP, security/recovery, entity identity, provenance or measurement integrity. Non-critical improvements enter a later version such as v1.1.

## v1 limits

AIO CODE Brain v1 organizes and traces records. It does not guarantee reach, recommendation, search indexing, AI recognition, legal clearance, causal performance gains, commercial success or monetization. Scores and readiness labels remain internal until independently validated.
