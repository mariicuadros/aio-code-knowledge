# CODEX · Orden de implementación DEOS — 2026-10-17

## Identidad y límites de mandato
Actuar como ingeniero de mantenimiento y auditoría de AIO CODE, **Digital Entity Operating System (DEOS)**. No reformularlo como una metodología. Mantener MC-001 y AIO-001 congeladas en contenido canónico, pasaportes, definiciones y representaciones públicas. No alterar baseline Fase 1 (14/49). Incorporar nuevas entidades mediante registros independientes.

**No:** publicar automáticamente, hacer push a main sin PR, activar Hugging Face, desproteger Vercel, cambiar credenciales, modificar Vault privado con fixtures reales, divulgar documentos, fusionar PR antiguos, inventar evidencia ni recrear DAN-001.

## Preparación de entorno Codex
1. Trabajar en worktree limpio **fuera de OneDrive**, con ramas nuevas `codex/audit-...` por repositorio. `git status --porcelain` antes/después; nunca sobrescribir trabajo local de la fundadora o Israel.
2. Auditar `aio-code-knowledge` main, `aio-code-frontend` rama desplegada `codex/lab-oidc-20261011`, rama predeterminada `codex/entity-console`, y estructura de `aio-code-vault` con acceso autorizado. Reutilizar tests/contracts; no duplicar Brain ni Ledger.
3. Leer primero `audits/2026-10-17/ECOSYSTEM-OFFICIAL-AUDIT.md`, `governance/frozen-core-baseline-20261017.json`, `scripts/check_frozen_core.py`, `governance/REPOSITORY-STRUCTURE-CONTRACT-v1.md`, `docs/phase2-public-update-proposals.md` y `phase-2/README.md`.
4. Emitir matriz `repositorio/rama/commit/despliegue/external-publish-sha/evidence-status` con corte fechado; no inferir sincronización por coincidencia de títulos.

## Lotes de tareas (separar PRs)
### PR A · Freeze y seguridad — P0
- No editar archivos congelados. Activar chequeo `python scripts/check_frozen_core.py` en CI y validación HF. Añadir test negativo que altere archivo temporal y pruebe que el gate falla; test positivo de alta de nueva entidad ficticia fuera de rutas protegidas.
- Verificar que `main` exija pull request, check `validate`, no force push y no bypass. Si conector no tiene permiso de settings, dar instrucciones de UI; no afirmar protección activa.
- Revisar detección de secretos y exposición pública incluyendo `public-site-manifest.json`, rutas `api/*`, histórico sensible cuando exista permiso. Nunca imprimir secretos.

### PR B · Consolidación frontend / backend — P0
- Comparar `aio-code-frontend` default con `codex/lab-oidc-20261011` desplegada y seleccionar base validada. Hacer PR aislado contra rama acordada; no cambiar default sin autorización y pase completo.
- Test extremo a extremo autenticado con entidad **sintética**, API y Vault: create → GET → PATCH → validate → approve → refresh → GET tras cambio de sesión; verificar control de versión, idempotencia, rechazo por autorización, rate limit, CSRF, no fuga de campos privados y errores OIDC/Trusted Sources. Evitar escrituras reales en entidad DAN-001 aprobada.
- Auditar `APP_ORIGIN`, `AIO_BACKEND_BASE_URL`, conectividad OIDC y scopes entre Preview/Production; usar **solo presencia y flags**, no valores sensibles. Cambios en Vercel deben ser coordinados y revisados.
- Comandos frontend desde rama concreta: `npm ci --no-audit --no-fund`, `npm test`, `npm run typecheck`, `npm run build`, `npm run test:http`, `npm run check:secrets`.
- Backend/knowledge: `python scripts/validate_release_safety.py`, `python scripts/check_frozen_core.py`, `python scripts/validate_core.py`, `python scripts/validate_site.py`, `python scripts/validate_entities.py`, `python scripts/build_public_rag.py --check`, `python -m rag.evaluate`, `node --test tests/entity-console.test.mjs tests/public-entity-sync.test.mjs tests/public-update-proposal.test.mjs` y `npm run build`. Instalar dependencias declaradas en workflow original.

### PR C · DAN RAG y cross-surface sync — P1
- Auditar `rag/corpus-manifest-v0.json`: explícitamente omite DAN Passport y `public-assets-v2.json`. Proponer allowlist limitada a fuentes DAN ya públicas, fuente/version/source-ref, derechos y max extract size; conservar fuentes congeladas intactas.
- Regenerar índice (no editar a mano el JSON generado). Validar exactitud de DAN/MC/AIO y consultas negativas `Danisan Cárnicos`, `Danisan Design`, músico Danisan homónimo y `Cuadros María Luisa`.
- Incluir auditoría de **source retrieved → entity resolved → claim grounded → cited source → abstention**. Ningún resultado supone reconocimiento de Google/Gemini/Meta u otros.
- Conectar revisiones aprobadas de Entity Console a un public-update PR seguro, sin exponer snapshot privado ni saltar autorización; conservar SHA de revisión y comparador del paquete público.
- No inferir `sameAs` desde menciones, perfiles parecidos o URL publicada.

### PR D · Hugging Face read-only drift bot — P1
- Usar GitHub Actions de **solo lectura** y API pública del Hub para comparar dataset id, revision SHA, fecha, estructura, `source_commit`, IDs del grafo y fuente permitida. Emitir reporte, sin subir ni borrar datos. Estructurar señales `remote_not_verified`, `schema_drift`, `missing_DAN-001`, `stale_source_sha`.
- Mantener `.github/workflows/sync-huggingface.yml` manual SHA-gated; no activar `publish_approved` ni utilizar secreto HF_TOKEN durante auditoría. Probar validación en dry-run. Revisión del viewer CastError solo con evidencia actual.
- Si se requiere publicación posterior, pedir autorización específica para dataset y commit exacto; preservar definiciones congeladas.
- No crear jobs de GPU o uso facturable para un bot que solo necesita HTTP de metadatos.

### PR E · observatorio, identidad y lanzamiento — P2
- Crear tracking separado para indexación, retrieval, resolution, grounding, citation y recommendation; registrar caso negativo y ausencia de dato como NA, no cero.
- Reconciliar `OZCU-001` (venture no incorporada vs etiqueta interna Company); definir si Twins son entidades o representaciones de MC-001; NUX tipo schema exacto. Solicitar a la fundadora definiciones antes de alterar grafo.
- Auditoría de Blogger: descripción específica por entrada, title individual, canonical editorial, fuente JSON-LD MC global no declarada como mainEntity de DAN. Respetar URL indexada.
- Versionar checklist de última verificación Google Search Console y Bing, no repetir envío si quota, IndexNow ≠ indexación, Indexing API Google no aplicable a estas páginas de identidad.
- Manual de despliegue: revisión y autorización humana → PR → CI → Preview → Production → URL live → logs → crawl → observación fechada.

## Contrato de entrega por Codex
Para cada PR devolver: objetivo, rama, commits, archivos cambiados, riesgos, tests ejecutados con conteos reales, capturas/API redacted, resultado, bloqueos, rollback exacto, y explícito `no changes to MC-001/AIO-001 core`. No marcar una prueba como hecha si solo se escribió. Mantener PRs independientes y no mezclar migraciones de ramas con cambios de canonicals.

## Prompt de inicio sugerido para Codex
«Audita AIO CODE DEOS en GitHub con alto rigor. Lee primero audits/2026-10-17/ECOSYSTEM-OFFICIAL-AUDIT.md y esta orden. Empieza exclusivamente con PR A: test de congelación MC-001/AIO-001 y reglas CI, sin modificar contenidos canónicos, Vault, producción, Blogger ni Hugging Face. Comprueba pruebas y proporciona PR sin fusionar; después proponme las tareas B–E por separado. No inventes resultados ni afirmes que un despliegue READY demuestra conexión API→Vault. Trabaja fuera de OneDrive y conserva la rama desplegada actual del frontend».
