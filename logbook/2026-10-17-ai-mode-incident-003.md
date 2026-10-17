# Bitácora de incidencia — 2026-10-17 — OBS-AI-DRIFT-003

**Estado:** Tercera recurrencia reportada por la fundadora; correlación temporal observada, causa técnica NO demostrada.
**Entidades afectadas declaradas:** MC-001 y AIO-001.
**Contexto:** la fundadora informa que, al aparecer errores o inconsistencias en la información web, disminuye o desaparece la primera opción de Google AI Mode y otras IA dejan de recuperar ciertas respuestas. Se registra como tercer episodio comunicado, sin reconstruir artificialmente fechas, sesiones o evidencia de las dos ocurrencias anteriores.

## Evidencia disponible en este corte
- Blogger artículo DAN-001: Bing informó indexado; detectó título excesivo y falta de meta description. Ambos metadatos fueron corregidos y comprobados por código fuente compartido por la administradora.
- Blogger página principal: el título y descripción de MC-001/AIO CODE se conservaron después del cambio de plantilla; comprobación visual por la administradora.
- Google Search Console: portada de aio-code.vercel.app indexada; DAN-001 Vercel elegible pero no indexada al momento del reporte; solicitud manual rechazada por cuota diaria; DAN-001 Blogger elegible y solicitud de indexación aceptada.
- Las capturas de Search Console y Bing NO comprueban por sí mismas el comportamiento de Google AI Mode, ni identifican la causa de un resultado variable.
- No modificar baseline de Fase 1 (14/49) ni reinterpretar medidas incompletas.

## Hipótesis que deben contrastarse por separado
1. Cambios en indexación/rastreo.
2. Variaciones de recuperación, entidad citada o selección de fuentes.
3. Cambios de sesión, región, lenguaje o versión/interfaz del producto AI Mode.
4. Desambiguación / actualización asíncrona de fuentes.
5. Error real de canonical, redirección, permisos, metadatos o JSON-LD.

## Diseño de verificación
Por cada consulta anotar: timestamp y zona horaria, literal de prompt, interfaz/modo, estado de cuenta, región si se conoce, fuente recuperada, URL citada, claim respaldado, entidad resuelta, respuesta negativa, capturas y cambio de versión. Separar indexación, retrieval, entity resolution, grounding, citation validity y recommendation. Comparar antes/después y con control sin intervención donde sea viable.

## Acción de ingeniería
- Congelar representación canónica de MC-001/AIO-001.
- Añadir gates de consistencia/anticontaminación; no reindexar por cambios triviales.
- Aceptar nuevas entidades mediante registro independiente y revisión humana.
- Registrar cada falla y reproducción en observatorio de Fase 2.
- No promover esta observación a causalidad ni afirmar que Bing/Google aplican penalización por el mero cambio de metadatos.

**Criterio de cierre:** baseline reproducible, diagnóstico de URL y cronología de crawls, cambios y respuestas, causa demostrada o hipótesis pendiente explícita.
