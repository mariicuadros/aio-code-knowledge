# CODEX — Orden operativa Fase 2 · Registro canónico independiente

**Work order:** AIO-CODEX-PH2-IDENTITY-20261018  
**Estado:** LISTO PARA INICIAR / ejecución de ingeniería aún no autorizada como despliegue  
**Prioridad:** P0 integridad de IDs; P1 reservas; P2 interfaz y publicación futura.  
**Producto:** AIO CODE **Digital Entity Operating System (DEOS)**. No reinterpretar como metodología.

## Contexto obligatorio antes de cambiar código

1. Leer `AGENTS.md`, `governance/PHASE2-INTERNAL-OFFICIAL-TECHNICAL-RECORD-20261018.md`, `governance/PHASE2-CANONICAL-ID-ASSIGNMENT-RFC-20261018.md`, `governance/PHASE2-AMBIGUITY-AND-RELEASE-GATE-20261018.md`, `governance/frozen-core-baseline-20261017.json`, `audits/2026-10-17/CODEX-IMPLEMENTATION-WORKORDER.md`.
2. Usar commits actuales, no hashes antiguos de un mensaje: `aio-code-knowledge/main`, `aio-code-frontend/codex/lab-oidc-20261011` (la rama realmente desplegada), `aio-code-frontend/codex/entity-console` (rama predeterminada), `aio-code-vault` privado únicamente con permiso y lectura mínima. Presentar tabla de diferencias primero.
3. Trabajo en worktree limpio **fuera de OneDrive**; no subir datos reales, acuerdos firmados, imágenes no autorizadas, cookies, credenciales ni archivos `ENT-UUID` reales a issues, tests o Git público.
4. **NO** modificar MC-001, AIO-001 ni `ENTITY-MASTER-RECORD.md` congelado. **NO** reindexar, sincronizar HF, cambiar Vercel, publicar o crear identificadores públicos de nuevas personas/empresas.

## PR A — P0: bloquear la reasignación canónica a través de edición ordinaria (backend)

**Riesgo actual:** un operador/API con credencial administrativa puede incluir `canonicalEntityId` en `create` o `edit`, y el servidor valida formato + duplicidad, pero **todavía no exige una decisión privilegiada de asignación**. El campo de la UI de laboratorio es de solo lectura, lo cual **no** protege por sí solo a la API.

- Introducir guardia de servidor de *no atribución* para altas ordinarias: `canonicalEntityId` debe permanecer `null` salvo por un **flujo separado explícitamente aprobado**. Para ediciones de un expediente vinculado con anterioridad, permitir conservar **exactamente** la misma vinculación; rechazar `null → ID`, `ID A → ID B` y `ID A → null` sin transiciones y aprobación registradas.
- Preservar la lectura y edición no identitaria de expedientes existentes con vínculo aprobado (especialmente DAN-001); analizar migración y compatibilidad antes de cambiar un contrato. No deducir ni reasignar IDs a partir de alias, URL o nombre.
- Considerar una autorización de capacidad separada para futuras asignaciones, no reutilizar silenciosamente la credencial general del dashboard. Hacer threat model; nunca loguear credenciales.
- Refactorizar tests actuales que crean sintéticamente `DAN-001` por la vía ordinaria sin abrir agujeros de producción; cubrir tests negativos y positivo para *preservar* vínculo existente.
- Probar idempotencia/reintentos/concurrencia, respuesta segura, no escritura en fallo, e invariancia de proyección `ENT-UUID` vs `DAN-001`.
- Proponer PR únicamente en `aio-code-knowledge`; usar rama `codex/phase2-canonical-link-write-guard`, ejecutar `validate` y `scripts/check_frozen_core.py`.
- **Salida:** matriz de compatibilidad y riesgos, PR SIN fusionar. No desplegar el API Lab hasta una aprobación de integración.

**Criterios de aceptación PR A:** create con ID no nulo falla sin crear registro; edit que intenta cambiar o retirar ID aprobado falla sin nueva revisión; edición normal de expediente previamente vinculado conserva el ID; crear/editar con null sigue funcionando; intentos de suplantar DAN-001 y núcleos bloqueados; datos privados excluidos del paquete público; core freeze pasa.

## PR B — P1: registro privado de solicitudes y reservas de IDs

Implementar **después de revisar PR A**, no a la vez en ese PR.

- Crear contratos versionados privados de `request`, `review`, `reserve`, `bind`, `withdraw`; mantener separado el acto de asignar ID del de autorizar publicación.
- Proponer almacenamiento `canonical-registrations/v1/` en Vault **sin nuevos registros reales**. Ledger inmutable de decisiones, actor/role, `ENT-UUID` privado, `expectedVersion`, evidencia privada, fecha, motivo, ID solicitado, resultado y clave de operación.
- Unicidad global incluyendo IDs ya usados, retirados y reservados; comprobar grafo, registry, destinos públicos y enlaces Vault. El rollback operativo no borra historial.
- Concurrencia: CAS sobre Git ref y revalidación de unicidad en cada reintento; prevenir simultaneidad incluso con instancias serverless distintas. No basarse solo en `Map` en memoria.
- Seguridad: sesión/CSRF/capacidad exclusiva de registrar, rate limiting y códigos de error seguros. Denegar registros de usuarios o compañías sin documentación/consentimiento explícito.
- Tests exclusivamente sintéticos con `DEMO-001` u otro namespace de pruebas, nunca solicitar `MC-001`, `AIO-001`, `DAN-001`, nombres de clientes ni reales. No asignar nuevos IDs reales durante CI.
- PR independiente, SIN fusionar automáticamente, bajo la aprobación de la fundadora.

**Criterios de aceptación PR B:** una sola reserva vence carrera; segunda falla sin mutar; no duplicados entre activos e históricos; retiro no recicla ID; ninguna operación altera el grafo público o genera deploy; evidencias privadas no aparecen en Git público.

## PR C — P1: interfaz de revisión y enlace privilegiado

Únicamente después de un acuerdo sobre PR B, separar en frontend. Desarrollar en la rama **OIDC real**, no sobrescribirla con la rama por defecto.

- Formulario de solicitud y estado de revisión sin capacidad de adjudicar identidad al operador normal. Aprobación por persona autorizada mediante capacidad diferente.
- Mostrar procedencia, detección de homónimos y derechos verificados como **estados de evidencia**, no como conclusiones legales.
- Vistas «expediente privado», «ID reservado/aprobado», «autorización de publicar» y «desplegado» separadas.
- Prueba E2E con entidad ficticia y archivado, sin publicar.
- Mantener controles OIDC, origen exacto, secretos server-side y prueba de no exposición pública.

## PR D — P2: conectar gate de publicación autorizado

Más adelante, no habilitar en esta orden. Diseñar interfaz para un futuro publicador que **debe** llamar a `publicReleaseCandidate()` y verificar que el registro canónico autorizado corresponda a una revisión específica. Requiere autorización de publicación **nueva y explícita** por entidad y por despliegue. Crear PR de cambios públicos por separado, con comparación de HTML/JSON-LD/plataformas, CI, revisión legal/rights y verificación de URL. Sin post automático a Google, Bing o Hugging Face.

## Pendientes paralelos que no deben mezclarse

- Seguridad remota: el laboratorio pasó pruebas de rechazo 401/409 en los escenarios ensayados; **no** declaró pasar CSRF remoto con sesión manipulada, multiusuario ni rate limit distribuido. No ejecutar automatización con acceso real a Vault sin autorización expresa adicional.
- Gobernanza: addendum del recuento de seis entidades (#47), sin editar `ENTITY-MASTER-RECORD.md`.
- Fuente: seis entidades registradas en el grafo existente; la incorporación de un nuevo ID no es un simple cambio de contador.
- Producto: no prometer disponibilidad comercial ni coberturas legales/regulatorias automáticas.

## Contrato de entrega de Codex

Por cada PR: descripción funcional, caso de amenaza mitigado, alcance y no-alcance, ramas exactas, lista de archivos, tests (conteos/reproducibilidad), evidencia anonimizada, CI, compatibilidad y riesgo de migración, rollback, impacto en datos, bloqueo de secretos, diferencias contra rama desplegada y **qué NO quedó demostrado**. Nunca presentar tests escritos como ejecutados. Mantener el PR abierto hasta autorización humana.

### Prompt listo para Codex

> Trabaja como ingeniero responsable de AIO CODE DEOS. Lee `AGENTS.md`, el acta `governance/PHASE2-INTERNAL-OFFICIAL-TECHNICAL-RECORD-20261018.md` y esta orden `audits/2026-10-18/CODEX-CANONICAL-REGISTRY-WORKORDER.md`. Comienza **solo con PR A**: proteger en el backend que `canonicalEntityId` no pueda asignarse, borrarse ni cambiarse por create/edit ordinarios, preservando la lectura y las ediciones no identitarias de vínculos aprobados existentes. Haz threat model, cambios mínimos, fixtures totalmente sintéticos y pruebas de idempotencia, concurrencia, rechazo de suplantación, no mutación, compatibilidad DAN-001 y congelación MC-001/AIO-001. Entrega un PR **sin fusionar ni desplegar** con resultados reales y riesgos. No modifiques Vault real, la web pública, Hugging Face ni indexación. No pases a PR B sin revisión posterior de la fundadora.
