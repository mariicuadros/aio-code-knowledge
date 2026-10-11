# AIO CODE — Meta / Instagram API status

**Date:** 2026-10-10  
**Phase:** Phase 2  
**Scope:** authorized Instagram account metrics for MC-001

## Current evidence

A private Vercel Preview read was successfully observed on 2026-10-03 using Meta Graph API v22.0. The authorized Instagram Business account returned account data and account-level metrics. That result establishes that the account ID, token and Preview authorization worked together at that time.

It does **not** establish production readiness, causal impact of any content intervention, historical bucket semantics, or future token validity.

## Current implementation goal

Rebuild the protected `/api/insights` endpoint on top of the current Phase-2 `main` branch rather than merging the obsolete draft PR #10 directly.

The endpoint:

- is disabled unless `AIO_INSIGHTS_ENABLED=1`;
- requires `Authorization: Bearer <AIO_INSIGHTS_ADMIN_TOKEN>`;
- sends the Meta access token only in the Authorization header;
- allowlists account metrics;
- sanitizes upstream errors;
- marks requested measurement windows separately from provider-returned bucket end times;
- returns `Cache-Control: no-store`.

## Environment boundary

Preview currently has the required Meta account variables and the protected admin flag/token configured. Production remains a separate release decision.

## Evidence rule

A successful API response proves only that authorized data was returned under the tested configuration and timestamp.

Do not infer:

- algorithmic influence;
- causal performance improvement;
- recommendation effects;
- AI recognition;
- content-level attribution unless a separate Content ID / Intervention ID relationship exists.

## Next gate

1. Run isolated tests on the clean branch.
2. Deploy to Preview.
3. Confirm unauthorized requests fail.
4. Perform one authorized read in Preview.
5. Record timestamp, Graph API version, account identity and returned metrics without exposing credentials.
6. Only after stable Preview behavior decide whether to merge and prepare the collector / Performance Ledger layer.
