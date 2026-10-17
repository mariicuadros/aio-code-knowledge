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
