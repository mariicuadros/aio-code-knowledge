# Brain v1 executable contracts

Version `1.0.0` implements the frozen architecture; it does not reopen naming,
entity hierarchy, research claims or the historical baseline.

`brain-record-v1.schema.json` is one offline JSON Schema Draft 2020-12 bundle
with seven named record definitions. `vocabulary-v1.json` gives the controlled
codes, meanings, platform aliases and reference-case profile. Validation checks
that dictionary values and schema enums match. All schema references are local.

| Record type | Stable ID | Purpose |
| --- | --- | --- |
| content_provenance | content_id | Origin, master, derivatives and publication |
| semantic_search | map_id | Question, concept, claims and evidence references |
| performance_observation | observation_id | Platform-specific observations and missingness |
| content_genome | genome_id | Descriptive creative attributes |
| commerce_music_brand | commerce_record_id | Commercial context, music and operational readiness |
| rights_disclosure_authorship | rights_record_id | Permissions, disclosure and human contribution |
| case | case_id | Study scope, observations, findings and limitations |

All records need `owner`, `source_ref`, UTC `recorded_at` and `visibility`.
Set `schema_version: 1.0.0` in new records. Unversioned records from the first
manual Ledger are accepted only if they already satisfy the contract. Existing
canonical graph, commerce register and semantic search registry schemas remain
separate; no historical record is silently migrated.

## Validate

```sh
python -m pip install 'jsonschema>=4.23,<5'
python scripts/validate_brain.py brain/contracts/examples.synthetic.json
python scripts/validate_brain.py /path/to/record.json --schema-only
python -m unittest discover -s tests -v
```

Default mode accepts a record or array and resolves internal record links.
`--schema-only` checks shape and values, without claiming that references exist.
The seven examples describe a fictional TEST organization. They are fixtures,
not real assets, permissions, platform measurements or research findings.

The JSON schema handles types, mandatory fields, controlled values, UTC formats
and unexpected properties. The validator adds graph cycles, matching content,
platforms, time ordering, numeric finiteness and documented readiness checks.
An `extensions` object is allowed for namespaced noncanonical metadata; it is
not interpreted as evidence, rights clearance or an operational decision.

## Mapping from the original narrative templates

| Narrative template | Executable contract |
| --- | --- |
| `fingerprint: {algorithm: sha256, value: ...}` | `fingerprint_sha256`: 64 lowercase hexadecimal digits or null |
| `first_seen_at: not_collected` | Explicit null; a real timestamp must be UTC |
| Bare metric number/null | `{value, state, unit, definition, source_ref}`; absent data is null with a non-observed state |
| Retention array inside metrics | Top-level `retention_points`, each with position_seconds and a metric object |
| `loop_design: "true" / "false"` | JSON boolean true/false, or `not_applicable` |
| Commerce `status` | Commercial relationship; lifecycle status belongs to the content record |
| Free-form permission words | `allowed`, `denied`, `unknown`, `not_applicable` |
| Disclosure-required wording | `yes`, `no`, `unknown`, `not_applicable`; separate disclosure status |
| Empty review date | Omit until review; a review requires a real UTC date and reviewer |
| MC-001 narrative subjects | Reference profile only; other cases may define other subjects without creating person entities |

Do not apply these mappings silently to historical records. Preserve the source,
record a deliberate conversion and validate the result. A draft can carry unknown
rights; archiving an existing publication is distinct from approving future use.
The first two Ledger record shapes remain compatible. Later schema versions must
include explicit migration notes and compatibility tests.

## Commercial and evidence boundaries

`GIFT`, `PAID`, `AFF`, `OWN`, `SPEC`, `ORGANIC` and `NONE` describe the recorded
relationship. `distribution_mode` separately records organic/paid distribution.
Neither field determines a legal advertising classification. Applicable laws,
platform rules and contract terms belong to reviewed jurisdiction/publication
overlays; this contract does not encode unverified current legal requirements.

Readiness requires linked reviewed rights, component states, permission evidence,
permission scope/channels, disclosure status and documented approval. PAIDREADY
also requires explicit paid-use and paid-amplification permission. These are
record-completeness checks: the tool does not open evidence URLs, validate a
license, establish that statements are true, or authorize a publication.

Claims, evidence and external reference IDs are retained but are not promoted to
verified by schema validation. Performance remains separate from entity effects.
Private observations, permissions and commercial records stay in the private
Ledger; the public repository contains contracts and synthetic fixtures only.
