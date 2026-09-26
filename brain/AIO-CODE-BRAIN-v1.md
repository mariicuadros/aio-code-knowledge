# AIO CODE Brain v1

**Status:** FROZEN v1 architecture specification  
**Primary public brand:** AIO CODE  
**Company/venture layer:** OZCU (reserve corporate identity)  
**Methodology / operating system:** AIO CODE  
**Creative system:** VOID MODE  
**Reference case:** MC-001 (Marii Cuadros)  
**Version date:** 2026-09-26

## Purpose

AIO CODE Brain is the operating layer that keeps entity identity, content provenance, semantic discovery, performance observations, commercial context, rights, human authorship and reusable procedures connected. It is a documented system of records and rules, not a claim that external AI systems are controlled or trained by AIO CODE.

## Canonical identity and namespaces

Public content signature: `AIO CODE — VOID MODE — MC`. Keep OZCU as the company/venture layer and reserve corporate identity through 2027; it is not the primary public/project brand.

Use the existing repository conventions: `/entity/` is canonical; `/entities/<slug>/` is operational. Do not create a competing entity namespace.

Canonical entity IDs and identity relationships:

- `OZCU-001` — company/venture layer; reserve corporate identity.
- `AIO-001` — AIO CODE system/methodology, created and directed by the human creator behind MC-001.
- `VOID-001` — VOID MODE creative system, created and directed by the human creator behind MC-001.
- `MC-001` — Marii Cuadros, the public/artistic identity of the human creator María Alejandra Cuadros Lozada. `Marii Cuadros` and the human creator are the same underlying person, not two separate real-person entities.
- `NUX-001` — male androgynous narrative alter-ego/entity representing Marii's present/internal conflict inside VOID MODE; not a separate real person.
- `TWINS` — digital/narrative representation of Marii Cuadros inside VOID MODE and representation of her projected future self; not a separate canonical real-world person entity.
- `Maria` — real-world creator/past-facing narrative perspective. It refers to the human creator María Alejandra Cuadros Lozada and resolves to `MC-001`; it must not create a duplicate person entity.

Human-origin relationship for the reference case:

`María Alejandra Cuadros Lozada (human creator) → Marii Cuadros / MC-001 (public-artistic identity) → TWINS (digital/narrative representation inside VOID MODE)`.

Identity-document numbers, private verification records and other sensitive legal-identity evidence are never required in the public repository. If verification evidence is needed, store only a non-sensitive reference publicly and keep the supporting material in the approved private layer.

Content identifier pattern: `AIO-VOID-MC-[master]-[platform]-[YYYYMMDD]-V##`. Every record must include a stable ID, parent entity, content type, hook, objective, language, rights/disclosure state, fingerprint, and `first_seen_at`. A platform-specific derivative points back to its master asset.

## Entity ecosystem model

AIO CODE models expandable digital ecosystems, not isolated professions or single-channel profiles.

A new role, activity, vertical, project or content category does not automatically create a new canonical entity. Prefer explicit relationships such as:

`entity + role`  
`entity + project`  
`entity + brand`  
`entity + creative_system`  
`entity + representation`

Create a new canonical entity only when there is a semantic, operational, legal or governance reason to manage it independently.

AIO CODE must support both:

- `one person → many roles, projects, brands, representations and assets`; and
- `one organization → many brands, people, spokespersons, products, representations, campaigns and assets`.

The architecture is not limited to influencers or individual creators. It must remain applicable to artists, musicians, creators, models, photographers, filmmakers, editors, producers and managers, as well as labels, agencies, management companies, studios, production companies, brands and other organizations.

MC-001 is the reference laboratory, not the product boundary. Any new schema or core workflow should be tested with the question: `Can the same model be instantiated for another artist, label, agency, brand or company without rebuilding the core architecture?`

## Human identity, representation and responsibility

AIO CODE separates four concepts that must not be conflated:

1. **Human or organizational origin** — the responsible real-world person or legal/operational organization.
2. **Public/professional identity** — the name or identity used publicly.
3. **Digital/narrative representation** — a character, avatar, alter-ego, synthetic representation or other representational layer.
4. **Content asset** — a specific master or derivative in which one or more identities/representations appear.

Every material representation should be able to resolve to a responsible origin through explicit provenance. Where image, likeness or voice is involved, record the relevant ownership/authorization/consent state rather than assuming permission.

For self-representation, the system may record a state such as `SELF_AUTHORIZED`, but must not expose sensitive proof publicly. For third-party representation, unknown or missing authorization remains `unknown` or `pending` until evidence exists.

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

Platform-native formats and platform recommendations are baselines and constraints, not universal creative rules. Aspect ratio, duration, language, editing pattern and presentation format may be registered as Content Genome variables and deliberately tested as interventions. AIO CODE must distinguish `platform requirement`, `platform recommendation`, `creative choice` and `experimental intervention`.

## Provenance and performance

The Content Provenance Graph records the human/organizational origin where relevant, public identity, representation, master asset, derivatives, edits, platform, publication time, content and intervention IDs, source evidence, and rights/disclosure references.

The Content Genome records reusable creative attributes including content type, subject, lens, hook family, narrative function, narrative beats, visual/audio elements, aspect ratio/format where relevant, pause type, CTA, intended audience, music relation, brand presence and semantic/search intent. It describes the asset; it does not infer causal drivers from performance.

The Performance Ledger stores platform, measurement window, reach/impressions, views, watch time, completion/retention when available, engagement actions, profile/search actions, clicks, commercial signals and capture source/time. Metrics remain platform-specific; do not collapse them into a cross-platform score without a validated method.

Recommended observation windows may include `1h`, `6h`, `24h`, `72h`, `7d`, and `30d` when the platform and experiment make them useful. Missing windows are recorded as `not_collected`, not zero.

Content performance and entity effect are related but distinct. A high-performing asset does not automatically prove improved entity resolution, recognition, search retrieval or representation. Performance Ledger observations and Observatory/Entity Lift observations must remain separately recorded and only be connected through explicit evidence and intervention IDs.

## Creative work and methodological experiment

A creative system or campaign may be both an artistic work and a methodological experiment. These roles must remain distinguishable.

For the reference case, VOID MODE is simultaneously:

- a creative/narrative work of Marii Cuadros; and
- a structured AIO CODE test environment for content, representation, provenance, platform adaptation, performance observation and entity effects.

Creative decisions are not automatically research findings. Research findings require documented observations, conditions, comparison logic and evidence.

The VOID MODE reference implementation may inform future repeatable templates for artists, album/music launches, labels, managers, agencies, brands or companies, but replicability must be demonstrated rather than assumed.

## Commerce, music, and brand layer

Record the actual commercial relationship of each asset or campaign as none, organic, spec, gifted, paid, affiliate, or owned. Capture the brand/partner, vertical, placement role, deliverable, disclosure requirement, campaign/brief reference, usage term, territory, paid amplification permission, approval state and commercial signal when applicable.

Music records link track/version, rights holder or source, license/permission evidence, territories, term, platform restrictions, permitted commercial use and relationship to playlist or original music assets. Missing rights evidence blocks a `PAIDREADY` designation. A readiness flag is an internal checklist state, not legal advice or a warranty.

For AI-assisted or AI-generated music/content, provenance should distinguish human concept/direction/performance/editing from model/tool generation and preserve evidence for relevant rights, licenses and commercial-use conditions.

## Rights, disclosure and human authorship

Every asset must carry a rights status and evidence reference for image, likeness, voice, music, footage, third-party marks and AI-generated/altered components where applicable. Record disclosure when required by platform policy, campaign terms or applicable law. Keep permission scope, duration, territory, channels, edits, paid use and revocation/contact terms explicit. Unknown rights stay `unknown`; do not treat silence as consent.

Human authorship must be documented separately from AI assistance when material. Relevant contributions may include concept, writing, performance, direction, selection, arrangement, editing, compositing, music creation/selection and final creative decisions. AI tool output alone must not be silently represented as human authorship.

## Compliance-readiness and internationalization

AIO CODE is designed for compliance-readiness, not as a blanket legal-clearance system or a guarantee of worldwide compliance.

The core record should be capable of carrying or resolving, where relevant:

- responsible human or organization;
- public/professional identity;
- digital/narrative representation and `representation_of` relationship;
- likeness/voice authorization or consent state;
- AI assistance/generation level;
- rights status and evidence reference;
- commercial relationship;
- AI disclosure status;
- commercial disclosure status;
- platform;
- territory/jurisdiction profile;
- master/derivative linkage;
- fingerprint/hash and timestamps.

Jurisdiction and platform policy are overlay layers. Do not redesign the underlying entity when a campaign enters a new country or platform. Instead, perform a campaign/publication preflight against the relevant territory, platform, contract, rights, disclosure and commercial-use requirements.

AIO CODE may use internal readiness states to distinguish incomplete records from assets prepared for a specific campaign or publication, but those states are operational controls, not legal opinions or warranties.

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
9. **Ecosystem expansion without identity fragmentation.** New roles, projects, brands or creative verticals should extend the entity graph rather than create duplicate identities by default.
10. **Replicability without hardcoding MC-001.** The reference case may be complex, but core schemas and workflows must remain reusable for other people and organizations.

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

1. Resolve and validate the responsible human/organization, public identity and any representations relevant to the case.
2. Resolve and validate the entity and its claims.
3. Create the master content record and rights/authorship/disclosure record.
4. Link semantic intent, narrative metadata, evidence and intended platform derivatives.
5. Perform platform/campaign/jurisdiction preflight when required.
6. Publish only after required approvals and rights checks.
7. Record the publication as an intervention/change set.
8. Capture platform observations with exact conditions.
9. Store raw results first; evaluate and interpret separately.
10. Assign a decision state such as `SCALE`, `ITERATE`, `REPACKAGE`, `RETEST`, or `ARCHIVE` based on documented evidence rather than intuition alone.
11. Export verified records to the Observatory, Entity Home and approved datasets.

## Brain Freeze rule

Brain v1 is frozen for content production as of 2026-09-25. New ideas do not block publishing unless they expose a material risk in legal/compliance, rights/IP, security/recovery, entity identity, provenance or measurement integrity. Non-critical improvements enter a later version such as v1.1.

The 2026-09-26 clarification of human origin, public identity, digital representation, ecosystem scope and compliance-readiness is treated as a permitted v1 material-risk clarification under the existing freeze rule; it does not create a competing architecture or a new canonical person entity.

## v1 limits

AIO CODE Brain v1 organizes and traces records. It does not guarantee reach, recommendation, search indexing, AI recognition, legal clearance, causal performance gains, commercial success or monetization. Scores and readiness labels remain internal until independently validated.
