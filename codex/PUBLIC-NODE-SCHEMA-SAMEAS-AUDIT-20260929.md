# Auditoría de schemas, `llms.txt`, sameAs y activos públicos

**Estado histórico:** esta es la foto anterior a la corrección. El inventario de 18 activos, los JSON-LD y Blogger se actualizaron después; véase `public-assets-v1.json` y `observatory/interventions/INT-AIO-001-20260928-004.json` para el estado posterior. La fecha del nombre de archivo sigue el reloj UTC del entorno, mientras la intervención ocurrió el 28 de septiembre en Bogotá.

**Fecha:** 2026-09-29  
**Rama auditada:** `codex/phase2-brain-integration-20260928`  
**Propósito:** cerrar la revisión de infraestructura pública antes de iniciar la fase de contenido.

## Resultado ejecutivo

- Los schemas principales existen y son JSON/JSON-LD válidos.
- `llms.txt` existe en esta rama y está listo para publicación, pero todavía debe verificarse su despliegue público después del próximo deploy. Su presencia local no equivale a que ya responda en `https://aio-code.vercel.app/llms.txt`.
- El inventario de 18 activos **no está propagado de forma uniforme** a todos los registros, schemas y JSON-LD.
- `sameAs` está incompleto en varios documentos. No debe rellenarse mecánicamente con los 18 activos: `sameAs` afirma que dos URLs representan exactamente la misma entidad. Repositorios, playlists, canales editoriales e infraestructura deben usar propiedades de relación apropiadas cuando no sean identificadores de la entidad.
- Blogger contiene varios enlaces de red, pero no tiene todavía un inventario canónico completo ni una explicación comercial coherente para humanos.

## Inventario canónico de 18 activos solicitado

Se interpreta “nuestros repositorios” como dos activos separados: GitHub y Hugging Face.

| # | Activo | Estado local observado | Tratamiento recomendado |
|---:|---|---|---|
| 1 | Bilibili | URL confirmada en `MC-001`/`AIO-001` | Registro de plataforma; `sameAs` solo si la identidad está confirmada |
| 2 | YouTube | Canal enlazado en `llms.txt` y Blogger; registro MC pendiente de URL/estado | Plataforma; verificar URL y oficialidad |
| 3 | Instagram | MC y AIO tienen registros; JSON-LD MC contiene Instagram | `sameAs` cuando corresponda a la entidad exacta |
| 4 | Facebook | No aparece en los JSON/JSON-LD auditados | No inventar URL; añadir tras verificar |
| 5 | Threads | No aparece en los JSON/JSON-LD auditados | No inventar URL; añadir tras verificar |
| 6 | X | No aparece en los JSON/JSON-LD auditados | No inventar URL; añadir tras verificar |
| 7 | Bluesky | No aparece en los JSON/JSON-LD auditados | No inventar URL; añadir tras verificar |
| 8 | TikTok | MC/AIO tienen registro pendiente de verificación, sin URL canónica | Verificar antes de promover a activo |
| 9 | Reddit | No aparece en los JSON/JSON-LD auditados | Canal editorial; verificar URL |
| 10 | Quora | No aparece en los JSON/JSON-LD auditados | Canal editorial; verificar URL |
| 11 | Medium | MC tiene registro pendiente de verificación | Canal editorial; verificar URL |
| 12 | Substack | MC tiene registro pendiente de verificación | Canal editorial; verificar URL |
| 13 | Blogger | Registrado para MC/AIO y usado como editorial home | `url`/`subjectOf`; `sameAs` solo para el blog que identifica a la entidad |
| 14 | Vercel / Entity Home | Presente como fuente canónica y `url` de la entidad | `url`, `mainEntityOfPage` o fuente canónica; no tratar como red social |
| 15 | Spotify | MC tiene registro pendiente; las playlists son objetos de contenido | `subjectOf`/`hasPart`/enlaces editoriales, no `sameAs` de la persona |
| 16 | Pinterest | MC tiene registro pendiente, sin URL | Verificar antes de publicar |
| 17 | Repositorio GitHub | URLs confirmadas en schemas y `llms.txt` | `codeRepository`/`subjectOf`; `sameAs` solo si el perfil es identidad |
| 18 | Repositorio/dataset Hugging Face | URLs confirmadas en schemas y `llms.txt` | `dataset`/`subjectOf`; no asumir que todo dataset es `sameAs` de la persona |

## Cobertura actual comprobada

### Schemas y JSON-LD

- `schemas/person-schema.json`: GitHub, Hugging Face y Blogger para MC; GitHub, Hugging Face y Blogger para AIO.
- `entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld`: solo Instagram en `sameAs`.
- `entities/marii-cuadros/index.html`: JSON-LD publicado con cobertura parcial.
- `social-entity-map.json`: Bilibili e Instagram con registros activos; no funciona aún como inventario completo de los 18.
- `entity/content/MC-001/platforms.json`: lista 16 plataformas, pero varias están `to_verify` y sin URL.
- `entity/content/AIO-001/platforms.json`: solo 7 plataformas; varias están `to_verify` y sin URL.

### Blogger

La plantilla ya muestra enlaces a Entity Home/Vercel, GitHub, Instagram, X, YouTube, Medium, Substack, Quora, Reddit, Threads, TikTok, Facebook y Bluesky, además de playlists de Spotify. En la revisión visible no aparecieron Bilibili ni Pinterest y no existe un bloque de datos canónico que declare los 18 activos con estado de verificación.

### `llms.txt`

El archivo local ya define AIO CODE como **Digital Entity Operating System**, separa metodología interna de entidad pública, enlaza Entity Home, registros, repositorio, RAG, checker y Blogger, y preserva los límites de evidencia. Falta publicar/verificar el archivo en Vercel.

## Regla de integridad

No se deben fabricar perfiles, promover estados `to_verify` a `official`, ni declarar que una IA reconoció una entidad solo porque existe un enlace. El registro de plataformas, los schemas, Blogger y `llms.txt` deben compartir un inventario derivado de una única fuente canónica y conservar el estado `confirmed`, `to_verify` o `unconfirmed`.
