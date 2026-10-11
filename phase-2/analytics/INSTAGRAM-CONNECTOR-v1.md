# AIO CODE — Instagram connector v1

**Date:** 2026-10-11  
**Entity:** MC-001  
**Phase:** Phase 2  
**Provider surface:** Meta Graph / Instagram APIs  
**Default tested Graph version:** v22.0

## Purpose

The connector moves authorized Instagram observations into the private AIO CODE operational vault while keeping platform data, internal Content IDs, provenance and causal interpretation separate.

Pipeline:

`Meta Graph API -> raw private snapshot -> normalized account observation / media candidate -> private vault -> human content mapping -> Performance Ledger -> Brain`

## Verified baseline

A clean Preview read on 2026-10-11 returned the configured Instagram Business account, media and account-level Insights. This establishes authorized retrieval under that tested configuration. It does not establish production scheduling, algorithmic influence, causal content effects or external AI recognition.

## Runtime modules

- `lib/meta-instagram.mjs` — server-side Meta client; token is sent in the Authorization header, never in the URL.
- `lib/account-observation.mjs` — immutable normalization of account-level reach, views and total_interactions.
- `lib/media-candidate.mjs` — immutable platform-media observations with deterministic proposed Content IDs.
- `lib/vault-client.mjs` — verifies that `aio-code-vault` is private and performs non-forcing atomic commits.
- `api/collect-instagram.mjs` — daily cron target; disabled unless `AIO_COLLECTION_ENABLED=1`.
- `api/dashboard.mjs` + `/dashboard/` — private operational read layer.
- `api/integration-status.mjs` — configuration status only; exposes no secret values.

## Production variables

Required for collection:

- `IG_BUSINESS_ID`
- `IG_LONG_TOKEN`
- `CRON_SECRET`
- `AIO_VAULT_WRITE_TOKEN`
- `AIO_COLLECTION_ENABLED=1`

Required for dashboard reads:

- `AIO_VAULT_READ_TOKEN`
- `AIO_DASHBOARD_ADMIN_TOKEN` (preferred; the old Preview-only `AIO_INSIGHTS_ADMIN_TOKEN` is accepted only as a compatibility fallback)

Optional:

- `META_GRAPH_API_VERSION` — defaults to `v22.0` until a controlled version migration is tested.

Secrets never belong in Git, snapshots, URLs, public logs or public documentation.

## Daily collection

Vercel Cron is configured for `13:00 UTC` (08:00 Colombia) and calls `/api/collect-instagram`. Vercel sends `Authorization: Bearer <CRON_SECRET>`; the endpoint rejects any other request.

The collector requests the previous Colombia calendar day for account-level Insights, captures the current account state and recent media, then atomically writes immutable records to the private vault.

Account metrics and media counters remain separate:

- account: reach, views, total_interactions;
- media: observed platform identity, publication timestamp, type, permalink, like_count and comments_count.

No account metric is assigned to an individual post.

## Content identity boundary

A media record creates a deterministic candidate such as:

`MC-001-IG-<platform_media_id>`

That is a proposed internal Content ID, not automatically a canonical `content_provenance` record. Human mapping is required before the Brain admits publication provenance or per-content performance records.

## Evidence states

A successful provider response means **authorized retrieval observed** at a timestamp. A successful vault commit means **private ingestion recorded**. Neither means:

- the content intervention caused the metric;
- Instagram recommended the content because of AIO CODE;
- an external AI indexed, retrieved, resolved or cited the entity;
- provider aggregation semantics are fully known beyond the returned fields.

## Release gates

1. CI passes connector tests and existing DEOS integrity checks.
2. Preview route returns expected account/media/Insights.
3. Production variables exist without secret exposure.
4. Production collection remains disabled until explicit release.
5. First scheduled run must create a new immutable vault snapshot and job marker.
6. Second scheduled run must create a later observation without overwriting the first.
7. Only then is automatic collection labeled operational.
