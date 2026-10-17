# AIO CODE — Corrección e integración, 17 de octubre de 2026

## Cambios ejecutados
- Frontend PR `mariicuadros/aio-code-frontend#1` fusionado en `codex/lab-oidc-20261011`. SHA de fusión: `411d9526e05ab21bcaddc323925f2c04389bbf6c`.
- Backend PR `mariicuadros/aio-code-knowledge#26` fusionado en `main`. SHA de fusión: `c09d30f3de9a14eab8e469ef78f6cf71e10255a6`. Antes de fusionar se añadió la revalidación de identificadores y versiones contra cada snapshot del Vault al reintentar commits optimistas.
- Actualizado `legal/rights-registry.json`: la referencia histórica `DANISAN-001` se reconcilió como `DAN-001`; relación `collaborating_model`. La administradora declara que existe un acuerdo firmado por ambas partes. No consta aún que la copia exacta y su hash hayan sido cotejados con el Vault. No se requiere solicitar una nueva firma para registrar esa declaración.
- `entity-graph.json`: nuevo enlace `DAN-001 --collaborating_model_in--> AIO-001`, respetando separación de identidades; no usar `sameAs` entre ambas.
- Creado `public-assets-v2.json` como ampliación versionada del inventario de septiembre; incluye Entity Home, perfiles sociales declarados y portafolio DAN-001. La versión histórica v1 se conserva.
- Vercel: los proyectos `aio-code-api-lab` y `aio-code-console-lab` notificaron `READY` para los commits desplegados. La interoperabilidad HTTP/autorización y persistencia después de la actualización todavía deben validarse desde una sesión.
- Hugging Face: conexión autenticada de lectura a `mariicuadros`. Datasets `aio-code-journal` y `aio-code-entities` accesibles, con actualización declarada al 14 de octubre. Los permisos OAuth observados son de lectura; no se efectuó ninguna escritura/sincronización.

## Riesgos que no se consideran resueltos
1. El despliegue `READY` no demuestra una operación de punta a punta. Probar sesión, 2 entidades, edición del vínculo `DAN-001`, recuperación y rechazo de vinculaciones duplicadas.
2. La revalidación de Vault se inspeccionó en el código, pero sigue pendiente la ejecución de un test remoto de concurrencia sobre almacenamiento aislado.
3. No se cargó el documento firmado ni su hash en el Vault desde esta sesión. La declaración de firma no certifica en qué versión firmada se basó, ni habilita usos comerciales ilimitados.
4. Titularidad de imágenes fotográficas de terceros, sublicencias, nuevas campañas pagadas y usos sintéticos requieren valoración del alcance aplicable.
5. La publicación de un paquete desde Entity Console sigue siendo manual y separada de aprobación.
6. Dataset de HF puede no incluir todavía los cambios de octubre posteriores al día 14; mantener criterio de sincronización y evidencia de versiones.
7. La indexación y reconocimiento por motores/LLMs requieren capturas y consultas datadas, no se derivan de un despliegue.

## Seguridad
No se modificaron ni expusieron contraseñas, tokens ni documentación identificatoria. La API de laboratorio permanece protegida; no habilitar acceso público o copiar las credenciales de producción a Preview.

## Próxima prueba de aceptación
Desde el dominio de producción del laboratorio, iniciar sesión, comprobar que aparecen los expedientes previos y que la edición ofrece `Identificador canónico vinculado`. Guardar `DAN-001` solo una vez confirmado que corresponde al mismo expediente, y comprobar que la revisión se recupera tras actualizar. Registrar el resultado y fecha.

## Comprobaciones adicionales tras el corte de conexión
- El manifiesto de publicación restringida no incluía inicialmente `public-assets-v2.json`. Se añadió a `public-site-manifest.json` (62 archivos permitidos) y se desplegó de nuevo `aio-code` desde `main`; Vercel confirmó `READY` para la revisión `1da7108281dc6fa2a49d6e69dce2151c1c64ca24`.
- Se comprobó por API de Vercel que el dominio `aio-code.vercel.app` sigue asignado y verificado al proyecto público; `aio-code-console-lab.vercel.app` está asignado a la consola.
- Las consultas de errores agregados del runtime de la consola y del backend no devolvieron errores para la ventana consultada. Esto no sustituye una prueba activa del circuito login/listar/editar.
- Las pruebas y los despliegues no certifican indexación externa ni sincronización de Hugging Face más allá de lo observado.

## Corrección adicional del esquema de derechos
- El registro público DAN-001 utilizaba `collaborating_model` y el estado explícito de firma declarada por la administradora, pero `legal/rights-registry.schema.json` no admitía esos valores. Se ampliaron las enumeraciones conservando las categorías históricas.
- Se añadió un caso de regresión `test_public_registry_conforms_to_published_schema` que valida el registro con JSON Schema 2020-12 y formatos. La prueba quedó en GitHub, pero **no se ejecutó una batería CI completa desde esta sesión**.
- Comprobación estructural sobre los archivos actuales: 2 registros de derechos, 6 nodos y 10 relaciones, 21 inventarios públicos, 62 rutas publicadas; cero inconsistencias en enumeraciones/relación/inventario comprobados.
- La web pública se desplegó de nuevo desde `main` SHA `b10d924a7f29d58cbcbeb08985f1628716ce637d` y Vercel notificó `READY`. Una prueba HTTP pública externa y el recorrido de consola con sesión permanecen pendientes.

## Hallazgos de cierre: ramas y alcance del Vault
- El repositorio privado `aio-code-vault` existe, no está archivado y contiene expedientes Entity Console. No se leyó ni divulgó contenido de identidad privada.
- El repositorio frontend tiene rama predeterminada `codex/entity-console`, distinta de la rama de laboratorio desplegada `codex/lab-oidc-20261011`. Su comparación informa divergencia de 29 commits hacia delante y 6 hacia atrás; no se ejecutó una fusión automática a la predeterminada porque requiere revisión de diferencias y conflictos.
- El proyecto público `aio-code` conserva variables privadas `AIO_VAULT_READ_TOKEN` y `AIO_VAULT_WRITE_TOKEN` en Production. Su presencia no significa divulgación del valor, pero amerita revisión de privilegios por función y rutas, especialmente después de incorporar el endpoint administrativo de Entity Console a main. No se rotaron ni eliminaron credenciales sin plan de continuidad.
- El proyecto API específico conserva la credencial administrativa y las credenciales de Vault en Production; no se han replicado a Preview.
- Los errores OIDC del Preview anterior no se declaran reparados por una compilación READY; la prueba funcional del usuario sigue siendo obligatoria.

## Comprobación del vínculo de DAN-001 en el Vault
- La administradora completó la edición desde Entity Console.
- El Vault privado conserva las versiones 1 y 2 del mismo expediente `ENT-84b3e02f-a497-4fc1-b8f1-c5c7929331f0`.
- Se leyó la versión 2 y se verificó `data.canonicalName = DANISAN`, `data.canonicalEntityId = DAN-001`, `status = draft`, `data.useAuthorized = true`, `publicUrl = null`.
- La vinculación está persistida y no duplica el expediente; todavía no se ejecutaron los estados `review`, `approved` ni `pending_deployment` desde la consola.

## DAN-001 — revisión y aprobación verificadas
- El Vault privado conserva la versión 3 con `status: review`, `canonicalEntityId: DAN-001`, y una acción `validate` en su historial.
- La versión 4 conserva `canonicalEntityId: DAN-001`, `status: approved`, `approvedVersion: 3` y una huella `approvedDataHash` no vacía.
- La aprobación no expone la información privada ni despliega automáticamente un nuevo paquete: `publicUrl` sigue siendo `null` y `packageData` está pendiente.
- Próximo paso: desde la pestaña Publicación, usar `Preparar paquete privado` y revisar el resultado y las coincidencias con el registro público existente sin crear una segunda entidad.
