# ALFA v0.1 — auditoría previa a implementación

2026-10-22. ALFA es una capacidad de DEOS, no otro producto ni una sustitución del núcleo.

Base main observada: 41c0244387f4865f9b2ebf4c4a50e4c97055974c. Dependencia explícita no fusionada: PR #84, ba5b490d4c1e2a81aa6a030e269017c9f541a9aa. Este PR se apila sobre #84 para mostrar solo ALFA; no incorpora sus cambios a main ni integra seguridad pendiente.

| Componente revisado | Reutilización / bloqueo |
|---|---|
| lib/entity-domain.mjs, validateEntity | Validador puro de datos administrativos. Reutilizar para preview, nunca EntityService.change. Exige canonicalName, description, type, typeDetail, arrays, rightsHolder y lastReviewed. useAuthorized=false, locationAuthorized=false, publicFields=[], canonicalEntityId=null. rightsHolder se obtiene de declaración sintética, no de inferencia jurídica. |
| lib/entity-service.mjs | tenant constante admin-console, no aislamiento por creador. BLOQUEO para integración real multiusuario. No invocarlo ni asignar ENT IDs. |
| lib/entity-store.mjs | LocalStore serializa un proceso; VaultStore depende de vault-client. No importar este módulo: trae persistencia sensible. No usar el Vault como almacén de memoria ni duplicar un Ledger canónico. |
| lib/private-auth.mjs | Credencial administrativa/cookie no prueba identidad individual/ownership. No reutilizar como auth multiusuario. |
| Frontend #25 f5e1065d31fa77efb9e406a9c21ae98808e176a8 | lib/console-controller.ts conserva generación de sesión, bloqueo de escritura y confirmación exacta; lib/security.ts y server.ts conservan sesión/OIDC/BFF. Patrón reutilizable, no conexión operativa. No modificar frontend ni importar sus endpoints. |
| #84 ModelAdapter v1 | Reutilizar orquestador y mocks sin alterar contrato de fixtures cerrado. La conversación/memoria NO se convierte en fixture aceptado por un modelo. La propuesta JSON se construye y valida determinísticamente; la llamada demostrativa al orquestador queda identificada como simulación separada. |
| RAG público / public-rag.mjs de #84 | Memoria no es fuente pública. No indexar conversaciones. No conectar RAG a esta conversación mínima; conector público queda preparado en #84. |

Estado GitHub comprobado: #74 (3541ddd), #80 (073fc22), #81 (8957028), #77 (a02c2c9), frontend #25 (f5e1065) y #84 (ba5b490) abiertos y no fusionados. #80 depende de #74; #81 de #80. No se declara resuelta autoridad privilegiada, unicidad global ni revocación distribuida. #77 no autoriza identidades Sergio/UGE.

El Vault privado NO fue accedido, ni listado. La indicación inicial de inspección autorizada queda limitada por la prohibición estricta posterior de acceder al Vault real. Su contenido, permisos y disponibilidad: NO VERIFICADOS. La auditoría solo lee código/contratos públicos.

## Decisión mínima segura

- Chat local loopback con catálogo de frases/datos ficticios y respuestas deterministas progresivas; no razonamiento LLM. Nombre/tono por usuario-entidad.
- Memoria JSON sintética en directorio temporal exclusivo, persistencia entre sesiones de la misma instancia, sustitución atómica y revisión optimista; sin backups con valores eliminados. Procedencia de decisiones/correcciones sin conservar texto eliminado. No inferencias sensibles.
- Sesiones opacas efímeras y ownership en servidor con dos usuarios predefinidos. Selector sintético no es autenticación real. Rechazar usuario/entidad ajenos, expiración y revisiones obsoletas. Navegador invalida respuestas tardías en logout/cambio de sesión.
- Borradores validados por validateEntity; sin persistir expedientes administrativos, sin publicar, sin IDs. Confirmación local exacta ligada a sesión, entidad sintética, versión y SHA-256; invalida en cambios/409/logout. Ninguna autoridad legal o de publicación.
- Sin dependencias nuevas. Modificaciones solo labs/alfa-core y workflow propio. Core, frontend, RAG, proveedores y producción permanecen intactos.

## Integración futura bloqueada

Requiere identidad individual verificada, autorización por tenant/entidad en cada operación y consulta, almacenamiento privado con CAS/múltiples procesos, cifrado y política de retención/borrado, consentimiento exacto, auditoría durable y revisión independiente de P0. La memoria debería ser un servicio privado separado con claves tenant/user/entity y clasificación explícita; no RAG público ni registro canónico. No improvisar rutas administrativas ni credenciales compartidas. Cualquier proveedor real, Vault o despliegue requiere nueva autorización.

## Plan de archivos

catalog.mjs: frases/datos sintéticos; core.mjs: conversación, memoria, borradores/revisión; store.mjs: persistencia temporal; server.mjs: HTTP loopback/sesiones; ui.mjs/index.html: chat; runner.mjs: aislamiento; tests y demo: recorrido A/B. README y resultados documentarán límites. Primero validación del motor y contrato; después servidor/UI y recorrido completo.
