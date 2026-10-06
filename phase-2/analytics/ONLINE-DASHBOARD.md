# Private online Brain dashboard

Status: code prepared and tested; live vault access and daily collection require credential setup and a real end-to-end verification. Preview does not run production cron schedules.

## Access

/dashboard/ contains no embedded account observations. POST /api/dashboard-session checks same-origin requests and the administration bearer key, then issues a Secure, HttpOnly, SameSite=Strict session for one hour. GET /api/dashboard verifies authorization before requesting the private vault. It pins the main commit and verifies each normalized record against its original snapshot before returning data. The read credential stays on the server.

## Configuration

| Variable | Purpose |
| --- | --- |
| AIO_INSIGHTS_ADMIN_TOKEN | Administration key and session signing secret |
| AIO_VAULT_READ_TOKEN | Fine-grained GitHub token; selected aio-code-vault repository, Contents read only |
| AIO_VAULT_WRITE_TOKEN | Separate token; selected aio-code-vault repository, Contents read and write |
| CRON_SECRET | Secret bearer key for scheduled collection |
| AIO_COLLECTION_ENABLED | Set to 1 only after live validation |
| AIO_INSIGHTS_ENABLED | Existing Insights feature flag, must be 1 for collection |
| IG_BUSINESS_ID, IG_LONG_TOKEN | Existing Meta credentials |

Enter credentials directly in Vercel environment settings; never commit their values. Configure Preview first. Production configuration and promotion remain pending.

## Collection

/api/collect-instagram requests the previous calendar day in America/Bogota. It stores the untouched response, verified account observation and daily marker in one private Git commit. Repeated execution skips an existing marker. Concurrent main changes trigger a bounded retry with a fresh parent, without forcing the branch. Requested dates do not prove provider bucket alignment; current account counters remain distinct from historical metric windows.

vercel.json prepares a daily 13:00 UTC schedule. Hobby execution can occur within that hour. The schedule runs in production only and collection remains disabled unless explicitly configured. No backfill or public publishing is performed.

## Validation

16 automated tests pass for authorization, sessions, evidence validation, window calculation, atomic persistence, duplicate prevention and concurrent writes. Browser verification exercises the actual route handlers with mocked GitHub responses: login, metrics, refresh, logout and mobile layout. This does not establish a live Vercel-to-vault connection.
