# Website analytics connection — September 29, 2026

Vercel project `aio-code` is connected to its GitHub source. At this review, production served deployment `dpl_4tjdJiahJSK4kaFhRSU7qsXrrG54`; the hosted `/_vercel/insights/script.js` returned HTTP 200. This supports service-route availability, not dashboard ingestion or measured visitor counts.

The five public HTML routes load `assets/web-analytics.js`, which loads Vercel's first-party pageview script only on the canonical production host. It strips URL query strings and fragments, rejects custom/identity events, and does not send checker answers, RAG form contents, credentials or private Ledger records. Local/preview visits do not load it. There is no backfill of old pageviews.

After deployment, inspect Analytics in the project's Vercel dashboard and confirm an ordinary visit appears. A script response or source-code test alone is not the confirmation. Existing bots/ad blockers and Vercel bot filtering may exclude visits; never manufacture events to fill a baseline. The connected app did not expose dashboard ingestion data in this review.

Web Analytics records website traffic separately from Meta Insights. Meta OAuth, professional-account permissions, token storage and a real Insights read into the private Ledger remain pending. No Meta credentials were requested or stored, and no API access is implied by deploying the site. October measurement records need actual windows, metric definitions, source/ref and collection times.

References: https://vercel.com/docs/analytics/quickstart and https://vercel.com/docs/analytics/redacting-sensitive-data
