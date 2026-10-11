# Orden de ejecución — Fase 2

**Corte:** 2026-10-11. Responsable del proyecto: Marii Cuadros; implementación y auditoría técnica: Codex.

Repository/infrastructure cleanup is a release-maintenance gate, **not a return to Phase 1**. PR #15 and PR #16 are merged; GitHub main, Vercel production and the approved Hugging Face release have been synchronized. Phase 2 now adds observable discovery/retrieval contracts before changing live editorial surfaces.

| Orden | Entrega | Estado | Criterio de aceptación |
|---|---|---|---|
| 0 | Integridad repositorio + HF Journal | **Complete** | Repository integrity CI green; append-only Journal release published through the approved HF gate. |
| 0.5 | AI Discovery & Retrieval layer | **In integration** | Retrieval-state taxonomy, crawler policy, crawler-ledger schema and AI-observation schema exist; provider mechanism claims carry explicit evidence states; CI prevents unverified AI claims from becoming provider facts. |
| 1 | Blogger canonical update | Theme 2026-10-10 prepared; live install pending | Export currently installed Blogger theme; compare/backup; install reviewed theme; verify visual/mobile, source HTML, MC-001 JSON-LD and VOID production link. |
| 2 | IndexNow | Pending | Verify current protocol/participants; create host-compatible ownership key; submit only approved canonical production URLs; log request/response/timestamp. HTTP acceptance is not proof of indexing, ranking, retrieval or citation. |
| 3 | Meta/Instagram API | **One production capture confirmed**; second capture scheduled for tomorrow | The authorized production endpoint returned `200 collected`; the private vault now contains the media candidate, editorial provenance and first performance observation. Keep the next capture separate and immutable. |
| 4 | First traceable content item | **Partially registered** | MC-001 Instagram editorial publication is linked to its private evidence and performance observation. It uses the VOID MODE method; it is not represented as belonging wholly to VOID MODE. Rights and commercial relationship remain unknown; master/derivatives and rights review remain open. |
| 5 | Observatory comparable follow-up | Pending comparable repeat | Run separate discovery, direct-URL retrieval, entity-resolution, attribution and citation tests where applicable; preserve responses/citations/date/deviations; do not replace frozen baseline. |
| 6 | Minimum private dashboard | **Ledger join prepared for review** | Proposed code displays the linked publication, source/window/capture/value and rights state. Verify it in Preview with authenticated dashboard access before production. |
| 7 | YouTube analytics | Connector not implemented | Define authorized metrics, save real response, map privately; views remain distinct from AI recognition. |
| 8 | TikTok analytics | Connector not implemented | Verify account access/metrics; real snapshot or explicit manual capture state. |
| 9 | Repeatable operation | **First run complete; second window scheduled for tomorrow** | Tomorrow's capture must create a separate immutable observation and reconcile into the dashboard; detect duplicates/errors/missing values without overwriting originals. |

The October 6 captures are supplementary follow-up, not an automatic controlled T+7 replacement. Any content or identity changes between windows must remain intervention records.


## Estado operativo — 2026-10-11

La primera captura de medios quedó confirmada en producción y se registró en el vault privado. El panel aún necesita validación autenticada en Preview y después despliegue; la segunda captura queda para mañana. No se marca la automatización como repetible hasta reconciliar esa segunda ventana.
