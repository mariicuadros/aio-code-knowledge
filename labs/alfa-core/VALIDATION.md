# ALFA v0.1 — validación

Fecha: 2026-10-22. Local: Node 24.21.0, Python 3.12, Windows. Sin clientes reales, Vault, proveedores o credenciales.

| Requisito | Evidencia |
|---|---|
| Preguntas por actividad y progreso | core.test: cantante/nombre artístico y emprendedor/proyecto; campos faltantes impiden preview |
| Nombre/tono independientes | A=Luna/informal; B=Atlas/formal, comprobado en motor y Chromium |
| Memoria entre sesiones | Logout y reconstrucción Alfa/SyntheticStore sobre disco; recuperación automática en navegador |
| Corrección/borrado | Contradicción pendiente, confirmación explícita; valor eliminado ausente del snapshot; olvidar toda memoria |
| Separación | Tokens A no leen/escriben B; segunda entidad A vacía; B sin datos A; sesiones expiradas denegadas |
| Borrador válido | validateEntity real de lib/entity-domain.mjs; preview JSON y cambios en navegador |
| Publicación / canónicos | HTTP /api/publish y /api/link_canonical: 403; canonicalEntityId=null; useAuthorized=false |
| Revisión exacta | Binding sesión/entidad/versión/acción/hash, un uso; cambios de otra sesión y revisiones viejas rechazados |
| Instrucciones maliciosas | Texto desconocido/privado no persistido; fixture injection de #84 mantiene privilegios denegados |
| Sin red externa ni datos reales | Runner de permisos mínimos, entorno saneado, fetch externo denegado, lectura fuera de allowlist denegada |
| UI errores y logout | Chromium: 409 oculta memoria y bloquea revisión; respuesta HTTP retenida hasta después de logout no repuebla UI |

Resultados locales:
- `node labs/alfa-core/runner.mjs test`: **12/12 PASS**, sin omisiones; incluye HTTP real contra un puerto loopback efímero y almacenamiento nuevo.
- `node labs/alfa-core/runner.mjs demo`: **PASS**, A y B recuperan revisión 6, nombres/tonos distintos, cero llamadas de proveedores y borradores sin ID.
- `node labs/alfa-core/browser-check.mjs <playwright existente>/index.mjs`: **PASS** en Chromium, sin page errors. Instalación ya disponible, ninguna dependencia añadida. El harness cierra navegador y servidor al terminar.
- `python scripts/check_frozen_core.py`: **PASS**, 11 archivos y snapshots protegidos.
- `python scripts/audit_repository_integrity.py`: **PASS**.

CI propio ejecuta las 12 pruebas, demo, regresión de las 44 pruebas ModelAdapter y gates congelado/integridad. El workflow general del repositorio se conserva. El resultado remoto debe verificarse sobre el SHA final del PR; no se confunde este informe local con prueba remota. Navegador es una prueba local opcional y no está añadido a CI para evitar instalaciones innecesarias.

Fallos detectados y resueltos durante desarrollo: codificación de tubería Windows en dos archivos nuevos; bloqueo de resolución literal 127.0.0.1 en el guard de DNS. Se corrigió UTF-8 y se permitió únicamente esa resolución literal sin DNS externo. No se desactivaron assertions ni controles de salida.

Límites: selector de usuarios simulado (no IdP); loopback HTTP (cookie no Secure, nunca apta para producción); almacenamiento sin cifrado ni CAS entre procesos; recuperación entre sesiones de una misma instancia y mediante store reconstruido en tests, no servicio persistente productivo. No LLM, MCP/A2A, RAG conectado, registro ni publicación. P0 externos sin cerrar.
