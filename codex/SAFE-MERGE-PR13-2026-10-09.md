# PR #13 — preparación de integración controlada

Repositorio: `mariicuadros/aio-code-knowledge`. Rama: `codex/phase2-reviewed-audit-20261009`. Punto de partida auditado: `e8b0e9e8e617f7a57eb20680cceac288a12602c9`. Mantener el PR en borrador hasta autorización expresa de la fundadora. Este documento prepara acciones futuras; no autoriza merge, publicación, despliegue ni cambios administrativos.

## Estado de partida y alcance

`main` observado: `53a36676e7b24ddd7fe472936c37ff1221a05711`. Es ancestro del commit auditado: el PR incluye todos sus cambios y GitHub lo informa mergeable. Volver a comprobar ambos SHA antes de integrar: un cambio posterior de main o del PR invalida la aprobación del commit anterior.

Se trabaja sobre la copia aislada del PR. El repositorio original no se modifica. No se alteran fuentes canónicas RAG, observaciones, baseline, capturas, evidencia histórica, secretos ni sameAs. OZCU conserva su adopción como empresa desarrolladora oficial declarada, fundada por Marii Cuadros, con formalización jurídica pendiente. Se mantienen las cinco entidades, los filtros históricos y la abstención semántica. El índice conserva las fuentes y el commit ya auditados; estos controles de publicación no requieren reconstruirlo.

## Cambios preparados

- `.github/workflows/sync-huggingface.yml`: elimina el evento push; acepta exclusivamente workflow_dispatch. Separa validación/preparación y publicación. Requiere main y el SHA completo aprobado; publish_approved es booleano y por defecto false. El job de publicación depende del éxito de los validadores y exige explícitamente ese valor true y coincidencia de SHA. Las credenciales HF solo se pasan a pasos del job de publicación. Se serializan los dispatches. Se elimina la petición previa de borrar entities.json del dataset remoto; no se solicita ninguna eliminación remota.
- `.github/workflows/rag-validation.yml`: conserva CI en PR/main y añade el validador de seguridad de publicación. Instala PyYAML para inspeccionar la estructura de los workflows sin ejecutar publicaciones.
- `scripts/validate_release_safety.py` y `tests/test_release_safety.py`: comprueban triggers, validadores, separación de secretos, aprobación/SHA/main, artifact de la misma ejecución, ausencia de otro publisher en los workflows del repositorio y bloqueo Git de Vercel. Prueban regresiones con push/schedule/workflow_run, aprobación omitida, SHA incorrecto y reglas Vercel que vuelvan a habilitar main.
- `vercel.json`: conserva la regla false de la rama del PR y añade main: false, sin reglas true superpuestas. Otras ramas no especificadas conservan el comportamiento por defecto de Vercel; no se afirma un bloqueo global.
- `data-export/README.md` y `data-export/export-manifest.json`: documentan la política manual sin cambiar la lista de fuentes ni los destinos.
- `codex/github-repository-description.json`: payload propuesto que modifica únicamente description. No se ha aplicado.
- Este documento: controles previos, acciones publicadoras y verificaciones posteriores.

## Hugging Face: operación separada

No se ejecutó ni se debe ejecutar este workflow durante esta preparación. La versión nueva debe estar en la rama por defecto para utilizar workflow_dispatch. Después de un merge autorizado, un operador con permiso de escritura puede seleccionar Actions → Sync AIO CODE to Hugging Face → Run workflow, rama main, y copiar su SHA completo a approved_commit. [Documentación oficial de ejecución manual](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).

Con publish_approved=false solo se validan contratos, entidades, sitio, frescura RAG, pruebas y evaluación; se prepara una exportación como artifact temporal de GitHub, retenido siete días. No se instala/autentica el cliente HF ni se accede a los datasets en ese job. El artifact pertenece a esa ejecución y SHA.

Solo después de otra autorización expresa de la fundadora para publicar ese SHA se podrá iniciar una nueva ejecución en main con publish_approved=true. El job publish podrá autenticar, comprobar acceso y asegurar la existencia de `mariicuadros/aio-code-entities`, subir su exportación, leer la tarjeta de `mariicuadros/aio-code-journal` para conservar su historial y subir la tarjeta/addendum preparados. Estas escrituras son publicaciones reales; ambas forman parte de la misma aprobación. No son una transacción atómica: si falla el journal después del dataset, debe documentarse la publicación parcial antes de reintentar.

El booleano expresa una confirmación manual del operador; no verifica por sí mismo que la fundadora haya autorizado. No se configuró un Environment de GitHub ni se afirma que existan required reviewers. Si se requiere una aprobación técnica de dos personas, un administrador deberá configurar ese control por separado, con autorización, antes de permitir el dispatch publicador. No se movieron ni modificaron secretos.

En el repositorio se inspeccionaron todos los archivos de .github/workflows: rag-validation.yml ejecuta comprobaciones y no contiene pasos publicadores; sync-huggingface.yml es el único publisher detectado y queda manual. También se buscaron comandos upload_folder/push_to_hub/hf upload/vercel deploy en los scripts y la configuración. Esta comprobación no inventaría ni descarta automatizaciones de otros repositorios, integraciones externas, operadores con CLI o jobs de cuentas remotas.

Mientras este PR no esté integrado, la versión antigua de main sigue teniendo push → HF. No hacer otros pushes a main durante la ventana de integración. Al integrar esta versión, el archivo resultante deja de declarar push y ese nuevo push no solicita la sincronización. No reejecutar runs históricos del workflow antiguo: utilizan su definición anterior y pueden publicar sin los controles nuevos. El dispatch publicador y las llamadas HF no fueron probados en vivo para respetar la prohibición de sincronizar.

## Vercel: comprobación y pausa previa

El bloqueo previo del PR no bloqueaba main: Vercel habilita por defecto las ramas no especificadas. La regla preparada main:false debe formar parte del commit resultante de la integración. No usar autoAlias:false como sustituto de esta protección, ya que puede seguir creando deployments. Los deploy hooks, CLI, API, Redeploy y Promote son vías separadas; no deben invocarse. [Configuración Git oficial](https://vercel.com/docs/project-configuration/git-configuration).

Consulta de solo lectura al conector: proyecto `aio-code`, ID `prj_njqHUWXvNwbrqcsT5BsNMFdBkE67`, equipo `team_eiGyAyE8fgyIqE3JtOwSAIo8`. El listado filtrado por este repositorio lo identifica, pero get_project solo expone metadatos limitados; no permite certificar repositorio/production branch/root directory/hooks o una pausa Git. No se modificó ninguna configuración del proyecto. No se inspeccionaron valores de variables de entorno.

Antes de autorizar el merge, comprobar manualmente en el equipo y proyecto correctos:

1. Settings → Git → Connected Git Repository: debe ser mariicuadros/aio-code-knowledge. Registrar la conexión actual sin copiar tokens ni URLs secretas de hooks.
2. Comprobar Production Branch y Root Directory en la configuración del proyecto/entorno de producción. Confirmar que main es la rama de producción esperada y que el vercel.json editado es el que leerá ese proyecto. Revisar si hay otros proyectos conectados al mismo repositorio.
3. Inspeccionar Deploy Hooks, automatizaciones externas y cola de deployments. No llamar hooks ni cancelar/promover/redeployar nada desde esta tarea. Registrar cualquier publicación pendiente para decisión de la fundadora.
4. Para garantizar una ventana sin disparadores Git antes del merge, proponer una desconexión temporal del repositorio en Settings → Git → Connected Git Repository → Disconnect, después de registrar la conexión. **Requiere autorización explícita de la fundadora; no se ha ejecutado.** Si se opta por otro control de pausa disponible en la cuenta, comprobar su alcance real y no confundir pausa de tráfico con bloqueo de nuevos despliegues. [Instrucciones oficiales para desconectar](https://vercel.com/docs/project-configuration/git-settings#disconnect-your-git-repository).
5. Confirmar la pausa efectiva y que la integración incluirá main:false antes de continuar. Si no se puede verificar el proyecto conectado o la lectura de esa configuración, mantener el merge pendiente. La regla del archivo por sí sola no demuestra el estado efectivo de la cuenta.

Reconectar, cambiar la rama de producción o volver a habilitar Git deployments requiere una autorización posterior. No reconectar automáticamente tras el merge: comprobar si la conexión ofrecerá crear un deployment y detenerse ante esa posibilidad. Tampoco se cambian dominios, secretos, tráfico, protection settings ni la GitHub App del equipo.

## Descripción de GitHub: propuesta lista, sin aplicar

Descripción pública observada mediante GET del repositorio: “Base de conocimiento pública e investigación sobre Inteligencia Artificial, curaduría digital y la metodología AIO CODE por Marii Cuadros”. La descripción propuesta es exactamente:

> AIO CODE — Digital Entity Operating System (DEOS) developed by OZCU. Digital identity, entity resolution, evidence provenance, RAG and AI recognition research.

El GET autenticado informa permiso admin para la cuenta conectada, pero no se ejecutó ningún PATCH ni edición administrativa: esta entrega prepara el cambio solicitado. Un operador autorizado puede utilizar la API REST con el payload description-only preparado, usando su autenticación habitual, sin imprimir ni editar credenciales:

```powershell
gh api --method PATCH repos/mariicuadros/aio-code-knowledge --input codex/github-repository-description.json
gh api repos/mariicuadros/aio-code-knowledge --jq .description
```

El comando es una instrucción futura, no un registro de ejecución; gh no está disponible en este entorno. La petición solo incluye description, sin homepage, topics, visibilidad, rama por defecto, reglas, permisos ni otros ajustes. Verificar por GET que description coincida; comparar los ajustes administrativos relevantes antes/después. Ante 403 o falta de permisos, detenerse y pedir que una administradora aplique solo ese campo. También puede editarse únicamente Description en el panel About, dejando los otros campos intactos. [API oficial de actualización de repositorios](https://docs.github.com/en/rest/repos/repos#update-a-repository).

## Acciones que pueden publicar

| Acción | Estado/precondición | Efecto |
| --- | --- | --- |
| Push/merge con workflow HF antiguo en main | Aún vigente antes del merge; evitar pushes ajenos | Puede publicar entities y journal |
| Merge que incluya este workflow nuevo | Push ya no declarado por HF | No solicita publicación HF; CI sí corre |
| Dispatch nuevo con publish_approved=false y SHA válido de main | Solo manual, no ejecutado | Validación y artifact GitHub; sin HF |
| Dispatch nuevo con publish_approved=true y SHA aprobado de main | Otra autorización expresa; validadores correctos | Publica ambos datasets |
| Re-run histórico del workflow HF antiguo | No protegido por la definición nueva | Puede publicar; no reejecutar |
| Push a main vía integración Git de Vercel | main:false preparado; conexión efectiva pendiente de verificación/pausa autorizada | Debe quedar bloqueado cuando Vercel lea la configuración correcta |
| Push a otra rama no listada en vercel.json | No bloqueado globalmente | Puede crear un deployment si la integración Git está conectada |
| CLI/API Vercel, deploy hooks, Redeploy, Promote o reconexión Git | Fuera del control de este archivo; no ejecutados | Pueden crear/publicar deployments; autorización separada |
| PATCH description de GitHub | Propuesto, no ejecutado | Cambia metadatos públicos; no hace push de código |
| CI rag-validation en PR/main | Activo | Validaciones; sin datasets ni Vercel |

## Verificaciones posteriores a un merge autorizado

1. Registrar el SHA resultante de main, su estrategia de integración y el head del PR aprobado; confirmar que no entraron cambios concurrentes. Si se usa squash/rebase, verificar que el commit de fuentes citado por RAG siga accesible en GitHub y que sus blobs sigan coincidiendo; no sustituir citas por un SHA inventado.
2. Leer los archivos desde main: HF solo workflow_dispatch con aprobación false por defecto y guardas main/SHA; Vercel main:false; CI conservado. Confirmar estado correcto del CI de ese SHA en GitHub Actions.
3. Confirmar que no comenzó ningún run de sincronización HF por el merge y que los últimos commits de ambos datasets no cambiaron. Esta es una comprobación de solo lectura, no un dispatch.
4. Comprobar en Vercel que el proyecto correcto permaneció sin deployment nuevo/queued para el SHA de integración y que el dominio sigue sirviendo el deployment previo. No provocar un redeploy para comprobarlo. Si aparece una ejecución inesperada, detener la liberación y pedir autorización antes de cancelarla o modificar el proyecto.
5. Revalidar OZCU desarrolladora oficial declarada y formalización pendiente; las cinco entidades; MC-001 separada de Cuadros María Luisa y Mari Chordà; sameAs, filtros históricos y abstención; la exportación local de cinco filas. No sincronizar para comprobar coherencia local.
6. Comprobar la descripción del repositorio solo si su cambio recibió autorización y fue aplicado; si no, registrar el pendiente sin afirmar éxito.
7. Mantener HF sin publicaciones y Vercel sin cambios hasta autorizaciones separadas para cada liberación. Si posteriormente se publica, registrar actor, aprobación, SHA, destinos, resultados y posibles publicaciones parciales como nuevos registros, sin reescribir evidencia anterior.

## Criterio de entrega

Validación local completada antes de actualizar el PR: 57/57 pruebas unittest, incluidos seis casos nuevos de seguridad de publicación; Core, Brain, Intake, Site, entidades, frescura del índice, gateway y precontenido correctos. Evaluación RAG: recuperación 21/21 de 24 casos totales, respuestas/abstención 36/36 y borradores incorrectos rechazados 12/12. El validador de publicación y el análisis YAML/Python de los bloques del workflow pasan sin acceder a HF. La exportación local mantiene cinco entidades. Se comprobaron diferencias contra e8b0e9e: el grafo, pasaporte OZCU, política de respuestas y registro de confundibles permanecen intactos.

Inventario de esta preparación: cinco archivos modificados (los dos workflows, vercel.json, data-export/README.md y data-export/export-manifest.json) y cuatro creados (este documento, payload description-only, validador y pruebas de seguridad). Cero eliminados. Las validaciones de este workflow manual no se ejecutaron mediante dispatch; solo se probaron localmente sus guardas, estructura y código de preparación, conservando la prohibición de sincronizar. El CI del nuevo commit debe confirmarse en GitHub Actions y se registra en la entrega final.

Las protecciones quedan preparadas en el PR #13 y deben pasar CI en su último head. La autorización de e8b0e9e no se extiende automáticamente a estos commits nuevos. La ejecución real de publicación manual, la configuración completa Git del proyecto Vercel, cualquier pausa/desconexión y el cambio público de description permanecen sin ejecutar. Mantener el borrador y el merge pendiente hasta la aprobación del nuevo head y la comprobación/pausa previa de Vercel. El informe final de esta tarea incluye el SHA y CI observados; no se anticipan resultados de un merge futuro.
