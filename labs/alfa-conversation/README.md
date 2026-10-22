# ALFA v0.2 — conversación abierta simulada

ALFA es una capacidad de DEOS. Esta entrega prepara una conversación inteligente futura, pero **no contiene razonamiento de un modelo real**. Texto libre local → consentimiento de contexto → simulador por reglas → propuestas → confirmación humana → operaciones deterministas. OpenAI sigue desactivado, sin SDK, transporte, claves o activación por variables de entorno.

Dependencia apilada: [#85](https://github.com/mariicuadros/aio-code-knowledge/pull/85) `a135ce2a0cbf85f11f570e3cbb85c21547f44c8b`, sobre [#84](https://github.com/mariicuadros/aio-code-knowledge/pull/84) `ba5b490d4c1e2a81aa6a030e269017c9f541a9aa`. Ambos no fusionados. Sus archivos permanecen intactos. [Auditoría previa y guion manual Luna/Atlas](AUDIT-V01.md).

## Abrir la demo gratuita

Node 24+, sin instalar dependencias:

```sh
node labs/alfa-conversation/runner.mjs serve
```

Abra la URL 127.0.0.1 mostrada, elija A y escriba solo situaciones ficticias. El servidor usa puerto aleatorio y directorio temporal nuevo, sin acceso a producción. Ctrl+C lo detiene. No introducir datos reales.

1. Escriba: «Soy cantante y quiero preparar mi primer lanzamiento. Llámate Luna y usa tono informal.»
2. Pulse **Revisar contexto del turno**: vea el texto, memoria mínima, campos pendientes y huella. Nada se envía a un proveedor.
3. Pulse **Consiento esta simulación local**. La respuesta ofrece preguntas/estrategia como propuesta, no como hechos. La memoria todavía no cambia.
4. Revise antes/después, citas y huella. Pulse **Confirmo aplicar estos cambios sintéticos**.
5. Continúe: «Mi nombre artístico es Aurora Sintética. Creo canciones ficticias de pop.» Repita revisión y confirmaciones.
6. Abra «Operaciones deterministas de memoria», seleccione «Declaro titular sintético Aurora» y ejecute. Esta declaración humana ficticia no la infiere el modelo ni acredita derechos.
7. Prepare el borrador JSON y revise. Si faltan datos, la sesión sigue abierta y se muestran los campos pendientes. Las contradicciones requieren confirmar o cancelar el cambio pendiente en el panel determinista.
8. Pruebe B: «Soy emprendedor, quiero definir mi oferta. Llámate Atlas y usa tono formal.» Su memoria no contiene la de A.

Puede escribir preguntas libres sobre objetivos, audiencia o contenidos. El simulador reconoce un conjunto limitado de patrones; no pretende comprender cualquier texto. Solo propone valores ficticios de catálogo cuando encuentra evidencia textual admitida. No guarda transcripciones, nombres libres ni datos de clientes. La memoria persistente conserva el contrato cerrado de v0.1. Esta limitación de escritura es deliberada, aunque la conversación admita texto libre.

## Contratos y arquitectura

- [ConversationModelAdapter.d.ts](ConversationModelAdapter.d.ts), [contract.mjs](contract.mjs): `deos.conversation-model/1`, independiente de `deos.model-adapter/1`. Entrada validada/fijada y salida estricta. Ninguna salida contiene herramientas ejecutables o permisos.
- [conversation.mjs](conversation.mjs): único coordinador conversacional; ownership/sesión existentes, contexto mínimo, consentimientos efímeros de un uso, presupuesto y cancelación. No registra ni publica entidades.
- [simulator.mjs](simulator.mjs): clasificación por patrones y plantillas. Preguntas por actividad y campos pendientes; planes musicales, de negocio o contenido como propuestas genéricas. No razonamiento, investigación ni evaluación de un LLM.
- [openai-disabled.mjs](openai-disabled.mjs): preparación pura de body y análisis de respuestas fixture. `generate()` siempre rechaza provider_disabled. No existe interruptor para habilitarlo.
- [server.mjs](server.mjs)/[ui.mjs](ui.mjs): laboratorio loopback separado de v0.1. Errores recuperables invalidan pruebas/confirmaciones, conservan sesión y explican qué falta. Un 409 refresca el estado sin reintentar escrituras; fallo de sesión/storage bloquea y limpia información.

Se reutilizan Alfa/SyntheticStore de v0.1 y validateEntity. Propuestas no llaman a Entity Builder ni al almacén. Solo `apply` recibe consentimiento del usuario, coteja hash/revisión/sesión y aplica valores previamente validados en una escritura local serializada. El JSON administrativo se prepara por el motor determinista existente; useAuthorized=false y canonicalEntityId=null. Una corrección determinista pendiente nunca se descarta al aplicar propuestas.

## Memoria contextual y consentimiento

Contexto: actividad, tono y nombre del asistente; nombre/descripción de entidad solo ante solicitudes relacionadas. Se añaden nombres de campos faltantes (sin valores) para evitar repreguntas y hasta dos intenciones recientes enumeradas. No se incluyen actor, IDs, eventos, historial completo, derechos, ubicación, fuentes privadas ni RAG. No existe recuperación cruzada entre usuarios/entidades. El texto del turno queda temporalmente en RAM/DOM, no en disco ni logs.

Dos fronteras independientes:
1. Consentimiento del **turno exacto**: mensaje/contexto, entidad, revisión y generación, con hash y vigencia de 2 minutos. Se consume antes de despachar.
2. Consentimiento de la **propuesta exacta**: salida validada, referencia al input y revisión. Se consume antes de escribir. Cambios posteriores provocan rechazo de revisión.

Cancelar/logout aborta el intento de generación y descarta respuestas tardías, pero no revierte escrituras deterministas ya aceptadas; editar el mensaje retira la confirmación de UI. Olvidar memoria también descarta las intenciones recientes de ese ámbito. El presupuesto se conserva tras cancelar/logout. Es una demo sin identidad humana autenticada: estos hashes no son credenciales, firmas o autorización operativa. El operador local puede seleccionar A/B, como en v0.1.

## Presupuesto y límites actuales

20 intentos y 16.000 unidades reservadas por usuario/entidad durante la instancia (máximos configurables 40/32.000). Cada intento reserva bytes UTF-8 del contexto + 512 antes de ejecutar; no es un tokenizador ni medición de uso real. Timeout 1 segundo (máximo 5); no hay reintentos automáticos. Fallos/cancelaciones no devuelven reservas. Cero llamadas de proveedor y coste API cero. Reiniciar la instancia restablece presupuesto y crea otro almacén sintético: no es control de gasto distribuido.

El estado operativo vive en RAM; la memoria sintética aceptada usa los snapshots de v0.1. Sin cifrado, almacenamiento durable multiusuario, CAS multiproceso ni retención productiva. Promise.race/AbortSignal no detienen código síncrono hostil; solo adaptadores revisados. El runner bloquea red externa, credenciales heredadas y escritura fuera de un temporal propio. No es sandbox de dependencias arbitrarias.

## OpenAI Responses API: preparación, no conexión

La implementación prepara `input`, `instructions`, `text.format` JSON Schema estricto, `max_output_tokens`, `store:false`, `stream:false` y `tools:[]`. Exige un nombre de modelo explícito revisado; no elige ni contrata uno. No usa conversation/previous_response_id. El parser exige respuesta completada y rechaza refusals, salida incompleta, herramientas, JSON inválido y propuestas sin evidencia. Esquema correcto no demuestra veracidad. Referencias oficiales consultadas el 22-10-2026: [Responses create](https://developers.openai.com/api/reference/resources/responses/methods/create), [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). La referencia extensa se obtuvo en Markdown por HTTP de documentación; ninguna llamada fue a la API de modelos.

`store:false` no sustituye revisar condiciones de tratamiento/retención. Antes de activar un proveedor: autorización nueva; P0 revisados; identidad/tenant reales; consentimiento de envío; clasificación y minimización; credenciales solo servidor; reserva monetaria atómica con tarifario versionado; deadline, facturación reconciliada, modelo evaluado y egress allowlist. Sin fallback que envíe datos a otro proveedor silenciosamente. Coste/precio/modelo óptimo: no evaluados. Diseñar presupuesto económico no equivale a demostrarlo contra API real.

## Verificar

```sh
node labs/alfa-conversation/runner.mjs test
node labs/alfa-conversation/runner.mjs demo
```

Prueba de Chromium opcional con Playwright ya instalado:
`node labs/alfa-conversation/browser-check.mjs RUTA_ABSOLUTA_A_PLAYWRIGHT/index.mjs`.

[Resultados y límites](VALIDATION.md). CI ejecuta suite nueva, demo, dependencias de v0.1/#84 y núcleo congelado. La demo automatizada simula consentimiento para reproducibilidad; no aplica propuestas ni representa aprobación humana.

Sin datos reales, Vault, IDs, publicación, merge, despliegue, voz, MCP/A2A o agentes externos. Los P0 permanecen abiertos. Reversión antes de integrar: cerrar borrador y detener servidor; no existen migraciones productivas. Conexión real requiere autorización separada.
