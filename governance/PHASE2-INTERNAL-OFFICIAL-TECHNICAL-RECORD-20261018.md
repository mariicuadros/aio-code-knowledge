# AIO CODE — Acta técnica oficial interna · Fase 2 (corte de evidencia)

**Identificador de registro:** AIO-PH2-EVIDENCE-20261018-001  
**Fecha de observación:** 2026-10-18 UTC (2026-10-17, hora Colombia durante las pruebas)  
**Clase:** registro oficial **interno** de ingeniería y trazabilidad, no inscripción mercantil ni certificación de terceros  
**Estado del acta:** evidencia técnica documentada; firma/aprobación formal de la fundadora no registrada aquí  
**Estado de la Fase 2:** en ejecución; este acta **no** declara que el producto esté listo para clientes, ni cierra íntegramente la fase.

## 1. Referencias verificadas al corte

| Superficie | Commit o versión verificada | Alcance |
| --- | --- | --- |
| `mariicuadros/aio-code-knowledge` `main` | `f3fcf986403b901f10f4b5eedecbe789af8550cd` | Backend y RFC de ID canónico; historial GitHub PR #48, #49, #50, #51 |
| `mariicuadros/aio-code-frontend` `codex/lab-oidc-20261011` | `08f0df2df2d55d863f4e30f7fc0340c5615258cc` | Consola privada OIDC + panel de prueba sintética (PR #9) |
| `mariicuadros/aio-code-vault` `main` | `ed4551f95bf445aa8e277f5e5835187099d77226` | Estado privado al cierre de dos ejecuciones remotas del panel |
| Vercel `aio-code-console-lab` | Deployment `dpl_BuV9MdtvPnytp6NLU8G41U168UTm` · READY | Consola protegida, exacto frontend SHA anterior |
| Vercel `aio-code-api-lab` | Deployment `dpl_FVSdYCF69j27cvD5nJReaaf7A363` · READY al último control | API lab con backend de corte anterior |
| Vercel `aio-code.vercel.app` | Deployment `dpl_J71pqJA9SN44VS6kPwWdaMS8LDmS` | Sitio público fuera del alcance de las pruebas remotas |

Los despliegues observados como READY prueban compilación/despliegue, **no**, por sí solos, operaciones correctas. La evidencia de operaciones proviene de la consola real y de las revisiones verificadas en el Vault privado.

## 2. Resultados observados y confirmados

**A. Ciclo de vida remoto con «Laboratorio Prisma — PRUEBA FICTICIA».** Operaciones desde la consola autenticada: `create` → `edit` → `validate` → `approve` → `publish` (solo preparar paquete privado) → `archive`. Seis revisiones inmutables persistidas en el Vault privado. Revisión actual: `archived`, `approvedVersion=null`, `approvedDataHash=null`, `packageData=null`, `publicUrl=null`. Se verificó que las revisiones anteriores persisten y no se reescribieron.

**B. Denegación de lectura anónima.** En una ventana sin sesión, `/api/entities` respondió con cuerpo `{"error":{"code":"unauthorized"}}`. La administradora confirmó una denegación al probar también un enlace individual, aunque la captura del navegador recortó su ruta. No se dispone de prueba de cabeceras de esa captura ni se puede atribuir inequívocamente la respuesta a una capa específica entre Vercel y el BFF.

**C. Prueba negativa remota autenticada en la consola protegida.** La captura de la ejecución con expediente `LAB-SEGURIDAD-FICTICIA-55274971` muestra nueve comprobaciones aprobadas: sesión, POST anónimo sin cookies 401, alta sintética, repetición idempotente, clave reutilizada con datos distintos 409, edición válida, edición obsoleta 409, confirmación de que las solicitudes rechazadas no alteraron la versión, y archivado. Se contrastaron en el Vault **tres** revisiones inmutables de esa ejecución, terminando en `archived`, sin aprobación, paquete, URL pública ni vinculación canónica.

**D. Segunda ejecución sintética.** En el mismo corte se detectó una segunda ejecución de prueba, con nombre sintético diferente. Inicialmente tenía dos revisiones y luego se verificó una tercera de `archive`; terminó también `archived`, sin paquete ni URL pública. Este registro no se interpreta como un segundo set de nueve comprobaciones documentadas por captura; se confirma su estado final y sus revisiones.

**E. Integridad y alcance.** No se observaron cambios sobre expedientes reales durante estas pruebas. Se conservaron los archivos previos del Vault. No se publicó ni indexó ninguna entidad ficticia, y ambas pruebas permanecieron fuera de JSON-LD público, grafo canónico, RAG público y datasets de Hugging Face.

## 3. Estado del registro de entidades públicas

`entity-graph.json` v1.6 enumera **seis** nodos ya registrados: `OZCU-001`, `MC-001`, `AIO-001`, `NUX-001`, `VOID-001`, `DAN-001`. La auditoría posterior a la sincronización con Hugging Face confirmó paridad de seis en el alcance de sus campos auditados (workflow de auditoría #2, ejecución `39082912903`). **Eso no constituye una nueva asignación de ID desde la consola.**

El registro actual de grafos/publicaciones **no** equivale a un mecanismo independiente de solicitud, reserva, concesión y retiro de IDs nuevos. `governance/PHASE2-CANONICAL-ID-ASSIGNMENT-RFC-20261018.md` describe este mecanismo en estado **DESIGN / NOT IMPLEMENTED**. La aplicación todavía utiliza un solo rol administrativo en el MVP.

## 4. Controles y ambigüedades aún abiertas

- Una revisión `approved` autoriza un paquete privado específico; `pending_deployment` **no** significa que una Entity Home pública esté desplegada.
- Un `ENT-UUID` es el ID interno del expediente; **no** es un identificador público ni una fuente de `@id`.
- La función pura `publicReleaseCandidate()` existe y tiene tests; un publicador futuro debe integrarla y solicitar una autorización separada. Hoy **no hay publicación automática implementada**.
- Faltan pruebas remotas adicionales de CSRF cross-origin **con sesión controlada**, y auditoría de aislamiento multiusuario y rate limiting distribuido. El rate limit del MVP es en memoria y por proceso.
- Los consentimientos de uso, perfiles declarados y fuentes/claims no constituyen por sí solos verificación jurídica, propiedad de cuentas o reconocimiento por IA externas.
- La protección de `main` está activa en el repositorio público `aio-code-knowledge`; el Vault y frontend privados requieren evaluación de reglas/procedimientos equivalentes sin volverlos públicos.
- La incidencia #47 mantiene pendiente un **addendum** actual del recuento de seis sin reescribir `ENTITY-MASTER-RECORD.md`, histórico y congelado.

## 5. Determinación de ingeniería y siguiente orden

**Resultado del corte:** el flujo básico completo de Entity Console → API → Vault privado y los rechazos remotos específicos anteriores tienen evidencia satisfactoria. **No se certifica** plataforma multiusuario, autorización legal, indexación ni seguridad exhaustiva.

**Siguiente trabajo:** orden a Codex para implementar un proceso **privado, privilegiado, versionado y revisable** de reserva/asignación de IDs nuevos, empezando por endurecer que el create/edit ordinario no establezca ni modifique arbitrariamente `canonicalEntityId`. Entregar PRs separados, pruebas de carrera, suplantación, idempotencia, compatibilidad de DAN-001 y regresión histórica. La implementación no puede emitir un ID real ni desplegar/publicar una nueva entidad sin aprobación específica de la fundadora.

**Protección vigente:** MC-001 y AIO-001 permanecen congelados en su contenido y representaciones canónicas. La Fase 1 (14/49 de baseline observado) no se redefine. AIO CODE sigue siendo un **Digital Entity Operating System (DEOS)**, no una metodología como producto principal.

## 6. Evidencia reproducible (sin datos privados)

- Repositorios y commits arriba; las revisiones sintéticas están solo en Vault privado.
- CI frontend: PR #9 (`Verify private Entity Console`), pruebas locales y de componentes aprobadas antes de despliegue.
- CI backend/documentación: PR #50 y #51, validaciones de núcleo congelado aprobadas.
- Capturas aportadas por la administradora en la conversación, incluido panel remoto 9/9.
- Seguimiento técnico: incidencia privada frontend #6 (E2E) y #7 (release gate); la existencia de esas incidencias no implica aprobación del próximo release.

**Firma/ratificación:** Pendiente de constancia formal de la fundadora si se desea elevar esta acta de «evidencia registrada» a «aprobada institucionalmente». No se inventa firma ni autorización comercial.
