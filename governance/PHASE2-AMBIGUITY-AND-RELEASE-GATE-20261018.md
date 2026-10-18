# Phase 2 — Ambiguities, evidence levels and public-release boundary

**Audit date:** 2026-10-18 (UTC). **Scope:** Entity Console laboratory and its current API, private GitHub Vault, reviewed RAG/public corpus and frozen MC-001/AIO-001 records.

## Verified, not inferred

- An authorized operator created a **synthetic** private entity through the OIDC lab frontend. Remote GitHub Vault `main` retained six immutable revision files (`create`, `edit`, `validate`, `approve`, `publish` as **private package preparation**, `archive`). The final revision is archived with no active approval, private package or public URL. This verifies basic browser → BFF → backend → Vault integration, **not** a multi-tenant product.
- Anonymous browser GET `/api/entities` returned only `unauthorized`. The user reported a matching denial when following the per-record link, but the screenshot truncated the URL; do not claim more than that evidence supports. Header-level HTTP status was not captured.
- Local CI validated session integrity, origin rejection, idempotency, revision and payload safety with **synthetic fixtures**. This is not an authenticated remote adversarial test on Vercel.
- A green Vercel build (`READY`) does not prove the origin/SSO/OIDC chain or every runtime route. The successful remote create/revise lifecycle gives stronger evidence for that specific path.
- No fake entity was added to canonical graph, search engines, RAG public sources or Hugging Face.

## Remaining ambiguity and treatment

| Ambiguous concept | Exact meaning | Decision / control |
| --- | --- | --- |
| `ENT-UUID` vs `DAN-001` | Private administrative record ID vs reviewed public canonical identity | Never derive a public `@id` from ENT or arbitrary name. Public release requires an approved canonical target. |
| `approved` vs `pending_deployment` vs `published` | Human approval of a specific record revision vs preparation of a private package vs independently verified public deployment | Keep three distinct states. Existing `publish` action means private preparation only. |
| `useAuthorized` checkbox | Operator attests usage authorization for selected data | Not a legal conclusion, permission to use third-party rights, or authorization to automatically publish online. |
| `evidence_state=unknown` | A recorded, unverified claim | Does not become verified by inclusion in an Entity Passport, approval or AI/RAG retrieval. |
| `sameAs` and profiles | First-party declared links | Not account ownership verification or recognition by external AI. |
| OIDC lab vs generic frontend | Protected deployment branch `codex/lab-oidc-20261011` is independent of frontend default `codex/entity-console` | No blind cross-branch overwrite; keep protected deployment origin and credentials server-side. |
| Vault archival | Latest revision removes active approval/package while older immutable revisions remain | Historical content is retained privately; archival is not secure deletion of external copies. |
| Rate limiting | In-memory per process for present single-admin MVP | Not distributed rate enforcement; do not market as multi-client tenancy or comprehensive abuse defense. |
| External SERP/AI answers | Retrieval by third parties | No claims of Google/Bing/LLM recognition based solely on local JSON-LD, RAG or HF parity. |

## Public release gate contract

`lib/entity-public-release-gate.mjs` introduces a pure `publicReleaseCandidate(record)` check. It requires an intact current approval, a reviewed `canonicalEntityId` and exact `@id` and page from `lib/public-identity-targets.mjs`, approved selection of `officialUrls`, an unchanged saved private package, and zero occurrences of private administrative `ENT-UUID` in candidate output. Rejects archived/draft records and arbitrary canonical IDs. It returns only non-secret public candidate fields; no mutation and no deployment.

**Important:** This is a future-release contract with CI coverage, **not a wired deployment pipeline**. Every new release mechanism must call this check and receive explicit human publication authorization, run its own privacy/security gate, and record the final URL/commit and indexation observation. The current private Entity Console `publish` action must not be renamed or implied to publish online.

## Open gates after this change

1. Remote negative tests with controlled authenticated session: CSRF/Origin, stale revision (409), changed-payload idempotency (409), explicit unauthorized writes, no Vault changes for rejected operations. Use synthetic ID only and sanitize evidence.
2. Assign canonical identity via separately approved privileged workflow; frontend lab intentionally does not let an operator type unreviewed IDs.
3. Define and review a separate release PR and deploy action for only explicitly authorized independent entities; no production automation yet.
4. Multi-admin/tenant isolation, durable distributed rate limiting, permission separation and long-term retention/deletion governance are not implemented/verified as customer-facing capabilities.

**Frozen core:** no changes to existing MC-001 or AIO-001 source records or to historical Phase 1 baselines.
