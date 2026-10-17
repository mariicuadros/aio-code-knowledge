# AIO CODE · REGISTRO OFICIAL DE AUDITORÍA DEL ECOSISTEMA
**Corte:** 2026-10-17 · **Informe:** AUD-DEOS-20261017-001 · **Estado:** Auditoría de código y configuración; publicación pendiente de revisión.

## 0. Naturaleza y límites
AIO CODE = **Digital Entity Operating System (DEOS)**. No se reclasifica como metodología. Esta auditoría revisa definiciones, coherencia, riesgos, trazabilidad y conexión operativa por capas. No constituye pentest, certificación legal, validación independiente de reconocimiento por IA ni comprobación HTTP universal. Se separa lo inspeccionado directamente en repositorios/conectores de las capturas de la titular y lo todavía no verificado.

### Regla de congelación acordada
MC-001 (Marii Cuadros) y AIO-001 (AIO CODE): conservar definiciones, `@id`, sameAs, pasaportes, páginas, campos canónicos y registros históricos hasta que fases 2 y 3 estén documentadas y exista una aprobación de liberación específica. Nuevas entidades se agregan sin reescribirlas. **La rama de esta auditoría contiene la protección propuesta; no se considera activa en main hasta que pase CI, se fusione y GitHub exija el check.** Los archivos históricos y baseline 14/49 no se reescriben.

## 1. Inventario verificado
| Capa | Origen | Corte observado |
|---|---|---|
| Fuente pública | [aio-code-knowledge](https://github.com/mariicuadros/aio-code-knowledge) | árbol main con 650 entradas, manifiesto de archivos públicos y controles CI |
| Consola | [aio-code-frontend](https://github.com/mariicuadros/aio-code-frontend) | 66 entradas en la rama default; despliegue de laboratorio desde `codex/lab-oidc-20261011` |
| Almacén privado | aio-code-vault (privado) | árbol principal con 199 entradas; expedientes y revisiones presentes; sin exponer datos privados |
| Otras fuentes | marii-cuadros | repositorio adicional pequeño, no fuente operativa de identidad |
| Hugging Face | [aio-code-entities](https://huggingface.co/datasets/mariicuadros/aio-code-entities) | dataset disponible; información de Hub actualizada 14/10 |
| Hugging Face | [aio-code-journal](https://huggingface.co/datasets/mariicuadros/aio-code-journal) | journal disponible; información de Hub actualizada 14/10 |
| Vercel | aio-code | producción READY, commit desplegado `4f90e1f6`, URL canónica aio-code.vercel.app |
| Vercel | aio-code-api-lab | protección activa; fallos históricos del 12/10 en logs de siete días |
| Vercel | aio-code-console-lab | protección activa; ninguna agrupación de errores en ventana de siete días |
| Vercel | aio-code-knowledge-codex-instagram-insights-20261003 | proyecto de prueba/legado por revisar; no modificar sin evaluación |

## 2. Diagnóstico de fuentes y semántica
| ID | Hallazgo | Gravedad / estado | Acción |
|---|---|---|---|
| E-01 | `entity-graph.json` ya incluye DAN-001, seis nodos y diez relaciones, incluyendo DAN-001→AIO-001 como modelo colaboradora. La grieta histórica de relación ausente quedó resuelta. | Resuelto | Preservar relación; no inferir agencia ni titularidad. |
| E-02 | `public-assets-v2.json` contiene DAN-001; `public-assets-v1.json` es corte histórico 28/09. | Resuelto / histórico legítimo | No actualizar v1 para forzar paridad; señalar versión vigente. |
| E-03 | `legal/rights-registry.json` declara firma reportada para DAN-001 pero versión/evidencia privada pendientes de cotejo; no declara permisos jurídicos verificados. | **ALTA / pendiente** | Cotejar acuerdo firmado v2.1, identificador interno v2.0, alcance por material, titularidad de fotos y evidencia de aceptación en Vault. No publicar firma o documento. |
| E-04 | Registro MC-001 en derechos mantiene estado `prepared_pending_signature`. | Pendiente/no tocar congelado | Distinguir de autorización DAN-001; revisar aparte tras levantamiento de congelación, sin asumir defecto por sí mismo. |
| E-05 | `entities/danisan/portfolio-registry.json` aún decía “deployment verification pending” pese a despliegue READY del 17/10. | **Corregido en esta rama** | Ahora separa READY, confirmación visual y verificación HTTP/derechos que siguen pendientes. |
| E-06 | El ID administrativo de Entity Console (`ENT-...`) NO es el ID público (`DAN-001`). La vista aprobada registra DAN-001 y revision 3 fuente; el expediente siguió a nuevas revisiones operativas. | Controlado / verificar vínculo | Mantener mapeo sin exponer IDs administrativos en páginas/JSON-LD; cotejar hash y revisión exacta con Vault antes de nuevas publicaciones. |
| E-07 | `OZCU-001` figura con `entity_type=Company` aunque los documentos lo llaman emprendimiento declarado con formalización legal pendiente. | **MEDIA / ambigüedad semántica** | Definir vocabulario `Company` interno vs `Organization` público y evitar afirmar registro mercantil; no reescribir AIO-001. |
| E-08 | NUX es `DigitalCreativeEntity` en grafo y ficha; no tiene JSON-LD incrustado en Entity Home. TWIN-MC-001 aparece en journal pero no entre seis nodos del grafo. | **MEDIA / definición pendiente** | Decidir si Twins son representaciones o entidades canónicas; escoger `CreativeWork` u otro tipo Schema.org para NUX basado en definición, nunca inventar Person. |
| E-09 | DANISAN no equivale al personaje/identidad creativa de Marii ni es propietaria de VOID MODE. | Controlado | Mantener separado uso editorial del sistema creativo y propiedad de identidad. |
| E-10 | MC-001 tiene en el repositorio una lista extensa de perfiles `sameAs`; los validadores comparan sus representaciones publicadas. Vincular perfiles declarados no verifica titularidad externa ni AI Mode. | **Correcto dentro del repositorio** | Mantener prueba de igualdad y auditoría humana eventual de URLs rotas. |

### Hallazgo crítico adicional — repositorio público de perfil `marii-cuadros`
El archivo [mariicuadros/marii-cuadros/README.md](https://github.com/mariicuadros/marii-cuadros/blob/main/README.md) aún describe AIO CODE principalmente como **research and implementation methodology** y lo vuelve a definir así en «Relationship to AIO CODE», contradiciendo la definición DEOS vigente de la fuente principal. También enumera aliases/URLs de perfiles que difieren del inventario actual, por ejemplo Medium sin el sufijo `1` y Threads `threads.net` en lugar de `threads.com`. Esta es una **incongruencia pública confirmada** que puede presentar definiciones discordantes a lectores o recuperadores; su efecto causal en AI Mode NO está demostrado.

**Severidad: P0 documental.** Debido a la congelación solicitada de MC-001/AIO-001, NO modificar ese README en esta auditoría. Preparar corrección mínima en PR separado sujeto a autorización de excepción, manteniendo nombre público, historial y canonical; confirmar URLs reales antes de alterar `sameAs`. No declarar que todos los repositorios dicen lo mismo hasta que se resuelva.

## 3. RAG, llms, robots, esquemas y búsqueda
| Superficie | Resultado | Hallazgo operativo |
|---|---|---|
| `llms.txt` | Definición vigente DEOS, límites de investigación y separación de entidades expresados | Es una señal voluntaria; no prueba que cualquier LLM la procese. No reescribir MC/AIO. |
| `robots.txt` | `Allow: /` general y bots de búsqueda identificados; sitemap declarado | Coherencia sintáctica pública. Reconfirmar respuesta HTTP e interpretación por proveedor. |
| `sitemap.xml` | AIO, MC, DAN, NUX, VOID, RAG y Checker | No equivale a indexación, pero enumera rutas correctas en fuente. |
| `entities/danisan/index.html` + JSON-LD | `ProfilePage`/Person, `#DAN-001`, 7 perfiles sameAs, tres alias, description paritaria | CI y prueba en vivo de Search Console reportaron un item ProfilePage válido; no exponer datos privados. |
| `entities/marii-cuadros/index.html` + schema | Canonical `#MC-001`, `Person` y sameAs | Congelado; asegurar no deriva hacia otros identitarios. |
| `index.html` | DEOS y `#AIO-001` definidos | Congelado; sin garantía de selección en AI Mode. |
| `entities/void-mode/index.html` | CreativeWork separado de persona/artista | Coherencia de primera parte; monitorizar conceptualización. |
| `entities/nux/index.html` | Título/description/canonical presentes, sin script JSON-LD | Considerar adición solo tras aprobación del tipo y relación con Twins. |
| `rag/corpus-manifest-v0.json` | 18 fuentes permitidas, incluye `public-assets-v1.json`; omite Passport DAN-001, JSON-LD DAN-001 y v2 | **ALTA / brecha real**: el corpus de recuperación no incorpora automáticamente el contenido vigente de DAN-001. Añadir fuentes revisadas en una rama nueva, regenerar índice y pasar regresión de grounding / abstención. |
| `rag/answer-policy-v1.json` | Respuestas finitas auditadas a MC/AIO/NUX/VOID/OZCU; ninguna específica DAN | **MEDIA / límite explícito**, no fallo de motor: decidir claims DAN autorizados antes de extender respuestas. |
| `rag/public-index-v0.json` | Índice generado con SHA de fuentes; CI ejecuta `build_public_rag.py --check` | Actualidad verificada solo para el conjunto de fuentes permitido. No equivale a cobertura de DAN ni a búsquedas de terceros. |
| `scripts/submit_indexnow.mjs` | Herramienta IndexNow ya implementada, allowlist por host y modo dry-run; requiere verificación de key | La antigua grieta “IndexNow ausente” es obsoleta. **No** afirmar que un envío fue realizado o indexado. |

## 4. Google/Bing/Blogger y evidencia externa
- Capturas del 17/10: página principal de Vercel indexada en Google; DAN-001 Vercel elegible, pendiente de indexación, solicitud rechazada por cuota; Blogger DAN-001 elegible, solicitud aceptada; Bing informó artículo Blogger indexado.
- Bing detectó título largo y ausencia de metadescripción en Blogger. La administradora corrigió plantilla y descripción: el código fuente mostró título breve `DANISAN | Modelo y creadora digital`, descripción específica y canonical del propio artículo. Bing debe re-rastrear para actualizar diagnósticos.
- La plantilla Blogger tiene un bloque JSON-LD Person MC-001 global. Revisar su semántica en páginas de otras personas para evitar que MC-001 se interprete como entidad principal de todas ellas. No sustituirlo ciegamente por DAN-001 ni añadir Person duplicados.
- El canonical del artículo de Blogger debe permanecer en su permalink editorial; la entidad Person se identifica en Vercel por `#DAN-001`. Ambos enlaces pueden coexistir sin ser URLs duplicadas del mismo artículo.
- **Incidente OBS-AI-DRIFT-003**: tercera recurrencia reportada por la titular de pérdida de primera respuesta AI Mode cerca de inconsistencias web. Es evidencia observacional de correlación temporal, no causalidad probada, penalización ni alteración confirmada del índice. Bitácora separada preserva metodología de reproducción.

## 5. GitHub, backend, frontend, Vault y Vercel
1. **Divergencia de ramas:** `aio-code-frontend` tiene default `codex/entity-console` en commit `064951e5`, pero el laboratorio Vercel usa `codex/lab-oidc-20261011` commit `11782241` con PR #2. No conectar nuevas publicaciones automáticas a la default desactualizada. Preparar rama limpia/PR de consolidación y probar en laboratorio.
2. **PR obsoleto:** #37 contenía JSON-LD anterior y quedó cerrado sin merge en la auditoría; #38 ya fusionó la representación vigente. PR #25 sigue abierto sobre el Ledger/Meta; no mezclarlo con despliegues de entidades sin revisión.
3. **Congelación insuficiente antes de esta rama:** GitHub permite cambios si el CI no es obligatorio. Se añadió `governance/frozen-core-baseline-20261017.json`, `scripts/check_frozen_core.py` y llamadas al gate en CI y pre-publicación HF. Hasta fusionar esta rama y exigir el check mediante Settings→Rules / branch protection, es un control propuesto, NO bloqueo efectivo.
4. **Vault:** la estructura privada contiene expedientes con revisiones; la consola mostró 2 entidades y paquete DAN pendiente de despliegue y previamente aprobado. Esto acredita lectura/aplicación en ese momento, no equivale a haber probado permisos de escritura, recuperación ante fallos y concordancia de los documentos firmados.
5. **Backend/API:** `aio-code-api-lab` tiene protección. Los agregados de errores de siete días contienen incidencias del 12/10 (`TypeError`, diagnóstico de formato y rutas). No hay fallos recientes del mismo tipo observados en este corte; realizar prueba autenticada y prueba negativa de identidad cruzada antes de pasar a SaaS.
6. **Frontend:** Cookie HTTP-only y SameSite strict, verificación de origin, limite de body, validación de token de sesión y secret handling presentes en código. Hay rate limiting de proceso (memoria); no presentarlo como defensa distribuida completa. Revisar sesión, CSRF, Trusted Sources/OIDC y pruebas multiinstancia.
7. **Producción:** Vercel confirmó READY en commit `4f90e1f6`; GitHub main ha avanzado con documentación de auditoría/bitácora después de ese despliegue. `vercel.json` tiene `git.deploymentEnabled=false`: manual release deliberado, no fallo de integración.
8. **Seguridad de repos:** Vault es privado, **no** un gestor de contraseñas. No mover contratos/identificaciones, tokens o pruebas sensibles al repo público. Actualizar RAG/HF únicamente con extractos aprobados. Revisión de exposición histórica y de permisos pendiente.
9. **Protección de ramas:** conexión GitHub no tiene acceso administrativo para consultar la regla main (403). No se puede afirmar si ya hay ruleset efectivo. Comprobar manualmente su estado en Settings, exigir CI obligatorio, PR y no-bypass.
10. **Diferencia fuente/despliegue:** sincronizar repositorio, commit de release, HF dataset y blog con una matriz de versiones, no con la premisa de que toda fuente tiene que ser byte-a-byte idéntica.

## 6. Hugging Face: estado y bot
- `aio-code-entities` y `aio-code-journal` existen y muestran última modificación 14/10 en la consulta del Hub. Los cambios de DAN-001 de 17/10 en GitHub aún **no están verificados** en esas publicaciones de Hugging Face.
- `.github/workflows/sync-huggingface.yml` ya exige `workflow_dispatch`, SHA completo, main, `publish_approved=true` y validación previa. No se activa por push/merge: diseño deliberado. La exportación incluye 26 fuentes en `data-export/export-manifest.json`.
- La búsqueda pública indexada muestra fragmentos/capturas antiguas en que HF describe AIO como proyecto metodológico; el README actualizado del Hub ya define DEOS. No confundir documentos históricos con definición vigente.
- **BOT recomendado:** GitHub Action **solo lectura** (workflow_dispatch o programación semanal posterior a revisión) que compare datos aprobados de GitHub con fecha/revisión/archivos publicados en Hugging Face; alerta por `dataset_missing`, `source_sha_unknown`, `schema_mismatch`, `content_drift`. No publica, no edita MC/AIO, no lee Vault, no depende de sesiones.
- Una eventual **publicación a HF** debe seguir pasando por workflow de aprobación y token mínimo o Trusted Publisher/OIDC configurado conforme a la documentación de HF; la actual conexión HF reporta permisos de lectura, no autorización para escribir dataset.
- La vista pública del dataset puede mostrar errores de casting en resultados de búsqueda de fechas anteriores. Reproducir con versión actual del viewer antes de declararlo un fallo vigente; contrastar filas exportadas y esquema.
- Este corte inspeccionó metadatos y tarjetas, **no descargó una copia íntegra y verificó cada fila remota**: la herramienta conectada no expuso una lectura de archivos arbitrarios. No declarar paridad remota confirmada.

## 7. Hallazgos adicionales de higiene y estructura
- Mantener histórica `public-assets-v1` y la etiqueta de versión; v2 es catálogo expandido con DAN.
- Los directorios de medios contienen piezas fechadas para el resto de octubre; un asset en Git **no prueba** que se haya publicado en Instagram o Facebook. No mezclar `scheduled`, `file_present`, `published`, `observed`.
- Hay documentos antiguos con conteos de RAG/estados de Meta/PR que eran verdaderos en su fecha. No reescribirlos; colocar resumen vigente con enlace al corte histórico.
- Cualquier cambio a Blogger se valida en HTML realmente publicado; el respaldo versionado del tema no implica que sea el tema en vivo.
- Mantener `socials`, `sameAs`, `officialUrls` semánticamente separados: cuentas declaradas no acreditan verificación externa; fuentes citadas tampoco acreditan titularidad automática.
- Las relaciones en la consola no se infieren; nuevos `relationships` deben tener tipo permitido y `source_ref`. El grafo público ya contiene una relación DAN→AIO, mientras el expediente privado mostrado no tenía relaciones: **diferencia entre representaciones** que requiere sincronizador con revisión, no inferencia retroactiva.

## 8. Priorización para Fases 2 y 3
**P0 (antes de nuevas publicaciones masivas):**
1. Activar freeze MC/AIO en CI y branch rules con revisión; alinear frontend default con la rama desplegada.
2. Cotejar acuerdo DAN v2.1 y permisos de fotografías en Vault; separar titularidad de identidad, uso editorial y derechos sobre cada asset.
3. Ejecutar prueba E2E en laboratorio de API/Console/Vault (entidad sintética, lectura-escritura y revisión sin publicación) y registrar commit/configuración sin tokens.

**P1 (cobertura y coherencia):**
4. Incorporar DAN-001 al allowlist RAG solo con fuentes públicas revisadas; regenerar índice; añadir consultas negativas de homónimos y casos de abstención.
5. Comparar SHA/fuentes de exportación HF actual con GitHub; preparar paquete publicable para aprobación explícita, sin sincronizar automáticamente.
6. Auditar tema Blogger JSON-LD global y revisar Search Console/Bing con ventana posterior a rastreo, sin reenvíos repetidos.

**P2 (preparación de lanzamiento/entrevista):**
7. Bot read-only de drift por fuente/capa; panel de health sin secretos con última captura y frescura.
8. Definir política de Twins/NUX/VOID y de OZCU como venture no incorporada; documentar fases, pruebas de aceptación y manual de operación.
9. Protocolo de despliegue único: paquete revisado→PR aislado→tests→preview→autorización→producción→inspección→registro.

## 9. Semáforo final
- **Confirmado en fuentes:** DEOS, grafo con DAN, canonicals de cinco páginas, siete sameAs DAN, sitemap, robots, CI, READY producción, rama frontend divergente, RAG allowlist sin DAN, HF publish manual y registro de derechos con verificación privada pendiente.
- **Corregido sin tocar identidades congeladas:** PR #37 cerrado sin fusión; estado histórico incorrecto del portafolio DAN corregido en la rama de auditoría; prueba freeze y bitácora creadas en rama.
- **No confirmado:** causa de pérdidas en AI Mode; listado completo de archivos/fila actual HF; indexación efectiva DAN Google; renovación/validez jurídica de documentos; recuperación y aislamiento remoto bajo fallos; cobertura HTTP integral; ruleset branch main activo.

## 10. Evidencia técnica y rutas
- `governance/frozen-core-baseline-20261017.json` — huellas y cortes inmutables.
- `scripts/check_frozen_core.py` — bloqueo de edición accidental antes de release.
- `logbook/2026-10-17-ai-mode-incident-003.md` — tercera recurrencia como observación.
- `audits/2026-10-17/CODEX-IMPLEMENTATION-WORKORDER.md` — órdenes precisas y criterios de aceptación.
- [Github Knowledge](https://github.com/mariicuadros/aio-code-knowledge), [Frontend](https://github.com/mariicuadros/aio-code-frontend), [HF Entities](https://huggingface.co/datasets/mariicuadros/aio-code-entities), [HF Journal](https://huggingface.co/datasets/mariicuadros/aio-code-journal), [Vercel](https://aio-code.vercel.app/).

**Conclusión de ingeniería:** La base canónica no requiere reconstrucción. Las brechas prioritarias son de gobernanza de cambios, cobertura de recuperación/propagación a HF, reconciliación de autorizaciones y consolidación de laboratorio frontend/backend; no implican volver a Fase 1.
