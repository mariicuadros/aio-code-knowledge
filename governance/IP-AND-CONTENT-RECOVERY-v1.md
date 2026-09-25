# AIO CODE — IP, Content and Account Recovery Operations v1

**Prepared:** 2026-09-25  
**Status:** Operating standard and empty fields for verification; not a legal opinion, registration, or proof of ownership.  
**Scope:** Marii Cuadros (MC-001), AIO CODE (AIO-001), VOID MODE (VOID-001), related creative assets, platforms, and future client material.

## 1. Separate the rights domains

Keep evidence and ownership records separate for:

1. **Marii Cuadros:** name, likeness, voice, performance, and personal accounts.
2. **AIO CODE:** name, methodology, schemas, software, research records, and brand materials.
3. **VOID MODE:** story, scripts, characters, visual designs, music, footage, edits, and derivative content.
4. **Third-party/client material:** client-provided data, likeness permissions, music, stock, marks, and licenses.
5. **Shared/open-source material:** source license and attribution obligations.

The repository describes Marii as creator of AIO CODE and VOID MODE and OZCU as the venture layer. That description does not establish legal ownership, company incorporation, assignment, or trademark registration. Record legal holder and supporting evidence per asset; leave them unresolved until checked.

## 2. Minimum asset record

Use `ip-asset-register-v1.csv` for each brand, work, account, or licensed component. Add one row per distinct asset or rights grant. Preserve the original source, first-known creation date (or `not_collected`), creator statement, collaborators, AI assistance, rights holder, license scope, territories, term, permitted channels, paid-use permission, and evidence link.

Do not infer ownership from possession, a filename, a Git commit, or a first-party description. Preserve dated drafts, project files, exports, source media, prompts when relevant, and correspondence/agreements in an access-controlled archive. Do not put identity documents, private contact details, passwords, recovery codes, or unredacted contracts in this public repository.

## 3. Human authorship and AI contribution

For every publishable work, record separately:
- human-originated concept, story, performance, selection, direction, editing, and final decisions;
- AI-assisted stages, tool/model/version when known, prompt or generation reference, and the human changes after generation;
- source assets and permissions for likeness, voice, music, footage, fonts, and marks;
- the evidence that supports each authorship or permission statement.

Use the rights/disclosure and content-provenance templates in `brain/templates/README.md`. An AI tool's terms are not a substitute for third-party permissions or a legal determination of protectability. Do not label an asset `cleared`, `owned`, or `registered` without evidence and review.

## 4. Content master and publication control

Use `entities/void-mode/content-master-register-v1.csv` for Season 1 episode and Trial records. The nine episode rows are outlines; the sixteen Trial rows are proposed tests. None is marked as a finished or published asset.

For each actual master and derivative:
1. assign a stable master ID before production;
2. capture source files and the human/AI contribution record;
3. create platform derivative IDs that point back to the master;
4. complete rights, disclosure, and claim-source checks;
5. log material batches with a Changeset ID and public/research changes with an Intervention ID;
6. record publication URL and timestamp only after verifying the live post;
7. preserve a dated analytics/evidence capture separately from the creative asset.

A content plan, render, filename, scheduled post, or repository upload does not prove public publication. If a row has unresolved material rights or consent, hold that asset from publication or paid use until resolved.

## 5. Pre-publication gate

A post may be marked `approved_for_publication` only when:
- the intended entity and relationship to related entities are explicit;
- asset sources, human contribution, AI assistance, and rights evidence are recorded;
- music, likeness, voice, footage, third-party marks, and client material have scope-matched permissions or are removed;
- required AI/ad/campaign disclosures have been reviewed for the actual platform and use;
- factual claims point to sources that support the exact claim;
- the original master and account recovery route have a current backup;
- Content ID, Changeset ID, and Intervention ID are assigned where applicable.

`PAIDREADY` is a checklist state, not a guarantee or legal clearance. Leave it unassigned while material rights or approvals are unknown.

## 6. Account identity and recovery pack

Keep a private recovery inventory outside GitHub, the public site, and chat. For each platform/account, record:
- canonical entity/account name and public URL;
- account owner/controller and a separate recovery contact role;
- control evidence and last verification date;
- recovery email/phone *location or custodian reference*, not the secret itself;
- 2FA method and where recovery codes are stored (never the codes);
- domain registrar and renewal-responsibility role, if applicable;
- official recovery URL, support case reference, and last successful recovery test;
- backup location for exports, masters, and configuration.

Store actual passwords, recovery codes, private keys, identity documents, and personal phone/email values only in an appropriate private credential store or sealed offline record. Do not paste them into issues, commits, datasets, analytics, or this ledger.

## 7. Low-cost continuity and disaster recovery

Maintain:
- one working copy in the controlled repository;
- a periodic export of the repository, media masters, and registries to encrypted offline storage;
- a second copy in a separate physical location when available;
- a short restore note describing how to recover the repository, domain, site, dataset, and content masters.

At each monthly review, verify that the archive opens, check domain renewal responsibility, confirm at least two authorized recovery routes where the platform supports them, and record the date/result. Never claim recovery readiness before a restore test.

## 8. Trademark readiness

The register currently contains **no verified trademark registrations**. Before any filing or paid legal work, assemble a private dossier per mark: exact mark and variants, actual goods/services, intended owner/legal entity, target jurisdictions, earliest evidenced use (if any), public use examples, and permission/assignment chain. Search relevant official registers and obtain qualified local advice on distinctiveness, conflicts, classes, owner, and filing strategy. A preliminary search is not legal clearance; a filing, application, or registration must be recorded with official evidence and status.

No jurisdiction, class, legal owner, filing, or registration is asserted by this document.

## 9. Current project facts and open verification

- AIO CODE remains the primary public/project brand through at least 2027; OZCU is the venture/company layer and reserve corporate identity.
- The MC-001 baseline is frozen partially at 14/49. It is not a clean pre-content baseline. Future releases need their own logged Changeset/Intervention and a dated follow-up; do not attribute changes causally without a suitable comparison.
- The repository contains a VOID MODE Season 1 outline, a rights/provenance template, and separate MC-001 content registries. Existing public-post assets must be checked individually; filenames alone do not settle publication, ownership, or license status.
- Still to verify with the creator/legal professional: asset-by-asset rights holders, co-author/performer agreements, AI tool records and terms for actual outputs, account custodians/recovery routes, private backup location and successful restore, trademark owner/jurisdiction/classes, and any filing or registration evidence.

## 10. Review record

This v1 is an operational checklist created from the project conversation. It is not a signed assignment, license, consent, copyright registration, trademark clearance, or legal opinion. Record changes through the repository's methodology change log.
