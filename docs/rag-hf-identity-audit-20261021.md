# AIO CODE · RAG / Hugging Face and canonical identity audit (2026-10-21)

## Directly observed
- `entity-graph.json` has **six** approved canonical IDs (OZCU-001, MC-001, AIO-001, NUX-001, VOID-001, DAN-001). No identity ID was issued here.
- `colaboraciones/sergio-impulsa/index.html` and `colaboraciones/registry.json` are public editorial pages/registry, not registrar output.
- `rag/public-index-v0.json` is a **189-passage pinned index** from source commit `bcbd84fb6da6e148d9a6f9561a80ef64d5cf57f9`; Sergio's editorial sources are not in its current allowlist.
- `rag/corpus-manifest-v0.json` is v0.4.1, 2026-10-18. Adding sources without regenerating index fails automated `scripts/build_public_rag.py --check` (observed PR #76). **Do not bypass.**
- The canonical publication target `lib/public-identity-targets.mjs` currently includes only DAN-001.
- `lib/entity-service.mjs` generates private administrative `ENT-<UUID>`, not independently reserved public entity IDs; `lib/entity-domain.mjs` rejects manual changes of canonical bindings.
- Separate backend registrar work in draft PR #74 is not merged.

## Hugging Face inspection scope
- Datasets `mariicuadros/aio-code-entities` and `mariicuadros/aio-code-journal` both exist and show update date 2026-10-18 per connected Hub metadata.
- The available Hub connector exposes repository descriptions/README but did not expose complete dataset row tables or fingerprints. Attempts to fetch dataset tree via public web/runtime did not succeed. **Therefore row-level equality, entity ID completeness, record counts and dataset-to-Git-commit fidelity remain UNVERIFIED.**
- Do not overwrite either dataset or claim cross-platform synchronization until a verified export/revision can be compared.

## Canonical identity candidates (NOT IDs)
- `person-sergio-martin-contreras` — person; personal name/brand must not be collapsed into a legal company.
- `legal-sergio-impulsa-sl` — Spanish legal company supported by the supplied DUE, final registration certification and independent document validation pending.
- `venture-uge` — entrepreneurship project; no separate legal company registry status demonstrated.

The adjacent file `docs/canonical-registration-candidates-sergio-uge-20261021.json` contains proposals only; the values `candidate_key` are not canonical entity identifiers and must never be published as Schema.org `identifier` or canonical URLs.

## Execution sequence / blocking conditions
1. Perform read-only dataset **row exports** using authorized Hugging Face API/tool with each dataset's commit SHA, paths, schema and privacy classification; compare against six approved identities; produce a mismatch report.
2. Review and merge registrar protections after independent uniqueness, concurrency, history and ownership tests; issue IDs via that registrar, never from the webpage or a handmade code.
3. Create separate approved entity dossiers for person, legal company and UGE initiative, with an immutable evidence ledger and consent scope.
4. In a dedicated RAG branch add only approved public editorial sources, rebuild the 189-passage index from the exact repository commit with `scripts/build_public_rag.py`, then run `--check` and retrieval gold/negative regression tests.
5. Do not add the private full DUE, taxpayer's personal identifiers, bank details, addresses or tokens to RAG or Hugging Face.
6. Update GitHub/Vercel/HF only after approval and traceable publish operations; no invented entity IDs, no claims of external AI recognition.

## Current judgment
- **Public editorial discovery:** operational, previously deployed.
- **Canonical IDs for Sergio/company/UGE:** not allocated; awaiting secure registrar and immutable approvals.
- **RAG ingestion of Sergio:** not yet included; freshness tests enforce safety.
- **HF row-level parity:** unknown due to inspection limitation.
