# Auditoría del candidato Phase 2 — 2026-10-09

## Alcance y preservación

Repositorio: `mariicuadros/aio-code-knowledge`. Copia local original en
`C:\Users\user\Documents\aio-code-knowledge`, HEAD `7a3439a6b16ac953099c4e9778d651566b323928`.
El inventario Git de la copia inicial no presenta cambios pendientes. Se respaldaron
el árbol completo y `.git` antes de integrar. El original no se ha escrito.
La rama de revisión parte de `main` remoto `53a36676e7b24ddd7fe472936c37ff1221a05711`.

Se compararon 417 rutas mediante SHA-256 entre local, main y ZIP (excluidos
`.git`, `node_modules` y `__pycache__` del inventario de comparación):
371 coinciden entre main y paquete, 24 difieren, 10 existen solo en el paquete
y 12 solo en main/local. No se reemplazó el repositorio con el ZIP. Se revisaron
los diffs de los 11 archivos del manifiesto antes de copiarlos a la rama aislada.
Los 19 archivos distintos que no figuran en el manifiesto conservan la versión
de main. No se incorporaron los bytecodes ni los endpoints adicionales del ZIP.

Fuera del manifiesto se actualiza únicamente el índice RAG derivado, se añade
esta auditoría y una configuración Vercel que desactiva despliegues automáticos
para `codex/phase2-reviewed-audit-20261009`. No hay archivos eliminados.
No se ejecuta despliegue, merge ni sincronización Hugging Face.

## Conflicto resuelto: Bilibili y sameAs

El candidato quitaba Bilibili del HTML de MC-001, mientras que
`schemas/person-schema.json`, el JSON-LD de MC-001 y `public-assets-v1.json`
lo conservan como identidad de MC-001. Esto provocó un fallo reproducible de
`scripts/validate_site.py`. Se preserva la relación existente de MC-001;
la asociación editorial con AIO-001 no se convierte en sameAs de AIO-001.
La prueba del paquete se adapta para comprobar la igualdad entre las tres
representaciones de MC-001 y la exclusión de Bilibili de AIO-001.
Esto preserva una declaración de primera parte, no verifica titularidad real.

El único PR abierto encontrado durante la auditoría fue #10, sobre Instagram
Insights. Sus archivos no se incorporan aquí. No se detectó solapamiento directo
con este cambio de identidad; su autorización y comportamiento remoto siguen
pendientes de validación independiente.

## Identidad y evidencia

- AIO-001 conserva `DigitalEntityOperatingSystem`; JSON-LD público conserva
  `CreativeWork` y la categoría DEOS, coherente con una arquitectura documentada.
  No se convierte en `SoftwareApplication` ni se afirma que sea un sistema operativo informático.
- MC-001 conserva `Person`; NUX-001 y VOID-001 son entidades distintas.
- OZCU-001 conserva el tipo interno `Company` como identidad de empresa/venture
  declarada. La nueva página no afirma registro jurídico.
- Mari Chordà y Cuadros María Luisa se registran como entidades externas excluidas,
  nunca como alias ni sameAs de MC-001.
- La especificación v1 se conserva íntegra como historia, con advertencia reforzada.
  Las menciones a metodología como componente interno siguen siendo válidas.
- Las tres observaciones del 9 de octubre quedan `not_yet_replicated`.
  Las capturas citadas no están adjuntas a este paquete; no se verificó su contenido,
  la fusión de grafos, los mecanismos de ingestión ni causalidad.

## RAG y exportaciones

El índice antiguo queda obsoleto al cambiar dos fuentes aprobadas. Se reconstruye
desde el commit de integración `c2ffbdfe604b1c46b54447267fe5be88cbe185bc`,
con 173 pasajes y referencias a blobs fuente. Se conserva la lista explícita
de fuentes aprobadas: la especificación histórica, el nuevo registro de nombres
confundibles y las observaciones nuevas no entran automáticamente al corpus.
La política de desambiguación sí se recupera, pero el RAG no conoce aún los
nombres del registro separado. Añadirlos requiere revisar la allowlist y evaluar
que no refuerce las asociaciones erróneas.

Hallazgos pendientes:

1. `search` en Python y el recuperador JS no filtran `canonical_or_historical`.
   Hoy la allowlist contiene solo fuentes `canonical_current`, y los claims se
   limitan a activos. Una prueba sintética confirmó que un pasaje etiquetado
   histórico sería devuelto si se introdujera. Debe añadirse un filtro explícito
   antes de ampliar el corpus a historia; este PR no amplía esa lista.
2. La evaluación contiene 24 preguntas y puntúa recuperación de fuentes en 21.
   Las preguntas sin fuentes gold no prueban abstención. 21/21 no acredita
   exactitud de respuestas, citas ni reconocimiento externo. Los generadores
   validan la existencia de IDs citados, no el respaldo semántico de cada afirmación.
3. El exportador HF genera cinco entidades distintas desde el grafo y pasaportes,
   con AIO-001 DEOS y límites de evidencia. El manifiesto de exportación también
   incluye archivos históricos y claims completos. Sus consumidores deben respetar
   estados e historia: no todo archivo exportado es verdad actual.

## Verificación

- `npm ci --ignore-scripts --no-audit --no-fund`: correcto, 11 dependencias.
- `npm audit --omit=dev`: 0 vulnerabilidades reportadas en esta ejecución.
- `npm run check:precontent`: correcto, recuperación 21/21 y privacidad de pageviews.
- `npm run check:gateway`: correcto, recuperación 21/21 y controles disabled/unauthorized;
  sin llamada a modelo.
- `python -m rag.evaluate`: 21/21 preguntas puntuables entre 24 casos.
- `python scripts/validate_site.py`: correcto tras resolver sameAs.
- Cinco pruebas `test_phase2_identity.py`: correctas.
- Suite completa, `validate_core.py` y validación Brain: intentadas localmente;
  Windows bloquea la DLL de `rpds` requerida por `jsonschema`. No se declara éxito.
  El workflow existente de PR ya instala jsonschema y ejecuta estas comprobaciones
  en Linux. Su resultado remoto debe revisarse antes de aprobar.
- Escaneo heurístico de patrones de credenciales sobre archivos versionados:
  no sustituye una auditoría de secretos ni valida variables privadas.

### Bloqueo confirmado en CI

La ejecución Linux https://github.com/mariicuadros/aio-code-knowledge/actions/runs/37989306322
falló en `Validate canonical contracts before merge`: `validate_core.py` rechaza
`observatory/runs/GOOGLE-MC-20261009.json` porque falta `timestamp`.
Las tres observaciones nuevas tienen el mismo formato resumido y tampoco aportan
los campos completos del contrato de runs (entidad, prompt registrado, contexto,
snapshot inmutable, ventana de investigación y evaluación, entre otros).
No es un fallo de la DLL local: es una incompatibilidad real del candidato con
`observatory/observation-schema.json`. Los siguientes pasos de CI no se ejecutaron.

**Prioridad alta; bloquea integrar el PR.** Se conserva el contenido recibido para
revisión, sin fabricar hora, prompt, contexto ni evidencia. Resolver aportando
registros completos auténticos, o diseñando un contrato separado de intake para
resúmenes no replicados que no cuenten como runs de benchmark. No se debilita el
schema actual ni se excluyen silenciosamente archivos para hacer pasar CI.

## Verificaciones remotas de solo lectura

Home, ficha MC-001, robots, sitemap y RAG respondieron HTTP 200 en las URLs
canónicas consultadas. Home publicada contiene DEOS; home y ficha MC-001
no tienen aún `og:title`. Robots permite `/` y referencia el sitemap; las páginas
HTML consultadas no contienen `noindex`. Esto no prueba indexación.

Pendientes: titularidad real de cuentas, redirecciones de todos los perfiles,
Google Search Console, Bing Webmaster, conexiones Meta Page/Instagram,
autenticación de collectors, consistencia de datos privados y revisión de capturas.
La etiqueta pública de verificación Google por sí sola no acredita acceso ni
estado de la consola. No se añadieron og:image ni afirmaciones de rankings.

## Revisión y publicación

PR de revisión únicamente. Verificar CI y los límites pendientes antes de aprobar.
La rama de auditoría tiene despliegues Git desactivados mediante `git.deploymentEnabled`
según https://vercel.com/docs/project-configuration/git-configuration.
Un futuro merge a main conserva las automatizaciones existentes de main,
incluida publicación/exportación; requiere una decisión posterior del usuario.
