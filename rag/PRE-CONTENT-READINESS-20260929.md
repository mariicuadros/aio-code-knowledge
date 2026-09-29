# RAG receiving structure — ready before content, September 29, 2026

The pre-content scope is a controlled public source lookup with exact provenance, current entity boundaries and an opt-in private draft route. This cut does not claim answer accuracy, automatic content ingestion, Meta access, embeddings or commercial results. Existing phase-1 observations are outcomes; the new content phase measures additional outcomes in October.

## Receiving a real content asset

1. Preserve the original and its fingerprint privately; record content ID, entity subjects, human contribution, master/derivatives, rights, disclosure, intended platform and source reference using the seven Brain contracts. Use explicit unknown/missing states rather than invented values.
2. Validate the linked records with `python scripts/validate_brain.py /private/path/records.json`. Schema validity is record completeness, not permission clearance or approval to publish.
3. Publish only the reviewed public content summary/transcript and permitted provenance, with actual publication timestamps/URLs. Record an intervention linking the content ID, source revision, changes and the measurement window. Keep private rights agreements and performance observations in the private Ledger.
4. Add the exact reviewed public file path to `rag/corpus-manifest-v0.json` deliberately. Never add a directory glob, a live arbitrary URL, a private screenshot, token, export or Insights record. Declare public visibility, role and canonical/historical status. A source may enter the corpus only after public-release review.
5. Commit the source and manifest before rebuilding: `python scripts/build_public_rag.py`. Commit the regenerated index, which pins committed source versions and blob hashes. Run core, Brain, site, index freshness, unit, RAG and gateway checks. Keep all original historical evaluation/observation records.
6. For newly added knowledge, extend a separate content answer-acceptance set with expected claims, source passages and abstention boundaries; do not change frozen external prompts or substitute source-hit scores for answer support. In phase 2, review generated claims against passages before publishing answers.

## Pre-content acceptance

- `python scripts/validate_core.py`
- `python scripts/validate_brain.py brain/contracts/examples.synthetic.json`
- `python -m unittest discover -s tests -v`
- `python scripts/validate_site.py`
- `python scripts/build_public_rag.py --check`
- `python -m rag.evaluate` — 24 cases, 21 applicable source checks
- `npm run check:gateway` — source retrieval and access guards, no model calls

The browser and private draft endpoint share lexical ranking. Original questions and screenshots are preserved verbatim in the Observatory even though internal name tokenization ignores case. The private model route remains explicitly gated; credentials are managed in the host's secret settings and are never committed. A live model trial and per-claim review are separate phase-2 activities.

## October measurement

For each content publication retain the pre-publication window (including the owner's nine preceding days when dates/evidence are supplied), original/derivative IDs, actual platform timestamps, public source revision and intervention ID. Keep platform-specific metrics with definition, retrieval time, interval, source and missingness; record performance separately from external entity recognition. Vercel pageviews measure website traffic; Meta Insights measure Instagram/Facebook performance through authorized APIs. Neither is automatically evidence of causality.
