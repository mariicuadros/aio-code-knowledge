# Orden de ejecución — Fase 2

**Corte:** 2026-10-10. Responsable del proyecto: Marii Cuadros; implementación y auditoría técnica: Codex.

The repository/infrastructure cleanup is a release-maintenance gate, **not a return to Phase 1**. PR #15 is merged and Vercel production is updated. PR #16 closes repository integrity and Hugging Face Journal chronology before the remaining Phase-2 integrations.

| Orden | Entrega | Estado | Criterio de aceptación |
|---|---|---|---|
| 0 | Integridad repositorio + HF Journal | **PR #16: CI required before merge** | Repository-wide integrity validator green; Journal chronology append-only; merge once final head is green; run approved HF sync and verify public metadata. |
| 1 | Blogger canonical update | Theme 2026-10-10 prepared; live install pending | Export currently installed Blogger theme; compare/backup; install reviewed theme; verify visual/mobile, source HTML, MC-001 JSON-LD and VOID production link. |
| 2 | IndexNow | Pending | Create host-compatible verification key/module; submit only approved canonical production URLs; log response without claiming guaranteed indexing. |
| 3 | Meta/Instagram API | PR #10 open/draft; real production capture not verified | Resolve protected endpoint/auth flow, obtain one authorized real snapshot, store privately, map to Ledger, keep secrets outside Git. |
| 4 | First traceable content item | Pending real record | Content ID, master/derivatives, publication links and Intervention ID; rights/disclosure reviewed; private ledger/source retained. |
| 5 | Observatory comparable follow-up | Pending comparable repeat | Repeat selected prompts/conditions, preserve responses/citations/date/deviations; do not replace frozen baseline. |
| 6 | Minimum private dashboard | Pending real data | Display publication/source/window/capture date/value/absence/error; reconcile one row against raw snapshot + Ledger. |
| 7 | YouTube analytics | Connector not implemented | Define authorized metrics, save real response, map privately; views remain distinct from AI recognition. |
| 8 | TikTok analytics | Connector not implemented | Verify account access/metrics; real snapshot or explicit manual capture state. |
| 9 | Repeatable operation | Pending | Repeat capture → register → dashboard in a second window; detect duplicates/errors/missing values without overwriting originals. |

The October 6 captures are supplementary follow-up, not an automatic controlled T+7 replacement. Any content or identity changes between windows must remain intervention records.
