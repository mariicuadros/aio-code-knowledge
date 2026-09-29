# Prompt listo para Codex — auditoría y corrección de nodos públicos

**Estado:** reemplazado por `codex/CODEX-REVIEW-AFTER-PUBLIC-ASSET-CORRECTION-20260928.md` después de ejecutar la corrección el 28 de septiembre de 2026 (hora de Bogotá). Conservar este texto como plan previo, no como instrucciones vigentes.

Ejecuta esta tarea sobre la rama adjunta del repositorio AIO CODE. Trabaja primero en modo auditoría y después implementa únicamente cambios seguros y verificables.

## Objetivo

Cerrar la infraestructura de descubrimiento antes de comenzar la fase de contenido:

1. validar schemas, JSON-LD y `llms.txt`;
2. consolidar los 18 activos públicos;
3. corregir `sameAs` sin afirmar relaciones semánticamente falsas;
4. reescribir Blogger para que un humano entienda qué es AIO CODE, por qué puede necesitarlo y qué se ofrece;
5. preservar toda la evidencia histórica de fase 1 y no volver a describir los resultados observados como simples suposiciones.

## Inventario obligatorio

Usa exactamente estos 18 nodos, distinguiendo su naturaleza: Bilibili, YouTube, Instagram, Facebook, Threads, X, Bluesky, TikTok, Reddit, Quora, Medium, Substack, Blogger, Vercel/Entity Home, Spotify, Pinterest, repositorio GitHub y repositorio/dataset Hugging Face.

No inventes ninguna URL. Para cada nodo registra `url`, `entity_id`, `content_role`, `official_status`, `status`, `first_verified`/`last_verified` y una nota cuando falte confirmación. Si el repositorio contiene un nombre pero no una URL, conserva `to_verify` y repórtalo.

## Reglas de schemas y `sameAs`

- Mantén `AIO-001`, `MC-001`, `NUX-001`, `VOID-001` y `OZCU-001` separados.
- Usa una fuente canónica para el inventario y deriva de ella los registros de plataforma.
- `sameAs` solo puede contener URLs que hayan sido confirmadas como identificadores de la misma entidad.
- No pongas automáticamente las 18 URLs en todos los `sameAs`: playlists de Spotify, artículos de Medium/Substack/Reddit/Quora, repositorios, dataset de Hugging Face y la infraestructura Vercel deben representarse con `subjectOf`, `hasPart`, `codeRepository`, `dataset`, `mainEntityOfPage`, `url` o enlaces editoriales según corresponda.
- Si una URL es del perfil de Marii, no la atribuyas automáticamente a AIO CODE; si es del canal AIO CODE, no la atribuyas automáticamente a MC-001.
- Deduplica URLs, conserva trailing slashes de forma consistente y valida que cada `@id`, `url`, `creator`, `about` y `sameAs` sea coherente.
- Actualiza los JSON/JSON-LD afectados, pero no borres registros históricos ni evidencias de observación.

## `llms.txt`, robots y descubrimiento

- Verifica que `llms.txt` describa AIO CODE como **Digital Entity Operating System** y que la metodología figure como componente interno/histórico, no como tipo vigente.
- Comprueba que el `llms.txt` local incluya los canonical sources, límites de evidencia, fase 1 observada y fase 2 de contenido.
- Comprueba `robots.txt` y sitemap sin bloquear crawlers de búsqueda/retrieval.
- Reporta por separado “presente en el repo” y “responde públicamente después del deploy”. No declares publicación pública sin una comprobación HTTP.

## Reescritura editorial de Blogger

Conserva la bitácora y los artículos históricos, pero reorganiza la portada y el bloque editorial con esta secuencia answer-first:

1. **Qué es AIO CODE:** “AIO CODE es un Digital Entity Operating System para construir, organizar y observar la presencia digital de una persona, artista, proyecto o marca en entornos humanos y de IA. Su metodología de investigación es un componente interno del sistema.”
2. **El problema:** la identidad está repartida entre redes, publicaciones, repositorios y sitios; las fuentes pueden estar desactualizadas o describir lo mismo con términos distintos; por eso una IA puede encontrar una parte y omitir otra.
3. **Qué resuelve:** conecta identidad canónica, relaciones, evidencia, procedencia, contenido y observación; hace legible el proyecto para humanos y sistemas de recuperación sin prometer indexación, citación o recomendación garantizadas.
4. **Qué ya se comprobó:** fase 1 contiene observaciones fechadas y resultados de identificación, descripción y citación en sesiones concretas; el 28-09-2026 quedó registrada una respuesta de Perplexity que describió AIO CODE como Digital Entity Operating System y citó Entity Home. Presenta esto como resultado observado, con su alcance y límites.
5. **Para quién:** artistas, creadores, proyectos culturales, marcas personales, equipos y empresas cuya identidad está fragmentada o es difícil de explicar.
6. **Qué se ofrece:** diagnóstico de entidad y fuentes; arquitectura de evidencia y contenido; organización de perfiles y repositorios; seguimiento de recuperación/citación/representación; informe de límites y próximos pasos.
7. **Qué no promete:** no controla modelos externos, no garantiza posiciones, no convierte una mención en autoridad ni sustituye verificación humana.
8. **Cómo encontrarlo:** un bloque claro de 18 activos, agrupado por identidad, publicación, vídeo, repositorios e infraestructura, con enlaces verificados y estado explícito.
9. **Próxima fase:** contenido público coherente, comenzando por Blogger y extendiéndose a Medium, Substack, Reddit, Quora, redes y video.

Usa lenguaje comercial claro, sobrio y comprensible. Evita “hackear”, “engañar a las IA”, “prompt seeding” como promesa, y evita llamar a todo el sistema “metodología”. Mantén una sección separada para el archivo histórico de fase 1.

## Verificación y entrega

- Ejecuta `python scripts/validate_core.py`, `python scripts/validate_site.py`, las pruebas unitarias, el evaluador RAG y los validadores JSON/JSON-LD.
- Comprueba que no haya secretos, tokens ni datos privados nuevos.
- Produce una matriz final de los 18 activos con estado y URL, lista de cada `sameAs` por entidad y lista de URLs aún pendientes de confirmación.
- Registra la intervención con fecha, alcance, archivos modificados y límites.
- No despliegues ni publiques hasta que se revise la matriz final; si se solicita deploy, verifica después `https://aio-code.vercel.app/llms.txt`, JSON-LD y sitemap.
