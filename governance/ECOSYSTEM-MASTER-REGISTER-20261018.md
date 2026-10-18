# AIO CODE — Registro Maestro Oficial Interno del Ecosistema

**Registro:** REG-DEOS-ECOSYSTEM-20261018-001  
**Versión:** 1.0.0 (corte documental; no sincronización en tiempo real)  
**Fecha:** 2026-10-18 UTC, observaciones de pruebas del 17 de octubre hora Colombia  
**Naturaleza:** inventario oficial **interno** de ingeniería, identidad y continuidad. **No** es registro mercantil, certificación de seguridad, otorgamiento de derechos, acreditación de terceros ni finalización de Fase 2.  
**Producto:** **AIO CODE — Artificial Intelligence Optimization Code · Digital Entity Operating System (DEOS)**. Una metodología de investigación es un componente del DEOS, no su categoría de producto.  
**Política de fuentes:** cada estado indica prueba directa, documentación aprobada, observación reportada o pendiente. Este registro **no** sobreescribe las fuentes originales, ni autoriza despliegues.

## 1. Resultado ejecutivo y estados

| Sistema | Resultado al corte | Naturaleza de prueba |
| --- | --- | --- |
| Grafo de identidades | **6 nodos / 10 relaciones**, `entity-graph.json` v1.6 | Inspección de archivo público versionado |
| Entity Console → BFF → API → Vault | **Ciclo completo remoto comprobado** con entidad de laboratorio: crear, editar, validar, aprobar, preparar paquete privado y archivar | Capturas de operadora + seis revisiones inmutables privadas verificadas |
| Seguridad de escritura | **9 comprobaciones remotas aprobadas** en una ejecución sintética: sesión, denegación 401, alta, replay, conflicto 409, edición, conflicto por versión, no mutación por rechazo y archivado | Captura del panel + 3 revisiones de la ejecución comprobadas en Vault |
| Segunda ejecución sintética | Archivada tras tres revisiones | Inspección de Vault; no se atribuyen a esta ejecución nueve checks de captura |
| RAG público controlado | **189 pasajes, 19 fuentes, 11 afirmaciones/respuestas revisadas, 7 pasajes de DAN-001** | JSON públicos de manifest/índice/política |
| Hugging Face | Dos datasets actualizados 18/10; **paridad de seis entidades** en campos cubiertos por el auditor posterior a publicación | Ejecución #303 de sincronización y auditoría #2; no equivale a todas las entradas del Journal verificadas manualmente |
| Laboratorios Vercel | API Lab y consola OIDC en **READY** y protegidos | Metadatos de despliegue + prueba E2E particular; no certifica todas las rutas |
| Publicación automática de nuevas entidades | **No implementada / no autorizada** | `publicReleaseCandidate()` es módulo puro probado, no pipeline conectado |
| Registro de nuevas identidades canónicas | **RFC diseñado, no implementado** | Ninguna atribución de ID real por la consola validada |

**Leyenda de estado:** `verified` = verificación directa en la superficie indicada; `implemented_limited` = código o función comprobada parcialmente, faltan garantías de producción; `design_only` = especificación sin implementación operativa; `reported_unverified` = declaración/captura sin cotejo independiente suficiente; `pending` = no completado.

## 2. Registro de entidades públicas, separado del registro de expedientes privados

Fuente: [entity-graph.json](../entity-graph.json) (6 nodos, 10 relaciones).

| ID | Denominación | Tipo en grafo | Límite de interpretación |
| --- | --- | --- | --- |
| `OZCU-001` | OZCU | `Company` | Marca/venture matriz declarada; la etiqueta técnica **no prueba** constitución jurídica. Formalización legal pendiente. |
| `MC-001` | Marii Cuadros | `Person` | Identidad canónica **congelada**. No sobrescribir pasaporte, `sameAs`, `@id` ni pruebas históricas. |
| `AIO-001` | AIO CODE | `DigitalEntityOperatingSystem` | Núcleo canónico **congelado**; identidad de sistema DEOS, no OS de ordenador ni metodología como producto. |
| `NUX-001` | NUX | `DigitalCreativeEntity` | Entidad creativa; no atribuir personalidad jurídica ni clasificar automáticamente como persona real. |
| `VOID-001` | VOID MODE | `CreativeSystem` | Sistema creativo independiente de AIO CODE; su empleo editorial por otros no crea titularidad. |
| `DAN-001` | DANISAN | `Person` | Persona/profesional independiente documentada; **no propiedad, subsidiaria ni representada legalmente por AIO CODE**. Su autorización y derechos específicos se cotejan en privado antes de nuevos usos. |

**Fuera del conjunto actual:** `ENT-UUID` es un expediente privado de consola, **no** un nodo nuevo del grafo ni identificador canónico. Los laboratorios sintéticos archivados no son entidades públicas. Las representaciones/Twins de MC-001 no son automáticamente una séptima entidad. Una organización externa en preparación documental **privada** no es un cliente, aliado ni nueva entidad canónica hasta verificación y autorización.

**Ambigüedades conocidas:** #47 requiere addendum actual de seis entidades sin editar `ENTITY-MASTER-RECORD.md` congelado; `mariicuadros/marii-cuadros/README.md` todavía denomina AIO CODE “research and implementation methodology”, contrario al DEOS vigente. Preparar corrección mínima con **excepción de congelación expresamente autorizada**, no cambios silenciosos. `OZCU-001` usa `Company` en el grafo y requiere desambiguar taxonomía de empresa declarada/estatus registral.

## 3. Inventario GitHub — fuentes de verdad, no intercambiables

| Repositorio / rama | SHA observado | Visibilidad | Función / estado |
| --- | --- | --- | --- |
| [`aio-code-knowledge/main`](https://github.com/mariicuadros/aio-code-knowledge) | `a52e2a62015e81bf7bcf8e111e1d67e13de38830` | Público | Fuente canónica, API, grafo, pasaportes, RAG, validaciones, web; **rama protegida**, PR + `validate`. SHA anterior a la adición de este registro. |
| `aio-code-frontend/codex/entity-console` | `b5b721036ff1aa792422c6d041e7ef4414e7dbc9` | Privado | Rama predeterminada, no es la versión desplegada en el laboratorio OIDC. |
| `aio-code-frontend/codex/lab-oidc-20261011` | `08f0df2df2d55d863f4e30f7fc0340c5615258cc` | Privado | Rama **desplegada** de la consola segura; PR #9, pruebas sintéticas y control de sesión. |
| `aio-code-vault/main` | `ed4551f95bf445aa8e277f5e5835187099d77226` | **Privado, mantener privado** | Revisiones inmutables, evidencias y analítica; dos ejecuciones sintéticas archivadas. No copiar contenido privado a la web pública. |
| [`marii-cuadros/main`](https://github.com/mariicuadros/marii-cuadros) | `a7dcbe830098d7b1e37ea4739684577d1ea62595` | Público | README de perfil; **incongruencia terminológica DEOS vs metodología pendiente de excepción**. |

**Diferencia intencionada:** cambios fusionados en `knowledge/main` posteriores al despliegue público no implican que la web haya sido desplegada automáticamente; cada entrega tiene su propio commit de producción. En repositorios privados la equivalencia de reglas de protección con `knowledge/main` no está demostrada.

## 4. Vercel — tres proyectos principales verificados

| Proyecto / URL | Deployment READY / SHA Git | Observación y frontera |
| --- | --- | --- |
| [`aio-code`](https://aio-code.vercel.app) | `dpl_J71pqJA9SN44VS6kPwWdaMS8LDmS` · `2299c679086fb9ca4257a0d822ab46088dac65c1` | Web pública aprobada, Entity Home DAN y RAG; no asimilar SHA a HEAD actual. |
| `aio-code-api-lab` | `dpl_FVSdYCF69j27cvD5nJReaaf7A363` · `bc11317dbf102694e087f4fe3e801291a9b26399` | API de laboratorio con Vercel Authentication `all`; sus últimos cambios de GitHub aún no están desplegados aquí. |
| `aio-code-console-lab` | `dpl_BuV9MdtvPnytp6NLU8G41U168UTm` · `08f0df2df2d55d863f4e30f7fc0340c5615258cc` | Consola OIDC, SSO/Deployment Protection habilitada; panel de seguridad probado desde sesión autorizada. |

Un proyecto de Vercel experimental/legado adicional aparece en la auditoría del 17/10; **no** se incluye en el trío operativo ni se declara borrado: revisar por separado antes de desactivarlo. `READY` no certifica seguridad global. No cambiar Trusted Sources, OIDC, tokens, alias ni despliegues como parte de un registro documental.

## 5. Hugging Face, RAG y observabilidad

- [`aio-code-entities`](https://huggingface.co/datasets/mariicuadros/aio-code-entities): dataset público de identidades, metadatos de Hub actualizados 18/10. Tras publicación autorizada con SHA de fuente `bcbd84fb6da6e148d9a6f9561a80ef64d5cf57f9`, el Viewer mostró seis filas, incluido DAN-001. Auditor de paridad read-only #2: sin faltantes/diferencias en sus campos de comparación.
- [`aio-code-journal`](https://huggingface.co/datasets/mariicuadros/aio-code-journal): dataset histórico público, actualizado 18/10. Workflows publicaron el journal, pero **falta auditoría manual integral del historial/append-only**; no declarar exhaustividad verificada.
- `data-export/export-manifest.json`: **30 fuentes** controladas para exportación. `sync-huggingface.yml` mantiene gate manual por SHA/aprobación; auditoría de drift de solo lectura.
- `rag/corpus-manifest-v0.json`: **19 fuentes** aprobadas; `rag/public-index-v0.json` **189 pasajes** (7 DAN); `rag/answer-policy-v1.json` **11 respuestas revisadas** (3 DAN). Recuperación lexical con procedencia/citas; no es prueba de reconocimiento de buscadores, veracidad de claims de terceros o RAG generativo siempre exacto.
- El índice de RAG conserva una revisión de fuentes fijada al commit `bcbd84fb...`, aunque el deployment sea más reciente; ello refleja procedencia de las fuentes, no sincronización automática. Las dos secciones del master histórico que mencionan cinco están marcadas `superseded` en recuperación actual. Se conserva el documento antiguo sin reescribirlo.
- **Observatorio/AI Mode:** observación recurrente registrada en `logbook/2026-10-17-ai-mode-incident-003.md`; no causalidad demostrada entre cambios editoriales, errores web, desindexación y respuestas de terceros. Baseline de Fase 1 parcial **14/49** congelado y sin reinterpretación.
- **IndexNow/Search Console/Bing:** herramientas y observaciones documentadas por corte, no equivalencia entre envío, rastreo, indexación, recuperación, cita o recomendación.

## 6. Brain, Content, Analytics y derechos

| Capa | Estado y evidencia | Límite/pendiente |
| --- | --- | --- |
| Brain / contratos | Siete tipos de registros y esquema/vocabulario reutilizados en `brain/contracts/`, junto con registros privados del Vault. | No inventar un Brain nuevo ni tratar una plantilla como un motor de decisiones autónomo. |
| Meta / Instagram | Código de integración y snapshots privados fechados en Vault. La documentación de analytics confirma lecturas reales de cuenta/media/Insights en un corte de laboratorio. | Verificar continuidad de cron/ventanas, cobertura de las dos cuentas, reconciliación con Ledger y permisos actuales antes de declarar conector plenamente operativo. |
| YouTube / TikTok | Diseño en `phase-2/analytics/`. | No verificados como conectores automáticos operativos; aún falta alta autorizada y captura/normalización. |
| Contenido / VOID MODE | Registradores de publicaciones, medios y plan creativo estructurados en `entities/` y `phase-2/content/`. | Archivos programados no prueban publicación live ni impresiones/alcance. Registrar master, derivados, derechos y ventanas de cada contenido real. |
| Derechos y procedencia | Política `legal/RIGHTS-PROVENANCE-v1.md`, `rights-registry` de estados públicos mínimos. | Comprobar privados de ejecución/alcances para DAN y usos de imágenes; un checkbox, un enlace o una etiqueta “executed” no sustituye cotejo contractual/legal independiente. |
| OZCU / estructura comercial | Venture/empresa madre declarada que desarrolla AIO CODE. | No afirmar inscripción legal ni titularidades no documentadas. Preparación de partners/clientes y alcance comercial son decisiones separadas de la ingeniería. |
| Incorporaciones externas | Propuesta externa en PR de intake **privado y draft**, sin fusión. | No convertirla en nodo público, aliado, cliente o entidad jurídica validada hasta documentación/consentimiento y autorización expresa. |

## 7. Backlog oficial por prioridad, responsable y criterio de cierre

| Prioridad | ID | Tarea | Responsable propuesto | Criterio de aceptación / dependencia |
| --- | --- | --- | --- | --- |
| **P0** | `P0-REG-001` | Consolidar este registro maestro y fijar su fuente machine-readable | AIO CODE / gobernanza | PR documental, CI aprobado, links y SHA final; ratificación de la fundadora separada. |
| **P0** | `P0-ID-002` | Bloquear asignación/retirada arbitraria de `canonicalEntityId` en create/edit ordinario **desde el backend** | Codex, revisión fundadora | [Frontend issue #10](https://github.com/mariicuadros/aio-code-frontend/issues/10), solo PR A SIN fusionar/desplegar; preservar vinculaciones legítimas (DAN), pruebas de no mutación, CI y core freeze. |
| **P0** | `P0-DATA-003` | No liberar usos nuevos de imagen/identidad sin cotejo privado de consentimiento y derechos | Operación/rights, persona autorizada | Estado de evidencia/alcance por material reconciliado de manera privada; nada sensible en GitHub público. |
| **P1** | `P1-ID-004` | Registry privado y reserva atómica de ID canónico con revisión humana y protección ante homónimos | Codex tras P0 | PR B; unicidad global histórica/activa, CAS y denegaciones, pruebas sin IDs reales. |
| **P1** | `P1-UI-005` | Vista de solicitud/revisión/asignación privilegiada en consola OIDC | Codex tras P1-ID-004 | PR C aislado sobre rama desplegada; permisos separados, datos sintéticos. |
| **P1** | `P1-REL-006` | Conectar gate `publicReleaseCandidate()` a un publicador futuro, con autorización por entidad y revisión | Codex / fundadora | Propuesta PR y control de despliegue, sin publicación automática, sin `ENT-UUID` público; [frontend issue #7](https://github.com/mariicuadros/aio-code-frontend/issues/7). |
| **P1** | `P1-SEC-007` | CSRF remoto autenticado, permisos, logging redactado, tenant boundary/rate limit distribuido | Ingeniería seguridad | Evidencia reproducible de escenarios aún no probados; [frontend issue #6](https://github.com/mariicuadros/aio-code-frontend/issues/6). El 9/9 no sustituye esto. |
| **P1** | `P1-DOC-008` | Addendum de seis nodos + revisión de README público anacrónico | Gobernanza, aprobación fundadora | [knowledge issue #47](https://github.com/mariicuadros/aio-code-knowledge/issues/47), sin reescribir congelados; README necesita excepción documentada. |
| **P1** | `P1-HF-009` | Cotejo completo del historial de Journal, archivado append-only | Operación datos | Evidencia de revisión de filas/archivos históricos, sin sincronizar ni borrar. |
| **P2** | `P2-ANA-010` | Meta: repetir ingestas/ledger sin sobrescritura; YouTube y TikTok separados | Operación/ingeniería | Lecturas actuales autorizadas, dos ventanas verificables y reconciliación con Content ID. |
| **P2** | `P2-OBS-011` | Comparativas indexación/recuperación/resolución/grounding/cita | Observatorio | Cotejos fechados con fuentes, abstenciones, región/consulta/motor, no inferir causalidad. |
| **P2** | `P2-CONT-012` | Contenido trazable + preparación comercial | Operación editorial/comercial | Publicación confirmada o estado “preparado”, derechos, métricas definidas y evidencia por ítem. |

**Orden de ejecución:** finalizar entrega de registro (P0-REG) → abrir PR A de Codex (P0-ID) → revisar derechos específicos antes de nuevas liberaciones → PR B/C sólo después de aceptar A → publicador con autorización explícita. No volver a Fase 1 por cambios de mantenimiento.

## 8. Contratos de actualización del registro

1. La fuente humana es **este archivo**; la fotografía machine-readable vive en `governance/ECOSYSTEM-MASTER-REGISTER-20261018.json`. No son fuentes dinámicas y no deben autodeclararse al día tras merges/deploys futuros.
2. Cada cambio de estado registra `observed_on`, `evidence`, `confidence/verification`, SHA, responsabilidad y decisión. Diferenciar `proposed`, `tested_local`, `verified_remote`, `deployed`, `published` y `observed_third_party`.
3. Para cada PR nuevo: CI, diff, privacidad, core freeze, versión/branch y rollback; para Vercel exacto SHA y alias; para HF gate manual y paridad; para Observatory nunca inferir resultados externos.
4. Nada privado en este repositorio: ni expedientes, firmas, JWT, tokens, identificadores internos de clientes, contratos sin censura, imágenes reservadas o nombres de organizaciones externas en intake.
5. **Ratificación:** este es un registro documental oficial **interno aprobado por CI** cuando se fusione; la fundadora podrá ratificar formalmente sus alcances en acto aparte. No se inventa una firma ni una habilitación comercial.

## 9. Documentos de control relacionados

- [Auditoría histórica 17/10](../audits/2026-10-17/ECOSYSTEM-OFFICIAL-AUDIT.md) — corte previo; no sobrescribir.
- [Acta técnica E2E y seguridad 18/10](PHASE2-INTERNAL-OFFICIAL-TECHNICAL-RECORD-20261018.md).
- [Ambigüedades y gate de publicación](PHASE2-AMBIGUITY-AND-RELEASE-GATE-20261018.md).
- [RFC de reserva/asignación canónica](PHASE2-CANONICAL-ID-ASSIGNMENT-RFC-20261018.md).
- [Orden actual para Codex](../audits/2026-10-18/CODEX-CANONICAL-REGISTRY-WORKORDER.md).
- [Instrucciones permanentes de Codex](../AGENTS.md).
- [Bitácora de despliegues](https://github.com/mariicuadros/aio-code-knowledge/issues/7).
