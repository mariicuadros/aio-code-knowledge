# Codex Master Prompt — AIO CODE Phase 2 Local Repository Maintenance

Use this prompt from the repository root in Codex/VS Code when you want one controlled pass over the local working copy.

---

You are maintaining the local working copy of **mariicuadros/aio-code-knowledge**, the public source-of-truth repository for **AIO CODE (AIO-001)**, a **Digital Entity Operating System (DEOS)**.

## Objective

Bring the local repository into alignment with the current approved remote architecture while preserving valid local Phase-2 work and without re-opening completed Phase-1 decisions.

## Non-negotiable identity rules

- AIO CODE = DigitalEntityOperatingSystem. Never redefine it as merely a methodology, experiment, framework or SEO system.
- MC-001 = Marii Cuadros. Full name: Maria Alejandra Cuadros Lozada. Same person, never a second entity.
- VOID-001 = VOID MODE = CreativeSystem, distinct from Marii's personal artistic universe/aesthetic.
- NUX-001 = distinct DigitalCreativeEntity.
- OZCU-001 = declared developer company/venture; legal formalization pending. Do not claim completed incorporation.
- Canonical five-entity set must remain intact.
- Social visibility, traffic, ranking, followers and engagement are not AI recognition/citation.
- Published != crawled != indexed != retrieved != entity-resolved != attributed != cited.

## Evidence rules

Treat every mechanism claim as one of:
- provider_documented
- first_party_observed
- third_party_documented
- ai_reported_unverified
- hypothesis
- unknown

Do not convert an AI assistant's self-description into provider fact unless first-party provider documentation or direct evidence supports it.

Do not infer:
- private LLM indexes,
- hidden knowledge graphs,
- embedding geometry,
- model-training inclusion,
- Meta account linkage semantics,
- crawler behavior,
- causality from publication to citation,
unless the repository contains qualifying evidence.

## Phase-2 retrieval architecture

Preserve and use:
- phase-2/AI-DISCOVERY-RETRIEVAL-LAYER-v1.md
- phase-2/crawler-policy-v1.json
- schemas/crawler-ledger.schema.json
- schemas/ai-observation-record.schema.json

Keep these states separate:
published -> crawlable -> crawl_observed -> indexation_observed -> retrieved -> entity_resolved -> attributed -> cited -> answered

Discovery tests and direct-URL retrieval tests are different experiments.

## Local synchronization procedure

1. Inspect, do not mutate yet:
   - git status --short
   - git branch --show-current
   - git rev-parse HEAD
   - git rev-parse origin/main
   - git diff --stat
   - git diff --name-status origin/main...HEAD
   - git diff --name-status
2. Never discard uncommitted work automatically.
3. Identify local-only files and classify each:
   - KEEP_AND_INTEGRATE
   - KEEP_PRIVATE
   - REGENERATE_FROM_MAIN
   - OBSOLETE
   - NEEDS_REVIEW
4. Preserve useful Phase-2 API work such as Instagram/Meta endpoints only after comparing it with remote PR/history.
5. Never restore stale generated RAG/index artifacts over newer canonical versions.
6. Never copy .audit-phase2, virtual environments, caches, dependencies or temporary audit outputs into the canonical repository.
7. Never expose or commit tokens, API keys, bearer secrets, cookies, recovery codes or private raw captures.
8. If the repository is inside OneDrive or another sync service and Git object operations fail, do not reset or delete .git. Recommend/use a clean working copy outside the sync root and reconcile changes safely.

## Canonical change order

When identity semantics change, update in this order:
1. entity passports/master record
2. entity graph
3. machine-readable schemas/JSON-LD
4. entity public pages
5. sameAs/social/platform registries
6. RAG answer policy/corpus
7. downstream exports
8. tests/validators
9. release notes/governance

Never patch a downstream copy while leaving the canonical source inconsistent.

## Current Phase-2 order

1. Local repository alignment
2. Blogger canonical update
3. IndexNow
4. Meta/Instagram API and private Ledger
5. First traceable content item
6. Observatory follow-up
7. Minimum private dashboard
8. YouTube/TikTok analytics
9. Repeatable operation

Do not move IndexNow or APIs ahead of the repository/Blogger canonical state.

## Validation

Before proposing any commit, run the repository's actual validation commands, including:

python scripts/validate_release_safety.py
python scripts/validate_core.py
python scripts/audit_repository_integrity.py
python scripts/validate_intake.py
python scripts/validate_brain.py brain/contracts/examples.synthetic.json
python -m unittest discover -s tests -v
python scripts/validate_site.py
python scripts/validate_entities.py
python -m rag.evaluate
python scripts/build_public_rag.py --check
npm ci --ignore-scripts --no-audit --no-fund
npm run check:gateway
npm run check:precontent
node scripts/validate_rag_safety.mjs
npm run build

If a validation fails, fix the source inconsistency. Do not bypass, weaken or delete the validation merely to make CI green.

## Output required

Return:
1. current local SHA and origin/main SHA;
2. exact files differing from origin/main;
3. classification of each local-only or modified file;
4. corrections actually made;
5. tests run and their result;
6. remaining blockers;
7. whether the folder is safe to use as the single Phase-2 working copy.

Do not claim external indexing, crawler visits, API success, Blogger publication, Vercel deployment or Hugging Face synchronization unless independently verified in that run.
