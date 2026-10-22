# Evidencia ALFA v0.2

Fecha: 2026-10-22. Node 24.21.0 / Windows. Datos, almacenes y respuestas de proveedores exclusivamente sintéticos.

- Auditoría previa: v0.1 a135ce2, recorrido equivalente al guion manual Luna/Atlas ejecutado en Chromium antes de cambios, PASS. El guion está en AUDIT-V01.md; aceptación manual humana pendiente.
- `node labs/alfa-conversation/runner.mjs test`: **21/21 pruebas PASS localmente** de contrato/contexto, ownership, consentimiento por turno/propuesta, alucinaciones, inyección, derechos/IDs denegados, correcciones pendientes, borrado contextual, presupuesto, cancelación/timeout y HTTP loopback. Resultado final debe cotejarse con CI del commit del PR.
- `node labs/alfa-conversation/runner.mjs demo`: dos objetivos ficticios y propuestas distintas, sin aplicarlas, cero llamadas/coste de proveedor.
- `browser-check.mjs` con Playwright ya instalado: PASS en Chromium para Luna/Atlas, conversación libre, consentimiento exacto, separación propuesta/escritura, campos incompletos y contradicciones sin reinicio, corrección, revisión JSON, edición que invalida consentimiento, cancelación y logout. Sin errores de página. No se instaló ninguna dependencia.
- Núcleo congelado: PASS, 11 archivos y snapshots MC-001/AIO-001.
- Integridad estructural del repositorio: PASS.

CI nuevo ejecuta 21 pruebas de conversación, demo, 12 regresiones de ALFA v0.1, 44 de ModelAdapter v1 y ambos gates. El workflow general del repositorio también se mantiene. El navegador se prueba localmente, no se instala en CI. Resultados remotos vinculados al SHA final en el cuerpo del PR.

La suite prueba que no se llama al adaptador antes de consentimiento/reserva y que cambiar revisión invalida la propuesta; que una cita inventada/ID canónico/herramienta no se acepta; que solo se recupera memoria del ámbito autorizado y no derechos/eventos/IDs; que la salida tardía no habilita aplicación; que una llamada fallida mantiene su reserva tras logout; y que el adaptador OpenAI no puede activarse por configuración.

Fallos de desarrollo corregidos: cierre sintáctico del esquema JSON Schema; el primer recorrido de navegador intentó operar un panel cerrado, corregido abriendo su summary como haría el operador. No se relajaron validadores. Se añadió metadata de campos faltantes para evitar preguntar por campos existentes sin transmitir sus valores.

**No probado/no implementado:** razonamiento real, evaluación de calidad de un LLM, acceso/credenciales/costes reales, reconocimiento externo, RAG conectado, identidad humana/tenancy productivos, storage distribuido, eliminación forense, MCP/A2A, registro o publicación. Un input libre puede ser ambiguo o negado: los patrones no comprenden toda semántica; por eso sus resultados son propuestas con evidencia y revisión humana, nunca hechos.

Los tests/CLI usan consentimiento simulado para automatización. UI exige botón humano pero no autentica identidad humana real. OpenAI solo tiene preparación/parsing offline; nunca se llamó a api.openai.com. Documentación oficial se consultó mediante GET sin claves. P0 pendientes no cerrados.
