# OZCU — integración oficial y verificación técnica

PR existente: [#13](https://github.com/mariicuadros/aio-code-knowledge/pull/13), rama `codex/phase2-reviewed-audit-20261009`, en borrador. Alcance incremental respecto de `02911a87858e2a6ecbe24f37dbe49cf7ea87c046`; no se creó otro PR.

## Decisión y relaciones incorporadas

Por instrucción expresa de la fundadora, OZCU-001 es la empresa/venture desarrolladora oficial declarada de AIO CODE. Su identidad empresarial está oficialmente adoptada y su formalización jurídica está pendiente. La declaración no acredita constitución, registro ni certificación legal.

- `MC-001 → founder_of → OZCU-001` (REL-008).
- `OZCU-001 → develops → AIO-001` (REL-009).

Las relaciones previas de creación humana, CEO, aplicación y sistema creativo conservan su significado. AIO CODE sigue como marca pública principal y Digital Entity Operating System, con metodología interna. Se mantienen exactamente MC-001 Person, OZCU-001 Company, AIO-001 DigitalEntityOperatingSystem, VOID-001 CreativeSystem y NUX-001 DigitalCreativeEntity, de rol narrativo.

La procedencia está en `identity/OZCU-OFFICIAL-DECLARATION-2026-10-09.md`, los pasaportes y CLAIM-012 a CLAIM-014. Son declaraciones de primera parte con evidencia `observed`, sin promoción a `verified`. No se inventaron fuentes externas, cuentas, dominios ni identificadores legales de OZCU.

## Inventario incremental

Tres archivos creados:

- `identity/OZCU-OFFICIAL-DECLARATION-2026-10-09.md`
- `tests/test_ozcu_identity.py`
- `codex/OZCU-OFFICIAL-INTEGRATION-REPORT-2026-10-09.md`

Veintitrés archivos modificados:

- `AIO-CODE-SYSTEM-SPEC-v2.md`
- `ENTITY-MASTER-RECORD.md`
- `README.md`
- `brain/AIO-CODE-BRAIN-v1.md`
- `claim-ledger.json`
- `codex/PHASE2-FINAL-TECHNICAL-REPORT-2026-10-09.md`
- `data-export/README.md`
- `entities/aio-code/README.md`
- `entity-graph.json`
- `entity/ENTITY-PASSPORT-AIO-CODE.md`
- `entity/ENTITY-PASSPORT-MARII-CUADROS.md`
- `entity/ENTITY-PASSPORT-OZCU.md`
- `entity/ENTITY-PASSPORT-VOID-MODE.md`
- `governance/IP-AND-CONTENT-RECOVERY-v1.md`
- `index.html`
- `logbook/week-08.md`
- `rag/README.md`
- `rag/answer-policy-v1.json`
- `rag/public-index-v0.json`
- `rag/semantic-evaluation-v1.json`
- `schemas/person-schema.json`
- `scripts/validate_entities.py`
- `social-entity-map.json`

Cero archivos eliminados en esta integración. Se revisaron las diferencias antes de cada modificación; se conservaron copias previas en el directorio de trabajo. Los traslados previos a Observatory Intake pertenecen a la auditoría anterior y no se repitieron.

## Contradicciones y correcciones

Se sustituyó el rol vigente de reserva/alternativa corporativa en grafo, pasaportes, master record, Brain, gobernanza, documentación del sitio y exportación. El enfoque previo de marketing y optimización para artistas sigue documentado. El diario week-08 conserva su texto histórico con una advertencia de versión; el informe técnico anterior también queda marcado como histórico. Las observaciones, respuestas crudas, capturas, baseline y especificación metodológica histórica no se reescribieron.

JSON-LD mantiene AIO CODE como CreativeWork de categoría DEOS y su creadora como Person. OZCU se representa como Organization contributor con descripción explícita de desarrolladora declarada, identificador existente OZCU-001 y fundadora MC-001; no se añadieron URL, sameAs ni datos de constitución de OZCU. No se alteraron los sameAs de MC-001/AIO-001.

La primera evaluación tras cambiar las fuentes encontró una regresión léxica: RAG-Q-07 dejó de recuperar su fuente gold entre los cinco primeros resultados (20/21). Se precisó la frontera persona/sistema/empresa en el pasaporte MC-001 y se recuperó 21/21. No se cambiaron las preguntas, fuentes gold ni umbrales del benchmark congelado. Una ejecución intermedia coincidió con la actualización de metadatos y el control de fuentes detectó correctamente un archivo aprobado sin commit; la ejecución final se realizó sobre fuentes confirmadas y pasó completa.

## Pruebas y resultados verificables

| Comprobación | Resultado final |
| --- | --- |
| `python -m unittest discover -s tests -p 'test_*.py'` | 51/51, incluidos seis tests nuevos de OZCU |
| `python scripts/validate_core.py` | Pasa, contratos y referencias |
| `python scripts/validate_brain.py brain/contracts/examples.synthetic.json` | Pasa, siete registros sintéticos |
| `python scripts/validate_intake.py` | Pasa, tres observaciones preliminares conservadas |
| `python scripts/validate_site.py` | Pasa |
| `python scripts/validate_entities.py` | Pasa, cinco entidades, pasaportes, JSON-LD, sameAs, mapa social, RAG y exportación HF local |
| `python scripts/build_public_rag.py --check` | Pasa, 180 pasajes de 18 fuentes aprobadas |
| `python -m rag.evaluate` | Recuperación 21/21 casos puntuados, de 24 totales; política semántica 36/36; borradores incorrectos rechazados 12/12 |
| `npm run check:gateway` / `npm run check:precontent` | Pasan, recuperación compartida 21/21 |
| `node scripts/validate_rag_safety.mjs` | Pasa, filtros temporales y abstención de API; proveedores simulados |
| Exportación Hugging Face local | Cinco filas, identidad, tipos y relaciones coherentes; sin publicación |
| Preservación del repositorio original | 375 archivos, incluido .git, idénticos por SHA-256 al respaldo |

Los comandos de gateway y precontenido se ejecutaron localmente mediante sus scripts Node equivalentes y en CI mediante los comandos npm solicitados. La suite completa pasó localmente y en Linux; el bloqueo Windows/rpds documentado en la auditoría anterior no impidió esta ejecución final.

Commit de fuentes: `767efe76cb5eba76aade5b673cfa383c001f18ae`. El índice cita ese commit y sus blobs. Commit de código e índice validado: `cdf975c9df8a017c3e0288a6e565dbfcc669e690`. [GitHub Actions 38006653263](https://github.com/mariicuadros/aio-code-knowledge/actions/runs/38006653263) terminó `success`, con todos los pasos y 51 tests confirmados en los logs. El commit posterior que incorpora este informe se verifica separadamente y su estado se entrega en la descripción del PR y en la evidencia final de CI; no cambia las fuentes aprobadas.

## Cobertura y límites RAG

Ocho afirmaciones revisadas de primera parte, con variantes exactas normalizadas de preguntas. El catálogo cubre qué es OZCU, quién la fundó, su relación de desarrollo con AIO CODE y la diferencia entre adopción empresarial y formalización jurídica. Las preguntas sobre certificación, cuentas OZCU no verificadas y equivalencia con organizaciones de nombre similar se abstienen.

Los filtros Python y JavaScript conservan los cinco estados temporales y excluyen historia, superseded, etiquetas ambiguas y unknown de evidencia canónica vigente. El modo histórico sigue explícito y separado. Los casos mantienen la protección frente a María Luisa Cuadros/Cuadros María Luisa, Mari Chordà, AIO genérico, atribuciones sociales erróneas y relaciones invertidas entre entidades.

Recuperación documental, respuesta exacta revisada y respaldo de citas se evalúan por separado. Los 36 casos y 12 borradores no prueban generación libre ni entailment general. No se invocó un modelo remoto. Preguntas válidas fuera del catálogo pueden abstenerse; ampliar la cobertura requiere revisar fuentes y afirmaciones.

## Riesgos y decisiones antes de despliegue

Continúan sin verificar en esta tarea la titularidad externa de cuentas, consolas Google/Bing, conexiones Meta, capturas originales y resultados del sitio desplegado. No hay evidencia nueva de reconocimiento externo, causalidad, demanda comercial ni registro jurídico de OZCU. La formalización jurídica pendiente no debe transformarse en una afirmación de constitución.

La decisión de identidad oficial ya está autorizada por la fundadora. Siguen sujetos a su aprobación la revisión final de ChatGPT, integración del PR, despliegue, sincronización de datasets y cualquier futura cuenta/dominio o afirmación legal. Esta tarea no ejecutó esas acciones, ni modificó secretos o el repositorio original. La rama conserva desactivados sus despliegues Git; las automatizaciones de main no se cambiaron.

## Recomendación

La integración de OZCU está técnicamente validada y preparada para auditoría final de ChatGPT y aprobación de la fundadora, condicionada a CI correcto en el último head del PR. Mantener el PR #13 en borrador; no fusionar ni desplegar desde esta tarea. MC-001 permanece protegida: el registro de confundibles se conserva, no se agregaron alias/sameAs externos ni nodos canónicos y las pruebas de no equivalencia pasan.
