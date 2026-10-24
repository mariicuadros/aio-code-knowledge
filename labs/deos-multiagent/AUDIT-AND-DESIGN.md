# Auditoría y diseño — DEOS ModelAdapter v1

Fecha de observación: 2026-10-22 UTC / 2026-10-21 Bogotá. Base verificada: main `41c0244387f4865f9b2ebf4c4a50e4c97055974c`. Referencia auditada: [PR #83](https://github.com/mariicuadros/aio-code-knowledge/pull/83), HEAD `682abc4d65e8a7ddad4aff02181835cadbb08819`, abierto, borrador y no fusionado. Se reutilizaron únicamente sus ocho archivos de laboratorio/workflow; no se integró la rama completa. Rama de esta entrega: `codex/deos-model-adapter-v1-20261022`.

## Hallazgos sobre PR #83

| Capacidad | Evidencia en HEAD auditado | Estado inicial | Tratamiento |
|---|---|---|---|
| Asistente único y cuatro roles | orchestrator.mjs: runDemo, research, creative, governance, supervisor | IMPLEMENTADO como funciones síncronas | Se conserva el patrón; ahora los roles implementan ModelAdapter |
| Exclusividad sintética | validated comprueba prefijos/URLs, pero acepta texto arbitrario en excerpt y display_name | PARCIAL; podría contener datos reales | Catálogo cerrado, sin campos de texto externos |
| Intercambio de modelos | funciones locales, sin contrato de adaptadores | NO IMPLEMENTADO | Contrato v1 validado y dos variantes de mock intercambiables |
| Contradicciones y homónimos | extrae todos los años del texto y compara nombres por substring | PARCIAL; mezcla posible de sujetos/años | Citas estructuradas por sujeto y predicado; rechaza evidencia ajena/omitida/inventada |
| Revisión humana exacta | human_review_required=true; sin recibo o vinculación a contenido | PARCIAL | Binding a solicitud, sujeto sintético, revisión, acción y hash; un solo reconocimiento |
| Trazas y consumo | cuatro pasos sin intentos/hashes; coste cero literal | PARCIAL | Intentos, errores acotados, hashes, reservas y uso reportado explícitamente simulado |
| Reintentos/timeouts/presupuesto | no existen llamadas asíncronas ni límites de ejecución | NO IMPLEMENTADO | Límites por ejecución, cancelación, descarte tardío y reservas conservadoras |
| RAG público | explícitamente no conectado | NO IMPLEMENTADO en laboratorio | Lector puro fijado por huellas, separado de mocks, reutiliza recuperador existente |
| MCP/A2A/proveedores reales | documentación de posibilidades futuras | NO IMPLEMENTADO | Se mantiene sin activar; no se afirma interoperabilidad remota |
| Aislamiento de pruebas | seis pruebas funcionales sin ejecutor aislado | PARCIAL | Permisos de lectura mínimos, sin entorno de credenciales ni red/escrituras |

Las seis pruebas originales pasaron antes de sustituir el contrato. Repetibilidad de una función pura no equivale a idempotencia operativa ni demuestra exclusión de carreras distribuidas.

## Contrato y autoridad

Versión `deos.model-adapter/1`; roles `research`, `creative`, `governance`, `supervisor`. `generate(task,{signal})` devuelve exclusivamente versión, rol, claims, recomendación enumerada y uso simulado. Entrada congelada: solicitud sintética versionada, fixture y resultados previos ya validados. Cada afirmación contiene sujeto sintético, predicado, valor y fuente. Se validan todas las afirmaciones y la completitud de la evidencia antes de aceptar resultados. Las fuentes conservan URL ficticia, huella y estado de verificación; no se presentan como verificadas en Internet.

El orquestador es la única autoridad de flujo. Un modelo nunca decide privilegios. Las reglas de derechos, identidad y publicación se fijan fuera de la salida de los adaptadores. Ninguna recomendación ejecuta una herramienta. `SYN-SUBJECT-*` desambigua fixtures, **no es un identificador canónico**.

El hash de revisión cubre solicitud, sujeto, fuentes, claims, discrepancias, todas las salidas, errores, trazas, consumo y política. El binding además incluye acción `acknowledge_synthetic_review`. Una nueva revisión revoca la anterior antes de ejecutar; solo se acepta una confirmación exacta de un resultado completo. Una ejecución fallida no se puede confirmar. `invalidate` revoca el resultado local. No existe endpoint HTTP ni operación que produzca 409; los conflictos locales se rechazan como stale_revision/run_in_progress/approval_rejected.

La confirmación vía botón/booleano demuestra el flujo, **no identidad humana autenticada** ni firma criptográfica. Un consumidor con acceso al mismo proceso puede llamar al método: por ello nunca sirve como credencial para DEOS. Para producción se necesitará sesión validada, CSRF, caducidad, recibo inmutable, control de revisión atómico y verificación en servidor independiente del agente. No se reutilizan ni debilitan los contratos del backend.

## Límites presentes y futuros

Presente: máximo 8 intentos/calls y 12.000 tokens estimados por ejecución; timeout 1.000 ms y 2 intentos por rol (configuración acotada: 16 calls, 50.000 tokens, 5.000 ms, 3 intentos). Reserva antes de despachar = bytes UTF-8/4 redondeados + 256 tokens de salida. Todo intento fallido/timeout conserva la reserva. Esto es una estimación sintética, no tokenización ni facturación real. Solo transient/timeout permiten reintentos; entradas, evidencia o recomendaciones inválidas detienen el flujo. Errores arbitrarios se reducen a adapter_error sin mensajes potencialmente privados. Estado volátil máximo 100 solicitudes; una ejecución concurrente; sin persistencia.

El AbortSignal y Promise.race no pueden detener JavaScript hostil síncrono ni garantizar cancelación remota de un proveedor. Solo código local revisado es admisible. El ejecutor tiene además timeout externo de 30 segundos. Los hooks de red son defensa adicional, no una sandbox completa para dependencias arbitrarias.

### Diseño opcional para OpenAI, Gemini u otros proveedores — NO activado

1. Adaptadores versionados por proveedor detrás del mismo rol/contrato. Aprobar un nuevo modo/versión explícitamente; v1 actual rechaza live. No añadir SDK, claves ni endpoints hasta nueva autorización.
2. Gateway único en servidor: credenciales de mínimo privilegio y por entorno; ninguna en navegador, fixtures o trazas. Egress allowlist, metadatos de retención/región/consentimiento y clasificación de datos antes de cada envío. Los niveles gratuitos tampoco autorizan datos reales de clientes.
3. Presupuesto duradero en unidades monetarias enteras: reserva atómica por operación/usuario/día antes de cada intento, coste máximo calculado con tarifario versionado revisado, tokens de entrada/salida máximos y reconciliación con uso facturado. Coste desconocido o reserva no garantizable => rechazo seguro. Timeout no devuelve automáticamente la reserva. No importar precios actuales ni asumir gratuidad.
4. Deadline global y por intento, límite de concurrencia, circuit breaker, clave de idempotencia y registro de request ID del proveedor. Cancelación/desconexión invalida la revisión aunque el proveedor siga facturando. Errores de autenticación/política no se reintentan.
5. Fallback solo entre proveedores previamente autorizados para la misma clasificación, región, contrato y reserva. Ningún cambio de proveedor silencioso para datos privados; sin fallback que relaje la política. Registrar modelo y versión exactos, motivo, latencia, uso reportado y reconciliación.
6. Evaluación previa con este conjunto sintético y casos ampliados: precisión/recall de citas, rechazo de identidades homónimas, abstención, errores por rol, latencia p50/p95, tokens/coste por resultado válido y diferencias entre modelos. No hay resultados de modelos reales en esta entrega.
7. RAG público: seleccionar únicamente el snapshot revisado, tratar texto recuperado como evidencia no como instrucciones, limitar consultas/pasajes/contexto y presentar fuentes antes de generar. No habilitar Vault, herramientas privilegiadas, registro, derechos o publicación por disponer de RAG.
8. MCP futuro: solo capability de consulta pública, autenticación y scopes de lectura, allowlist de herramientas y salidas; ninguna herramienta privilegiada. A2A futuro requiere identidad/consentimiento entre servicios y pruebas del protocolo. Ambos siguen NO IMPLEMENTADOS.

## Aceptación y evidencia

Ejecutar los comandos del README. Suite con fixtures exclusivamente sintéticos; demostración CLI sin aprobación automática; comprobación pública aparte que solo imprime pin y conteo. Las pruebas cubren todas las categorías adversariales solicitadas, cambio de especialista, manipulación de binding, replay, timeout tardío, reintento, presupuesto y denegación de red/archivos/subprocesos. El gate congelado verifica 11 archivos y snapshots MC-001/AIO-001. Auditoría estructural del repositorio requerida.

La comprobación pública encontró 189 pasajes, 187 canonical_current y 2 superseded; solo los primeros son recuperables. El snapshot contiene fuentes de primera parte, no garantías de descubrimiento externo. El índice no cambia en este PR.

## Compatibilidad, seguridad pendiente y reversión

Cambio deliberado e incompatible con runDemo(raw) del prototipo no fusionado: ahora createOrchestrator().run({fixture_id,request_id,revision}) es asíncrono y solo admite catálogo. UI, CLI y pruebas migran juntos; no hay clientes desplegados migrados ni cambios de API productiva. Se requiere Node 24 para el runner y Web Crypto/contexto localhost para el navegador.

PR backend [#74](https://github.com/mariicuadros/aio-code-knowledge/pull/74), HEAD `3541ddda9d7fb55bf1f20b31c2edc603a8c87c5f`, y frontend [#23](https://github.com/mariicuadros/aio-code-frontend/pull/23), HEAD `62fa54f20c824b0b596d8fd1372affed6d420ffe`, se verificaron abiertos, draft y sin fusionar. Este laboratorio **no cierra los P0 de autoridad privilegiada ni unicidad global**, ni reemplaza revisión de esos PR u otras correcciones pendientes.

No se modifican archivos del núcleo, RAG, sitio público ni configuración Vercel. `vercel.json` conserva git.deploymentEnabled=false. Las diferencias se limitan al laboratorio y su workflow. El fallo inicial del gate en Windows se resolvió restaurando bytes exactos del commit (CRLF frente a LF), sin cambiar baseline ni contenido canónico.

Reversión: antes de fusionar, cerrar/descartar este borrador; no hay migración ni efecto externo que revertir. Si se aprobara en el futuro, revertir exclusivamente sus commits mediante otro PR revisado. No tocar PR #83, los PR de seguridad ni datos/identificadores. La única integración propuesta aquí es revisión independiente y ejecución de CI, nunca despliegue.
