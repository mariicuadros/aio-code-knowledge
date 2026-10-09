# Phase 2 — correcciones técnicas finales del PR #13

Repositorio: `mariicuadros/aio-code-knowledge`.
Rama única de publicación: `codex/phase2-reviewed-audit-20261009`.
Definición canónica preservada: AIO CODE es un Digital Entity Operating System.

## Errores encontrados y correcciones

1. **CI bloqueado por observaciones incompletas en Runs.** Se trasladan los tres
   JSON del 9 de octubre a `observatory/intake/`, sin cambiar sus bytes ni añadir
   timestamps, capturas, contexto, sesiones o evaluaciones. Cada uno conserva
   `not_yet_replicated`; pruebas SHA-256 fijan el contenido original. Intake tiene
   schema y validador propios en CI. El schema de Runs permanece intacto.
2. **Etiquetas temporales ignoradas por recuperadores.** Python y JavaScript
   filtran `canonical_current` por defecto. `historical` y `superseded` solo se
   recuperan en modo histórico explícito. El valor ambiguo
   `canonical_or_historical`, `unknown`, valores ausentes o no reconocidos se
   excluyen. El campo de metadatos se llama `canonical_or_historical`; su nombre
   no se interpreta como permiso para usar historia como identidad vigente.
3. **Citas existentes aceptaban afirmaciones sin soporte.** Browser, CLI y endpoint
   separan candidatos léxicos de respuestas. La política finita contiene siete
   afirmaciones de primera parte, consultas revisadas y su fuente/sección exacta.
   Una consulta fuera de esa cobertura se abstiene, aunque encuentre candidatos.
   La generación opcional debe devolver exactamente la afirmación revisada y
   citar su pasaje vigente. Se rechazan afirmaciones añadidas, confusiones de
   personas, hardware genérico, atribuciones de perfiles, relaciones incorrectas
   y documentos históricos presentados como actuales.
4. **Identidad y términos residuales.** Se conserva MC-001 Person, AIO-001 DEOS,
   OZCU-001 Company como venture declarado, VOID-001 CreativeSystem y NUX-001
   DigitalCreativeEntity. NUX se describe como entidad narrativa sin cambiar su
   tipo interno. El pasaporte de VOID MODE referencia el DEOS, en lugar de llamar
   metodología a AIO CODE. OZCU no se declara jurídicamente constituida.
5. **Frescura del índice insuficiente.** El verificador ahora compara contenido y
   metadatos completos de cada pasaje, además de blobs y cantidad. Comprueba la
   coherencia de commit y URL de cita. Cambios de texto o etiquetas con el mismo
   número de pasajes ya no pasan inadvertidos.

## Coherencia de entidades

`scripts/validate_entities.py` verifica el conjunto de cinco IDs, nombres y tipos,
pasaportes, HTML y JSON-LD, referencias de creadora, sameAs, inventario de activos,
mapa social, corpus y las cinco filas de exportación HF generadas localmente.
Bilibili mantiene su relación documentada con MC-001, sin convertirse en sameAs
de AIO-001. Las personas confundibles no aparecen como alias o sameAs de MC-001.
Intake permanece fuera de los corpus y exportaciones controladas.

Esto valida coherencia interna. No verifica titularidad real de cuentas, estado
de Google/Bing, conexiones Meta, ni registro jurídico de OZCU.

## Pruebas y cobertura

- Recuperación léxica congelada: 24 preguntas; 21 con fuentes gold puntuables.
  Resultado local: **21/21**. Las preguntas y el denominador originales no cambian.
- Respuestas/abstención: **27/27** casos locales, siete respuestas revisadas y
  veinte consultas que deben abstenerse. Incluyen María Luisa Cuadros, Cuadros
  María Luisa, Mari Chordà, AIO genérico, ausencia de soporte, historia, perfiles
  y relaciones entre entidades.
- Borradores adversarios: **9/9** rechazados pese a citar IDs existentes.
- Python RAG safety: seis pruebas locales correctas, incluyendo mutaciones de
  fuente, sección, texto, estado, visibilidad, cita y proveedor simulado.
- Identidad/desambiguación: cinco pruebas locales correctas.
- Node safety: filtros, 27 consultas, nueve borradores y adaptadores simulados
  correctos. No se llamó a un modelo remoto.
- Site, Entity coherence, precontent, gateway y frescura del índice: correctos localmente.
- Suite completa, Core, Brain e Intake: se ejecutan en CI Linux; el intento local
  sigue limitado por el bloqueo de Windows a la DLL `rpds` de `jsonschema`.
  Este bloqueo no se omite ni se presenta como éxito local.

## Estado de CI

El fallo inicial de Runs queda documentado en la auditoría histórica. El workflow
del PR ejecuta Core, Intake, Brain, suite completa, Site, Entities, evaluación
RAG, frescura del índice, gateway, precontent y Node safety. El estado del commit
publicado debe confirmarse mediante GitHub Actions, no por inferencia a partir
de resultados locales. El informe de entrega y el cuerpo del PR registran el
enlace y conclusión de la ejecución observada.

## Limitaciones y riesgos para producción

La abstención implementada es una política conservadora de afirmaciones finitas,
no un motor de entailment semántico general. Puede abstenerse ante preguntas
válidas que no tengan una variante revisada. Los textos permanecen en el idioma
de la fuente. Las respuestas válidas usan un router de fuente/sección independiente
del ranking léxico; sus resultados no se contabilizan como mejora del recall.

No se evaluaron modelos remotos, calidad de paráfrasis, reconocimiento externo,
rankings ni causalidad. Los adaptadores se probaron con proveedores simulados.
Las capturas referenciadas por Intake siguen ausentes; no se certifica su contenido.
HF conserva fuentes históricas y claims completos en su exportación controlada;
los consumidores deben respetar estados y límites. No se sincronizó ningún dataset.

Siguen pendientes para producción: permisos/propiedad de perfiles, Search Console
y Bing Webmaster, conexiones Meta/Instagram, autenticación de collectors, límites
y costos de proveedor, y revisión editorial de nuevas afirmaciones admitidas.
No se modificaron secretos, variables privadas ni credenciales.

## Decisiones que requieren autorización de la fundadora

- Fusionar el PR y autorizar una publicación posterior en Vercel/Hugging Face.
- Ampliar el catálogo de respuestas revisadas o autorizar un modelo remoto con costos.
- Aportar capturas/contexto auténticos y aprobar la promoción de Intake a Runs.
- Autorizar verificaciones autenticadas de plataformas y consolas.

La rama del PR conserva desactivados los despliegues Git automáticos. No se
ejecuta merge, despliegue ni sincronización HF. Un futuro merge a main puede
activar sus automatizaciones existentes; esta auditoría no lo autoriza.

## Recomendación técnica

El cambio está preparado para evaluación de integración una vez confirmada la
ejecución completa de CI del commit publicado. No implica autorización para
desplegar ni declarar validación de un modelo. Si CI falla, debe corregirse la
causa antes de recomendar integrar. El PR permanece en borrador para revisión
de la fundadora.

## Inventario de archivos

El inventario adjunto a la entrega compara este pase con el head anterior del
PR (`c6f436657688a9f7857811e50da12f9e706b417c`). Las tres bajas en `runs/`
son traslados idénticos a `intake/`, no eliminación de evidencia.
