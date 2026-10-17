# AIO CODE — Release and Indexation Protocol v1 (2026-10-17)

Status: DRAFT. Operational rule for MC-001, DAN-001, AIO-001 and future entities. AIO CODE is a Digital Entity Operating System (DEOS).

## Mandatory separation
1. Public identity source: reviewed Entity Home in Vercel and its stable Person @id.
2. Blogger: editorial article with contextual link to Entity Home; do not introduce a competing Person @id or copy an entire Vercel HTML page into Blogger.
3. Indexability, indexed status, search visibility, Google AI Mode, and Bing/Copilot citations are distinct measurements.
4. Never claim a submitted URL is indexed. Preserve screenshots and timestamps.

## Pre-release gates
- Record source entity revision, approval, consent scope, SHA, owners and private evidence references (no personal documents in public git).
- Validate SEO basics: unique concise visible title; descriptive meta description; one H1; headings; sameAs owned/declared links; canonical; robots/noindex; sitemap URL; internal links; HTTPS; responsive layout.
- Run HTML/JSON-LD parity tests, privacy tests, repository CI, then Vercel Preview. Review Blogger preview.
- Freeze the release candidate. A production deployment and editorial publication should be deliberately coordinated. Avoid several partial changes followed by repeated indexing requests.

## Post-release check
- Verify actual accessible URL, HTTP 200, expected canonical, server-rendered metadata, mobile layout and structured data.
- In Google Search Console inspect indexed status AND live test, on each distinct URL/property.
- In Bing Webmaster Tools inspect indexed status AND live URL. Distinguish critical crawl errors from non-critical SEO/GEO recommendations.
- If already indexed, do not resubmit mechanically. If new/updated and indexable, one manual request when justified. If quota exceeded, log rejection and wait; never mark as accepted.
- Keep a verification log (date, platform, canonical, crawl date, request outcome, index state, observed AI results, screenshot/reference).
- Check again after recrawl, not every hour. No guarantee of indexation or AI citation.

## 2026-10-17 findings
- DAN-001 Blogger post: Bing shows INDEXED; flags long title and missing meta description (not an indexing blockade).
- DAN-001 Blogger post: Google live test indexable; manual indexing request accepted.
- DAN-001 Vercel Entity Home: Google live test indexable and one valid ProfilePage item; not indexed at inspection; manual request rejected due to quota, not queued.
- aio-code.vercel.app homepage: indexed in Google according to operator screenshot.
- Vercel repository: DAN-001 Entity Home has a short title and meta description and is listed in sitemap; the live rendered response still needs independent verification.
- Blogger theme tracked in repository does not prove current live theme matches. Before changing global theme, review page source for title and meta description and back up active theme. Prefer adjusting the specific post's Search Description and title, without changing existing permalink or global templates.
- Original Blogger SEO report and Google's indexing may be out of sync. Reinspection after changes is sufficient, no automatic resubmission.

## Outstanding work
- [ ] Blogger operator: verify 'Settings > Meta tags > Enable search description', add distinct search description to DAN-001 post.
- [ ] Shorten displayed post title if needed, preserving existing permalink.
- [ ] Confirm resulting live HTML <title> and <meta name="description">; verify using Bing's URL inspection.
- [ ] Validate current live theme against versioned theme before any changes.
- [ ] Inspect Vercel /entities/marii-cuadros/ and /entities/nux/ for discoverability, do not alter canonicals without evidence.
- [ ] Check Bing's specific quota/error message before deciding between manual submissions and automatic discovery.
- [ ] Track indexation status and AI Mode responses separately at defined checkpoints.
