# AIO CODE — IndexNow integration

**Date:** 2026-10-10  
**Host:** `aio-code.vercel.app`  
**Status:** implementation configured; submission evidence must be recorded per run.

## Purpose

IndexNow is used only as a discovery notification mechanism for URLs on the canonical AIO CODE Vercel host.

It does not establish or guarantee:

- crawling;
- indexation;
- ranking;
- entity resolution;
- AI retrieval;
- attribution;
- citation;
- recommendation.

A successful HTTP `200` is recorded only as **submission accepted**.

## Public key verification

The IndexNow key is intentionally public and is hosted at:

`https://aio-code.vercel.app/2000427ca5d64970a33991c02e493ab4.txt`

The file must contain exactly the key value.

## Submission rule

Submit only URLs that are added, updated, or deleted after IndexNow adoption. Do not backfill unchanged historical URLs merely because the integration is new.

Use:

```bash
npm run indexnow -- https://aio-code.vercel.app/path/
```

For validation without sending:

```bash
npm run indexnow -- --dry-run https://aio-code.vercel.app/path/
```

The script:

1. restricts submissions to `https://aio-code.vercel.app/`;
2. verifies that the public key file is live and exact;
3. posts the URL list to `https://api.indexnow.org/indexnow`;
4. prints a timestamped JSON record with the HTTP status and interpretation.

## Evidence handling

For every real submission, preserve:

- timestamp;
- submitted URL list;
- key location;
- HTTP status;
- response body when present;
- related deployment/commit;
- later crawl/index observations separately.

Do not convert IndexNow acceptance into an indexation or AI-recognition claim.
