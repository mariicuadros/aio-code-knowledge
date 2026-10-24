# DEOS Assistant â€” ModelAdapter v1 laboratory

Prototipo local gratuito, con cuatro especialistas simulados y un solo orquestador. No contiene modelos reales ni SDK de proveedores. No tiene acceso al Vault, registro, contratos, derechos ni publicaciÃ³n. MCP y A2A **no estÃ¡n implementados**.

## Reproducir

Node.js **24+** y Python 3 para los gates; sin npm install, claves, cuentas ni servicios.

```sh
node labs/deos-multiagent/run-isolated.mjs test
node labs/deos-multiagent/run-isolated.mjs demo
python scripts/check_frozen_core.py
python scripts/audit_repository_integrity.py
```

El ejecutor elimina las variables heredadas salvo las necesarias del sistema, concede lectura Ãºnicamente al laboratorio y al recuperador puro existente, deniega escrituras/subprocesos/workers mediante permisos Node y bloquea las interfaces de red probadas. No es una sandbox para plugins hostiles ni una defensa frente a cÃ³digo nativo arbitrario. Solo admite adaptadores locales revisados. Los tests no leen el RAG real: usan fixtures sintÃ©ticos.

DemostraciÃ³n visual opcional, **servir solo este directorio y solo loopback**:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory labs/deos-multiagent
```

Abrir http://127.0.0.1:8000/, ejecutar el caso ficticio, revisar las fuentes, discrepancias, trazas y hash, y pulsar la confirmaciÃ³n humana. Repetir crea otra revisiÃ³n y exige nueva confirmaciÃ³n. No servir la raÃ­z del repositorio. No es un despliegue. CSP bloquea conexiones; los mÃ³dulos se sirven localmente. La confirmaciÃ³n reconoce una revisiÃ³n sintÃ©tica: **no firma, no concede derechos, no aprueba contratos ni publica**. CLI se detiene siempre antes de aprobar.

## Arquitectura y evidencia

`fixture cerrado â†’ orquestador â†’ investigaciÃ³n â†’ creatividad â†’ gobernanza documental â†’ supervisor â†’ propuesta Ãºnica â†’ revisiÃ³n humana local`.

- [ModelAdapter.d.ts](ModelAdapter.d.ts) y [protocol.mjs](protocol.mjs): contrato independiente de proveedor, versiÃ³n exacta, validaciÃ³n de entrada/salida, citas, identidad y hash SHA-256.
- [mock-adapter.mjs](mock-adapter.mjs): especialistas intercambiables; variantes creativas outline/questions. Nunca se acepta mode=live.
- [orchestrator.mjs](orchestrator.mjs): Ãºnico propietario de secuencia, reintentos, lÃ­mites y estado de revisiÃ³n. Los especialistas no pueden invocarse entre sÃ­ ni autorizar herramientas.
- [fixtures.mjs](fixtures.mjs): catÃ¡logo cerrado. Un prefijo SYN no basta para aceptar texto externo. No se admite texto de clientes, ni siquiera marcado como ficticio.
- [demo.test.mjs](demo.test.mjs), [isolation.test.mjs](isolation.test.mjs), [public-rag.test.mjs](public-rag.test.mjs): casos adversariales reproducibles.
- [VALIDATION.md](VALIDATION.md): resultados locales, 44 pruebas y límites de verificación.
- [AUDIT-AND-DESIGN.md](AUDIT-AND-DESIGN.md): auditorÃ­a del PR #83, contrato, lÃ­mites, prÃ³ximos gates y reversiÃ³n.
- [SERGIO-UGE-PUBLIC-AUDIT.md](SERGIO-UGE-PUBLIC-AUDIT.md): trabajo documental separado; no alimenta los adaptadores ni crea identificadores.

## RAG pÃºblico preparado, separado de la demostraciÃ³n

[public-rag.mjs](public-rag.mjs) reutiliza `rag/retriever.mjs`, exige huellas SHA-256 del manifiesto/Ã­ndice y commit fijados, conserva procedencia y excluye informaciÃ³n privada, rutas fuera de allowlist e informaciÃ³n histÃ³rica. No descarga fuentes, no escribe Ã­ndices y no envÃ­a pasajes a modelos. VerificaciÃ³n manual opcional, solo metadatos pÃºblicos:

```sh
node labs/deos-multiagent/public-rag-check.mjs
```

El pin documentado corresponde a main `41c0244387f4865f9b2ebf4c4a50e4c97055974c`; el Ã­ndice declara source_commit `bcbd84fb6da6e148d9a6f9561a80ef64d5cf57f9`. Son dos referencias distintas, no una afirmaciÃ³n de actualidad. Cambios del Ã­ndice fallan hasta revisiÃ³n de un nuevo pin. La consulta devuelve evidencia de primera parte, nunca prueba reconocimiento externo.

## LÃ­mites de esta entrega

Tokens estimados de simulaciÃ³n, coste API cero, presupuestos por ejecuciÃ³n. Sin evaluaciÃ³n de LLM, tokenizador real, identidad humana autenticada, almacenamiento duradero, control distribuido de gasto o interoperabilidad remota. La aprobaciÃ³n local no es una credencial operativa. Los P0 de seguridad de backend/frontend siguen sujetos a sus auditorÃ­as; este laboratorio no los cierra ni integra PR #74/#23. No se fusiona ni despliega nada.
