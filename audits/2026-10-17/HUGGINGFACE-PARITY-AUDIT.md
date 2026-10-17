# Auditoría de Hugging Face — AUD-HF-20261017-001

**Corte:** 2026-10-17 · **Estado:** read-only parity inspection and audit workflow prepared; dataset publication NOT authorized or executed.

## Inventario
- Cuenta HF conectada: `mariicuadros`, OAuth read scopes. El conector no tiene acceso de escritura a repositorios; se usó para ficha/metadatos, no para publicar.
- Dataset `mariicuadros/aio-code-entities`: actualizado según ficha HF el 14/10; `Dataset Viewer` mostró **5 filas**, IDs OZCU-001, MC-001, AIO-001, NUX-001 y VOID-001; source_commit `7b3ca3d173ef6dfe2d9f7941d7eee4f3f144ea9d`. Su definición actual incluye AIO CODE como DEOS; registro de fuentes es de primera parte.
- GitHub `main` el 17/10 contiene **6 nodos canónicos** en `entity-graph.json`: esos cinco y DAN-001. El pasaporte `entity/ENTITY-PASSPORT-DANISAN.md` existe y fue publicado/revisado bajo el flujo de identidad. **DAN-001 falta en la tabla pública actual de HF.**
- Dataset `mariicuadros/aio-code-journal`: actualizado 14/10 según ficha HF. Fuente de consulta pública previa mostraba 10 filas históricas AIO-JOURNAL-001..010; la tarjeta actual declara definición DEOS (13/10). Los addenda AIO-JOURNAL-011..016 están en GitHub; **la presencia remota de addendum y correspondencia fila-a-fila necesitan la auditoría remota del workflow antes de declararse confirmadas**.
- Workflow `.github/workflows/sync-huggingface.yml` es manual; `publish_approved=false` valida/genera artefacto sin escribir. `publish_approved=true` se habilitará solo con una autorización por SHA exacto. No corre al hacer push, merge o desplegar Vercel.
- `data-export/export-manifest.json` versión 1.4, actualizado 13/10, enumera 26 fuentes. **NO enumera pasaporte DAN-001 ni su platform registry**, aunque el script `scripts/build_hf_entities.py` los lee indirectamente desde el grafo para construir DAN. Existe una grieta de provenance: la exportación de filas podría introducir datos de fuentes que no se incluyen en los source-artifacts aprobados. Se recomienda PR de lista de fuentes (solo DAN y material público autorizado) antes de publicar.
- `scripts/prepare_hf_journal_card.py` utiliza `RELEASE_DATE = "2026-10-13"`. Una publicación futura seguiría mostrando una fecha de definición del 13/10 incluso si se hace otro día. No atribuir esa fecha a la fecha de sincronización efectiva. Corregir etiqueta de corte/release en PR separado sin reescribir los registros históricos.
- El visualizador público de `aio-code-entities` mostró cinco filas legibles en la inspección más reciente. Hay resultados web anteriores que mostraron CastError; **el fallo histórico no se considera actual** sin reproducirlo.
- El número de descargas HF es actividad de consumo técnico, no medición de cita o reconocimiento por LLMs.

## Control creado
- `scripts/audit_hf_remote_readonly.py`: compara IDs, contenido canónico, campos derivados y `source_commit` entre grafo aprobado y tabla pública HF usando endpoints sin credenciales; lista archivos esperados del journal por API.
- `.github/workflows/audit-huggingface-readonly.yml`: activación manual (`workflow_dispatch`), check de congelación MC/AIO, lectura de datos públicos y artefacto de informe (14 días). Sin `HF_TOKEN`, operaciones de escritura, jobs de GPU ni modificación de repos.
- `tests/test_hf_readonly_audit.py`: pruebas de diferencias, duplicados, salida sin publicación y registro de límites.
- **El auditor no publica nada**. Si HF falla o su API no responde, el resultado es `unverifiable`, no una declaración de paridad.

## Recomendaciones operativas
1. Verificar CI del PR de auditoría e incorporar solamente el bot de lectura.
2. Ejecutar `Actions → Audit Hugging Face data parity (read only) → Run workflow → main` y descargar `hf-readonly-audit-<sha>`.
3. Crear PR aislado de export-manifest para DAN-001; cotejar consentimientos/alcance de medios y conservar MC/AIO congeladas; generar vista previa del paquete sin `publish_approved`.
4. Corregir semántica de fecha/card del diario y comprobar que source-artifacts realmente contengan cada pasaporte que origina una fila.
5. Presentar al operador la diferencia exacta, commit de GitHub aprobado, y datasets afectados. Solo entonces pedir autorización **explícita** para publicar ambos datasets con `publish_approved=true`.
6. Confirmar 6 filas + DAN en visor, source_commit actualizado, fuente de cada fila y registros del journal tras cualquier publicación; documentar observación sin afirmar actualización de terceros.

**Límites:** lectura de metadatos HF + tabla pública indexada, y revisión de fuentes GitHub. El workflow manual aportará cotejo remoto adicional en una ejecución posterior; no se han descargado/validado la totalidad de los archivos HF en este corte.
