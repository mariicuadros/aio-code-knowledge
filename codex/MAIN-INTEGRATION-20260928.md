# Integración previa a publicación · 28-09-2026

Base pública `main`: `8edbbfb1216cba3aa49ecd238ccd92a5c2bc40c1`. Rama auditada: `15ab113ecc706625c5824f270cd72ba5897daff2` (árbol idéntico al checkout local auditado antes de las correcciones de Windows).

## Resolución de conflictos

- Se conservó de `main` `observatory/interventions/INT-AIO-001-20260927-003.json`: registra el merge `70b3f03` y el despliegue ya ocurrido. El estado `planned_publication` de la rama auditada era anterior a esos hechos.
- Se incorporaron de la rama auditada la descripción de los resultados observados de fase 1, la distinción entre pruebas de contenido y resultados registrados, el inventario de 18 activos, las relaciones `sameAs`/`subjectOf`, y las guardas de validación. Se resolvieron los conflictos de página, pasaporte, registros y rúbrica RAG conforme a esa definición más reciente.
- El índice RAG se regeneró después de integrar las fuentes aprobadas: 171 pasajes. La prueba de recuperación 21/21 no evalúa la exactitud de respuestas generadas.
- Se reprodujeron las correcciones de la auditoría independiente: UTF-8 explícito en la prueba, `SoftwareSourceCode`/`codeRepository` para el repositorio en el tema Blogger, enlace HTTPS en PageList y cifra de 171 pasajes en el cierre de fase 1.

## Comprobaciones locales

`validate_core.py`, `validate_site.py`, `validate_brain.py` (7 registros sintéticos), 31 pruebas unitarias, `build_public_rag.py --check`, `rag.evaluate`, `validate_gateway.mjs` (sin modelo), XML Blogger y parseo JSON: correctos después de la integración. La verificación externa de titularidad de todos los perfiles permanece limitada según la auditoría independiente.

Este registro documenta la integración del repositorio. No afirma que `llms.txt` ya esté desplegado ni que la corrección adicional del tema Blogger se haya aplicado al sitio alojado. Después de publicar se deben verificar ambas superficies y registrar la intervención nueva con URL, hora y commit.
