# RAG ingestion proposal — Sergio Impulsa collaborator

Status: **proposal only — not yet indexed**, 2026-10-21.

## Source boundaries
- Public editorial page: `colaboraciones/sergio-impulsa/index.html`.
- Public editorial registry: `colaboraciones/registry.json`.
- Sergio's photograph is an externally hosted public image, not a rights transfer.
- The original DUE remains private and MUST NOT be ingested into the public corpus.

## Claims allowed
- Publicly approved collaborator relationship with AIO CODE; editorial link to original Blogger post.
- Sergio Martín Contreras as entrepreneur; Sergio Impulsa, S. L. as Spanish limited company, with company data grounded in supplied official DUE.
- The DUE records an October 2026 Mercantile Registry presentation entry; NOT independently proven final registration; do not say final registry certification is held.
- UGE as related entrepreneurship project, not a verified independent registered company.

## Exclusions
- No canonical DEOS entity IDs or `sameAs` assigned to Sergio, Sergio Impulsa S.L. or UGE.
- No full DUE, identity documents, bank details, private contact information or personal identifiers in public index.
- Never convert listed CNAE business activities into proven current commercial delivery of every listed service.

## Execution gate
1. Review source allowlist, claim/evidence state and consent scope.
2. Extend `rag/corpus-manifest-v0.json` under a dedicated PR.
3. Rebuild with `python scripts/build_public_rag.py` and pin source commit.
4. Run check mode + gold retrieval/evidence-evaluation suite, including negative tests for UGE legal status, identity disambiguation and private data.
5. Publish only after independent review. Do not hand-edit `rag/public-index-v0.json` or bypass its freshness gate.

Hugging Face datasets should be synchronized only after full row/schema inspection; dataset metadata alone does not establish row-level parity.
