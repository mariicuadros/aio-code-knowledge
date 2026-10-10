# AIO CODE Repository Structure Contract v1

## Authority layers

- `/entity/` — canonical entity passports and cross-entity identity definitions.
- `/entities/<slug>/` — operational per-entity workspaces; may reference but never silently redefine canonical identity.
- `/schemas/` and entity `technical/` folders — machine-readable contracts and JSON-LD.
- `/observatory/`, `/entity-labs/`, `/metrics/` — research observations, experiments and measurements; dated evidence is not rewritten to match current definitions.
- `/evidence/` — public evidence only. Private originals use explicit vault/restricted references and must not be copied into the public repository.
- `/rag/` — controlled public retrieval corpus/index; only allowlisted canonical/current or explicitly historical sources.
- `/brain/` — operational record contracts and controlled vocabulary.
- `/blogger/` — versioned Blogger themes/review notes; a repository theme is not proof of live installation.
- `/data-export/` — controlled downstream export manifests; publication remains separately gated.
- `/governance/` — audits, release gates and change records.
- `/security/` — public security architecture only; never secrets.

## Media placement

A media file belongs beneath the canonical entity workspace and source platform, e.g. `entities/aio-code/media/instagram/` or `entities/marii-cuadros/media/facebook/`. Media in an archive proves repository custody only. Platform publication metadata requires a source record.

Populated directories must not retain `.gitkeep`. Empty reserved directories may use it.

## Identity placement

Canonical name/type changes begin in the entity passport/master/graph and must remain aligned across JSON-LD, public Entity Home, schemas, sameAs inventories, social registry and RAG answer policy. Confusable people never become aliases.

## Vocabulary placement

Controlled operational terms live in `brain/contracts/vocabulary-v1.json`. Matching enum contracts in `brain-record-v1.schema.json` must contain the same allowed values. Platform labels may preserve source-native strings only where explicitly documented.

## Automated enforcement

`scripts/audit_repository_integrity.py` is a required CI gate and validates JSON/JSONL syntax, path references, media headers/dimensions/manifests, canonical entity/social mappings, sameAs, vocabulary enums and active-folder conventions.
