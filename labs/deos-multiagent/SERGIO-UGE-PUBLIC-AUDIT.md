# Sergio / Sergio Impulsa S. L. / UGE — auditoría pública separada

Observado 2026-10-22 03:13 UTC (2026-10-21 Bogotá). Solo GET de fuentes públicas autorizadas, sin credenciales ni acceso al DUE original/Vault, sin indexación o publicación. No se alimentaron modelos con estos datos. No se crean IDs. Esta auditoría no constituye verificación registral ni asesoramiento jurídico.

## Cobertura comprobada

| Superficie | Resultado | Evidencia y límite |
|---|---|---|
| Página editorial DEOS | IMPLEMENTADO: HTTP 200, referencia Sergio y UGE, canonical correcto | [Página autorizada](https://aio-code.vercel.app/colaboraciones/sergio-impulsa/); 6.547 bytes; SHA-256 `0d17ae1f072a001e03f79d4ce73492f71d6077af75f87359e2e0320a53ca3f7e`, coincide exactamente con HTML LF de main 41c0244 |
| Publicación Blogger autorizada | IMPLEMENTADO: HTTP 200, menciones y canonical correctos | [Artículo](https://mariicuadros.blogspot.com/2026/10/sergio-martin-contreras-sergio-impulsa.html); 164.758 bytes; SHA-256 observado `c36af11719529bbdb4e8d6bd7f36fd21ee45a82ac0ff3f73a04bc0995d7cae9e`; HTML dinámico, huella puede variar |
| Separación de identidades | PARCIAL: editorial y candidatos separados | `colaboraciones/registry.json`, página y [PR #77](https://github.com/mariicuadros/aio-code-knowledge/pull/77), abierto/draft/sin fusionar, HEAD a02c2c925a841625a2913e523f5d0cc8578960c0. Persona, sociedad y proyecto no son aliases equivalentes; entity_id editorial es null |
| Indexación en buscadores/IA externos | NO VERIFICADO | HTTP 200, canonical y robots no prueban crawling, indexación ni reconocimiento. No se hizo submission, IndexNow ni consultas a APIs de modelos |
| Inclusión en RAG DEOS | NO IMPLEMENTADO en snapshot revisado | `rag/corpus-manifest-v0.json`: 19 rutas allowlist, ninguna página Sergio. `rag/public-index-v0.json`: 189 pasajes y ninguna coincidencia Sergio/UGE; source_commit bcbd84fb6da6e148d9a6f9561a80ef64d5cf57f9 |
| Plan de ingestión | IMPLEMENTADO como propuesta, no ejecutado | `docs/sergio-rag-ingestion-proposal-20261021.md` pide autorización y mantiene exclusiones privadas |
| HF entities: filas principales | NO IMPLEMENTADO para Sergio/UGE | Revisión `6d74410daf3d437f1744d515b2239fc32db6d17e`: seis filas completas de data/entities.jsonl, ninguna coincidencia Sergio/UGE |
| HF journal: dos JSONL de datos | NO IMPLEMENTADO para Sergio/UGE | Revisión `9a6ba639a73ee5eb50dd2e8da59aafb8f47b17a7`: diez filas principales y seis addendum completas, ninguna coincidencia Sergio/UGE |
| HF Viewer | PARCIAL | entities is-valid: preview/viewer/search/filter/statistics=true; journal devuelve todos false. Ambos /splits enumeran default/train sin pending/failed. Esa enumeración no demuestra Viewer funcional del journal |

### Evidencia Hugging Face fijada por revisión

Se consultaron metadatos públicos del Hub para fijar SHA y después se leyeron **todas las filas de estos tres archivos**, no solo la primera página del Viewer:

| Archivo público | Filas / bytes | SHA-256 |
|---|---|---|
| [entities JSONL](https://huggingface.co/datasets/mariicuadros/aio-code-entities/resolve/6d74410daf3d437f1744d515b2239fc32db6d17e/data/entities.jsonl) | 6 / 8.738 | `7b52c36012c54881adeae0b8ba0d709fa30acaf5a6e15623e4accd565a840d92` |
| [journal JSONL](https://huggingface.co/datasets/mariicuadros/aio-code-journal/resolve/9a6ba639a73ee5eb50dd2e8da59aafb8f47b17a7/data/research-journal.jsonl) | 10 / 3.505 | `82b2d00d970c139c21344571be61fad9c249098d1ef1187dd6bdea16f2c308ec` |
| [journal addendum](https://huggingface.co/datasets/mariicuadros/aio-code-journal/resolve/9a6ba639a73ee5eb50dd2e8da59aafb8f47b17a7/data/research-journal-addendum.jsonl) | 6 / 4.559 | `0bca2593ea525eabb201e6c02cc422e40aaebaadf5375e9d3127b5b2a4e4d4c7` |

Entities declara campos canonical_name, description, entity_id, entity_type, evidence_boundary, passport_path, relationships, source_commit, source_url. Journal principal: content, date, entity_id, entity_name, evidence_level, id, title, type. Addendum añade source_commit. Esta diferencia de procedencia debe revisarse antes de nuevos exports. No se afirma equivalencia integral entre el Hub y el repositorio: faltan auditoría de manifests, artefactos auxiliares y paridad de claims por revisión. El conector HF no estaba disponible; se usaron endpoints públicos sin token. La lectura web inicial falló y se verificó por HTTP directo; no se confunde un fallo de herramienta con página inexistente.

## Dependencias y pendientes, en orden

1. Mantener delimitación persona / sociedad / proyecto. La página describe datos procedentes de documentación facilitada; una presentación registral no prueba inscripción definitiva. UGE no se debe convertir en sociedad independiente ni expandir sus siglas sin fuente autorizada. No reproducir datos privados ni números identificativos innecesarios.
2. Obtener revisión humana de los pasajes públicos exactos y su procedencia, con hash/revisión. No usar el DUE original, contratos, firmas, contactos privados ni documentos de ejecución. Revisar las diferencias entre la versión editorial y la publicación Blogger antes de tratarlas como evidencia independiente: pueden compartir origen y no son dos corroboraciones independientes por defecto.
3. RAG: solo mediante PR separado autorizado, modificar allowlist y construir snapshot, añadir casos positivos y negativos para homónimos/persona/sociedad/proyecto, mantener restricciones y aprobación de cada claim. Este PR no lo hace y no inventa un ID para desbloquearlo.
4. HF: resolver el estado no operativo del Viewer de journal; validar esquema, metadatos, provenance y paridad de todos los artefactos contra una revisión aprobada. No añadir Sergio/UGE a un export de entidades canónicas solo por existir una página editorial. Ninguna carga se realizó.
5. Indexación externa: observaciones fechadas de crawling y resultados por proveedor en trabajo autorizado posterior; ausencia de evidencia no prueba ausencia de indexación. No atribuir reconocimiento causal a la mera publicación.

## Reproducción de la auditoría pública

Leer mediante GET las dos URLs autorizadas y los tres JSONL con SHA fijada, calcular SHA-256 de bytes y contar filas JSON válidas; buscar `sergio|\buge\b` sin distinguir mayúsculas. Consultar `https://datasets-server.huggingface.co/is-valid?dataset=mariicuadros/aio-code-entities` y su equivalente journal, además de `/splits?dataset=...`. Estas comprobaciones son externas de solo lectura y **no forman parte de la suite sintética offline**. No se guardaron cuerpos de páginas, filas reales ni documentación privada en fixtures. Los hashes de HTML vivo y metadatos pueden variar; las revisiones HF fijadas permiten repetir los conteos.
