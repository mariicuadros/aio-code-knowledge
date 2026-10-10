# PR #15 — controlled release candidate audit

**GitHub head inspected:** `18786888bd8998462f66ea1a9d660c44e8eb5106`; `main` base `11911957466e0c4ec26b80d37d014b856f30bd2f`. PR is open, draft, mergeable as reported by GitHub; automated workflow https://github.com/mariicuadros/aio-code-knowledge/actions/runs/38088107012 succeeded for that SHA. This document itself is a later source change, so require fresh passing CI on the final head.

**Vercel preview:** `dpl_XREjedKn13P36XSLPT71v9jSgh8H`, READY, target null (preview), exact PR SHA above. A READY build is *not* direct independent verification of the deployed route HTTP status, rendering or headers. SSO protection for preview can restrict access. Automatic Git deployments remain disabled by repository design. Production intentionally unchanged.

**Live Blogger:** still serves prior definitions on 2026-10-10. Proposed October theme is repository-only; installation needs separate owner consent and a live theme backup.

**Hugging Face datasets:** `mariicuadros/aio-code-entities` and `mariicuadros/aio-code-journal` both showed last update October 6 when checked October 10. Do not infer exact schema/row version from metadata alone. GitHub workflow `.github/workflows/sync-huggingface.yml` is manually gated to an approved `main` SHA. No sync was initiated.

**Canonical contract:** Five nodes MC-001 (Person), AIO-001 (DigitalEntityOperatingSystem), OZCU-001 (Company as declared venture, not proof of incorporation), VOID-001 (CreativeSystem), NUX-001 (DigitalCreativeEntity). `TWIN-MC-001` is a representation, not sixth canonical node. `Marii Cuadros` is MC-001 public name; `Maria Alejandra Cuadros Lozada` is its alternate full name. Preserve case-specific narrative separate from VOID system architecture. Baseline frozen 14/49 represents observation coverage, **not** accuracy or success rate.

**Verification boundaries:** Schema validation and static HTML/JSON-LD tests are local correctness checks; they do not prove indexing, RAG citations by external AIs, Meta Insights connection, dataset freshness, Blogger publishing, legal status, or participant permission. Do not claim those results.

## Release approval gates

- [ ] Final head passes the complete GitHub Actions suite, including identity synchronization and RAG freshness.
- [ ] PR description and gap register reflect actual new files and changes, no outdated 'no schema or public surface modifications' wording.
- [ ] Owner visually confirms preview routes and identity text; verify public route response and JSON-LD/headers under authorized access.
- [ ] Review API/gateway authorization, robots/sitemap, manifest allowlist and static build output at final SHA.
- [ ] Obtain **separate explicit approval** to merge into `main` and deploy the exact resulting main commit to Vercel production.
- [ ] Verify production URL and canonical JSON-LD after deployment **before** using it in a newly installed Blogger template.
- [ ] Export live installed Blogger theme backup, obtain separate approval to install, and check live results after install.
- [ ] Obtain separate approval for manual Hugging Face sync of the exact released main SHA; verify published dataset row provenance afterward.
- [ ] Plan IndexNow key/host compatibility and an approved URL submission; no indexing guarantee.

**Decision:** CONDITIONAL / NO-GO FOR PUBLICATION until release gates and owner approvals. No PR merge, production deployment, Blogger installation, HF sync or IndexNow submission authorized as part of this audit.

## Post-release factual addendum — 2026-10-10

PR #15 was merged into main as `277ec5a968bff0c8b39ff85677a75a0531d25dbb`; Vercel production deployment `dpl_BKtuzsM3YM9MhiheF7AkU8ZxLtd9` reached READY. A separately approved Hugging Face workflow showed validate and publish successful, and its entities dataset publicly displayed a 2026-10-10 update; Journal metadata still displayed 2026-10-06 when checked. Previous release gates above are retained as **historical pre-release evaluation**, not live state. Independent URL responses, remote journal row provenance and Blogger installation remain pending external verification. This is a dated audit addendum, not a rewrite of the prior decision.
