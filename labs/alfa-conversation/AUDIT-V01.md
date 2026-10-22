# Auditoría previa: ALFA v0.1 → v0.2

2026-10-22. #85 a135ce2a0cbf85f11f570e3cbb85c21547f44c8b y #84 ba5b490d4c1e2a81aa6a030e269017c9f541a9aa verificados abiertos/draft/no fusionados. Rama apilada sobre #85. No modificar ModelAdapter v1 ni su catálogo.

## Guion de pruebas manuales Luna/Atlas

Estos pasos pueden repetirse en el navegador con `node labs/alfa-core/runner.mjs serve`. Evidencia observada: recorrido equivalente ejecutado en Chromium mediante browser-check.mjs antes de implementar v0.2, resultado PASS. No se atribuye a una persona una revisión manual que no ha realizado; aceptación manual humana pendiente.

| Paso manual | Resultado observado en v0.1 |
|---|---|
| Iniciar A; Soy cantante; Llámate Luna; Háblame informal | Luna, tono informal y preguntas de nombre artístico/música |
| Nombre Aurora Sintética, descripción pop y titular sintético | JSON válido, sin canonicalEntityId ni useAuthorized |
| Preparar y confirmar revisión del JSON | Reconocimiento local; ninguna publicación |
| Háblame formal → confirmar cambio → Olvida el tono | Cambio provisional, confirmación explícita y borrado del valor |
| Logout/login A | Recupera Luna y memoria guardada; tono borrado no reaparece |
| B: emprendedor, Atlas, formal, proyecto Horizonte | Memoria independiente; no contiene Aurora |
| Error 409 / respuesta de view retenida tras logout | Se bloquea revisión / no repuebla memoria |

## Hallazgos

- core.mjs distingue seis actividades pero solo entiende frases exactas del catálogo. No interpretación abierta ni modelo real.
- ui.mjs oculta toda la sesión para errores recuperables como campos incompletos, contradicciones o frase desconocida. Obstáculo al recorrido: no debería requerir reinicio.
- Memoria persiste por usuario/entidad; no debe enviarse completa a un modelo. events, rightsHolder y claves de usuario no son contexto necesario para sugerir preguntas.
- ModelAdapter v1 acepta únicamente fixtures cerrados y debe permanecer intacto. Crear ConversationModelAdapter/1 distinto, con contexto seleccionado, límites, consentimiento y salida no ejecutable.
- Entity Builder y validateEntity son deterministas. Un modelo propone campos de un catálogo sintético; solo una aprobación humana exacta puede solicitar su aplicación por la ruta determinista existente.
- Auth A/B simulada, almacenamiento sin CAS multiproceso, consentimiento no autenticado: bloqueos de integración real. P0 #74/#80/#81 y frontend #25 no cerrados. Vault y datos reales excluidos.

## Alcance previsto

Nuevo laboratorio labs/alfa-conversation reutiliza sesiones/almacén/validador de v0.1 mediante composición, sin modificar sus archivos. Chat admite texto libre local efímero: no persiste texto arbitrario ni lo envía fuera. Simulador por reglas, no razonamiento real. La memoria persistente conserva exclusivamente valores sintéticos ya admitidos por v0.1.

Consentimiento por turno: vista previa exacta del mensaje/contexto seleccionado y hash; aceptar antes de simular. Propuestas independientes, esquema estricto, evidencia textual y consentimiento por propuesta/revisión; nada de tools del proveedor ni escritura automática. Errores recuperables conservan conversación/sesión pero invalidan confirmaciones obsoletas.

OpenAI: adaptador desactivado sin transporte, claves, SDK o lectura de env. Solo prepara body Responses API y valida fixtures de respuesta. Activación requiere nueva autorización y controles de privacidad/budget/identidad independientes.
