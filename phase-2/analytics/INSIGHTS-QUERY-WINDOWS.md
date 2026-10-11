# Instagram Insights: explicit account query windows

The protected Preview endpoint accepts paired `since` and `until` integer Unix timestamps in seconds. Both are required when either is supplied; duplicates, fractions, milliseconds, reversed/equal ranges and future boundaries return HTTP 400 without calling Meta.

Example: `/api/insights?since=1791176400&until=1791262800` requests boundaries 2026-10-05 00:00 and 2026-10-06 00:00 in America/Bogota (05:00 UTC). This is a requested range; do not assume the provider's daily buckets or boundary inclusivity without provider verification.

Dates are forwarded only to the account insights edge. Account profile fields (followers_count, media_count) remain current snapshots, not historical values for that range.

The response preserves the existing fields and adds:
- `request.since`, `request.until`: seconds, or null for legacy requests.
- `measurement_window.status`: `explicit_requested` or `provider_default_unconfirmed`.
- `measurement_window.requested`: seconds and UTC boundaries, or null.
- `measurement_window.provider_end_times`: reported time-series bucket end times, when present.
- `measurement_window.scope`: `account`.

An echoed requested range does not independently confirm Meta aggregation semantics. Legacy snapshots remain unbounded; do not retrospectively assign this new interval to them. Empty metrics are not zero. These metrics must not be inserted as per-publication observations without an appropriate content association.

Validation: `node --test tests/insights-window.test.mjs` (16 isolated tests, mocked Meta transport, no real credentials).
Official primary source: Meta Python Business SDK, `facebook_business/adobjects/iguser.py`, `get_insights` parameter checker declares `since` and `until` datetime parameters:
https://github.com/facebook/facebook-python-business-sdk/blob/main/facebook_business/adobjects/iguser.py
Meta web reference could not be retrieved (HTTP 429) during review. Live dated request remains necessary for the existing v22.0 integration.

Deployment scope: existing Insights feature branch, Preview only. Production release and Brain ingestion are separate pending steps.
