# Resultados reproducibles

Entorno local: Windows, Node v24.21.0, Python 3.12. Fecha: 2026-10-22 UTC / 21 de octubre Bogotá. Solo fixtures sintéticos en pruebas. No claves ni proveedores.

| Comprobación | Resultado |
|---|---|
| Baseline PR #83, seis pruebas originales | 6/6 PASS antes de la sustitución del contrato |
| `node labs/deos-multiagent/run-isolated.mjs test` | **44/44 PASS**, cero omitidas |
| `node labs/deos-multiagent/run-isolated.mjs demo` | PASS: cuatro mocks, propuesta completa, 0 llamadas externas, US$0 API, sin aprobación automática |
| Revisión de UI con DOM sintético | PASS: confirmación explícita, hash visible, nueva revisión invalida confirmación, cuatro roles; incluida en 44 |
| CSP estática del navegador | PASS: connect-src/form-action none, noindex, módulo local; incluida en 44 |
| `python scripts/check_frozen_core.py` | PASS: 11 blobs congelados y snapshots MC-001/AIO-001 intactos |
| `python scripts/audit_repository_integrity.py` | PASS |
| `git diff --cached --check` | PASS |
| `node labs/deos-multiagent/public-rag-check.mjs` | PASS separado de tests: hashes públicos fijados, 187 pasajes vigentes; no modelos |

El runner prueba denegación de fetch/HTTPS/socket/DNS, escritura, lectura fuera del laboratorio/recuperador permitido y subprocess. Se elimina el entorno de credenciales. No es certificación de sandbox para código arbitrario.

No se hizo prueba con proveedor real, MCP/A2A, usuario autenticado, datos de clientes, Vault, publicación o registrador. La UI se validó en DOM sintético y mediante CSP estática; no se afirma prueba visual en un navegador real. El conteo de tokens es estimado/simulado, no una medición de un modelo.

Las observaciones públicas de Sergio/HF son una auditoría de lectura independiente, documentada en SERGIO-UGE-PUBLIC-AUDIT.md; no son fixtures ni pruebas contra servicios reales.

Los resultados de CI corresponden al SHA mostrado por GitHub en el borrador. Un CI verde no cierra los P0 abiertos ni autoriza integrar/desplegar.
