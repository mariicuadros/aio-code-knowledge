# AIO CODE Repository Structure Contract v1

## Authority layers

- `/entity/` — canonical entity passports and cross-entity identity definitions.
- `/entities/<slug>/` — operational per-entity workspaces; may reference but never silently redefine canonical identity.
- `/schemas/` and entity `technical/` folders — machine-readable contracts and JSON-LD.
- `/observatory/`, `/entity-labs/`, `/metrics/` — research observations, experiments and measurements; dated evidence is not rewritten to match current definitions.
- `/phase-2/` — current operational integration contracts and roadmap. Provider-specific mechanism statements must retain evidence state and must not override canonical identity.
- `/evidence/` — public evidence only. Private originals use explicit vault/restricted references and must not be copied into the public repository.
- `/rag/` — controlled public retrieval corpus/index; only allowlisted canonical/current or explicitly historical sources.
- `/brain/` — operational record contracts and controlled vocabulary.
- `/blogger/` — versioned Blogger themes/review notes; a repository theme is not proof of live installation.
- `/data-export/` — controlled downstream export manifests; publication remains separately gated.
- `/governance/` — audits, release gates and change records.
- `/security/` — public security architecture only; never secrets.

## Discovery/retrieval placement

The observable path between publication and an AI/search answer is defined in `phase-2/AI-DISCOVERY-RETRIEVAL-LAYER-v1.md`.

- Provider crawler policy belongs in `phase-2/crawler-policy-v1.json`.
- Crawler observations conform to `schemas/crawler-ledger.schema.json`.
- External AI/search observations conform to `schemas/ai-observation-record.schema.json`.
- A provider mechanism may be marked `provider_documented` only when current first-party provider documentation supports it.
- AI self-reports or third-party explanations remain `ai_reported_unverified`, `third_party_documented` or `hypothesis` until promoted by qualifying evidence.
- Discovery tests and direct-URL retrieval tests are never collapsed into one metric.

## Media placement

A media file belongs beneath the canonical entity workspace and source platform, e.g. `entities/aio-code/media/instagram/` or `entities/marii-cuadros/media/facebook/`. Media in an archive proves repository custody only. Platform publication metadata requires a source record.

Populated directories must not retain `.gitkeep`. Empty reserved directories may use it.

## Identity placement

Canonical name/type changes begin in the entity passport/master/graph and must remain aligned across JSON-LD, public Entity Home, schemas, sameAs inventories, social registry and RAG answer policy. Confusable people never become aliases.

## Vocabulary placement

Controlled operational terms live in `brain/contracts/vocabulary-v1.json`. Matching enum contracts in `brain-record-v1.schema.json` must contain the same allowed values. Platform labels may preserve source-native strings only where explicitly documented.

## Automated enforcement

`scripts/audit_repository_integrity.py` is a required CI gate and validates JSON/JSONL syntax, path references, media headers/dimensions/manifests, canonical entity/social mappings, sameAs, vocabulary enums and active-folder conventions. Phase-2 discovery/retrieval tests additionally enforce separation between provider-documented behavior and unverified AI mechanism claims.
