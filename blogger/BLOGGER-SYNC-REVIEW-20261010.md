# Blogger publication gate — 2026-10-10

Source theme backup in Git: `blogger/theme-aio-code-20260928.xml`. Proposed, **unpublished** theme: `blogger/theme-aio-code-20261010.xml`.

Live review of https://mariicuadros.blogspot.com/ on 2026-10-10 still shows the old VOID MODE wording and the prior short public biography. This is confirmed publication drift, not a GitHub build failure.

## Acceptance checks before installation

1. Verify the canonical VOID MODE production URL https://aio-code.vercel.app/entities/void-mode/ responds successfully and displays the independent creative system definition. The branch preview READY alone is insufficient.
2. In Blogger admin, export and retain a separate backup of the **currently installed** theme, because the September Git backup need not match the installed revision.
3. Diff the installed theme against the proposed one; inspect widgets, theme settings, dynamic Blogger tags and tracking scripts before replacing. The repository theme is not a guaranteed byte-for-byte backup of the live installation.
4. Owner approves installation. Then inspect desktop/mobile rendering, navigation, widgets, HTML source, JSON-LD Person @id/name/alternateName/jobTitle and canonical link.
5. Preserve dated blog posts. Add dated editorial correction links for historical articles where appropriate; do not rewrite historical evidence.
6. Recheck Blogger public content, current profile widget and outbound VOID link. Record a timestamp and screenshot or verifiable page snapshot.

**Blocked until owner action**: Blogger editor access and final theme install. No passwords or tokens may be copied into GitHub. The theme's local identity tests do not verify live publication or Blogger template compilation.
