# DEOS Assistant · Laboratorio de orquestación interoperable (100 % sintético)

**Estado:** prototipo aislado para mostrar arquitectura. **NO es un agente con IA real conectado, no tiene capacidades autónomas ni opera en producción.**

## Ejecutar por US$0

Se requiere Node.js 20+; no hace falta instalar dependencias, claves API, cuentas ni membresías.

```bash
node --test labs/deos-multiagent/demo.test.mjs
node labs/deos-multiagent/demo.mjs
```

Todas las entradas tienen prefijos `SYN-CASE-` y `SYN-SRC-` y solo se aceptan URLs `https://example.invalid/...`. No se debe usar información de clientes reales. No hay red, lectura de secretos, escritura de archivos, publicación, registrador ni acceso al Vault. El resultado declara `model_calls: []`, `provider_calls: 0`, `api_cost_usd: 0`, `canonical_entity_id: null`.

### Interfaz visual (local y gratuita)

Desde la raíz del repositorio, iniciar un servidor local sin servicios externos:

```bash
python -m http.server 8000
```

Abrir `http://localhost:8000/labs/deos-multiagent/` y pulsar **Ejecutar ejemplo ficticio**. El navegador carga únicamente módulos del mismo servidor local; el CSP bloquea conexiones externas, recursos de terceros y formularios. No hay campos para introducir datos reales.

## Una interfaz; especialistas separados

```text
DEOS Entity Console (futuro, no conectada a este laboratorio)
    ↓
DEOS Assistant: ORQUESTADOR / agente supervisor [MOCK]
    ├── Research Agent  [MOCK]                 → fuentes, homónimos, contradicciones
    ├── Creative Agent  [MOCK]                 → borradores de contenido
    └── Governance Engine [REGLAS]            → permisos y revisión documental
    ↓
Respuesta conjunta con trazas y referencias sintéticas
    ↓
Revisión humana obligatoria. NO firma, NO ID canónico, NO publicación.
```

El orden concreto de ejecución del demo es `research → creative → governance → supervisor`. **Los rótulos OpenAI, Gemini y Meta son posibles proveedores FUTUROS, no llamadas existentes.**

| Rol | Motor presente | Futura posibilidad | Privilegios actuales |
| --- | --- | --- | --- |
| Supervisor | Mock determinista | OpenAI u otro modelo | Solo sintetiza |
| Investigación | Comparación sintética | Gemini o alternativa económica + búsqueda aprobada | Solo lectura ficticia |
| Creatividad | Plantillas simuladas | Modelo elegido por calidad/costo | Solo borradores |
| Gobernanza | Reglas deterministas | Backend DEOS + IA solo como apoyo documental | Nunca certifica derechos ni aprueba registros |

## Vocabulario arquitectónico

- **Orquestación multiagente:** coordinación de especialistas que comparten un contrato de trabajo.
- **Arquitectura multimodelo / model-agnostic:** diferentes proveedores pueden cubrir roles distintos, sin acoplar el DEOS a uno solo.
- **Interoperabilidad:** interfaces versionadas para cambiar o añadir modelos, sistemas y herramientas.
- **RAG:** recuperación de fuentes aprobadas antes de generar respuestas. El RAG real de DEOS NO está conectado a este laboratorio.
- **MCP (futuro):** estándar para exponer herramientas/datos autorizados a agentes.
- **A2A (futuro):** protocolo para interacción entre agentes de sistemas distintos.
- **Human-in-the-loop:** la revisión y los permisos los determina DEOS, no el modelo.
- **Provenance / trace:** cada afirmación debería tener origen y cada acción un recibo auditable.

Ni MCP ni A2A están implementados aquí. Que varios proveedores reciban respuestas coordinadas por DEOS no equivale a afirmar que dichos proveedores se comunican entre sí directamente.

## Qué demuestra y qué NO demuestra

Demuestra forma de datos y roles, detección determinista de años contradictorios, un solo resultado de cara al operador, borradores, trazas y bloqueo de publicación. Las fuentes son sintéticas: **ninguna afirmación está contrastada en Internet**. No evalúa razonamiento de un LLM, calidad de hallazgos, seguridad de proveedores reales ni indexación externa.

La parte documental organiza permisos, consentimientos y registros; **no presta asesoría legal, no sustituye abogados, no determina titularidad de derechos y no certifica cumplimiento legal**.

## Antes de conectar APIs reales

1. Mantener abiertos los P0 de backend y frontend: PR backend #74, #80, #81 y frontend #25. El asistente no puede saltarse sus barreras con herramientas de escritura.
2. Definir un contrato neutral de `model-adapter`: datos permitidos, rol, esquema de resultado, fuente, errores, coste, presupuesto máximo, trazas, expiración y versión.
3. Implementar primero lectura pública y RAG aprobado, no Vault privado ni herramientas de publicación.
4. Evaluar proveedores con casos ficticios y controles de salida. No enviar documentación privada ni datos personales a niveles gratuitos sin revisar tratamiento de datos, términos y consentimientos.
5. Si se aprueba una prueba pagada, exigir límite de gasto y credenciales solo en servidor. No activar costes implícitamente.
6. Examinar prompt injection, afirmaciones sin fuente, homónimos, fallas de abstención, reintentos, doble gasto y desconexiones.
7. Solo después conectar operaciones de entidades con revisión y firmas humanas demostradas.

## Sergio / UGE

La página editorial pública no garantiza indexación ni sustituye registro canónico. El PR #77 mantiene tres candidatos diferentes: Sergio persona, Sergio Impulsa S. L. organización y UGE proyecto, sin ID. El índice RAG fijado mantiene 189 pasajes, sin la fuente editorial de Sergio; Hugging Face requiere auditoría de filas y revisión. **Este laboratorio no procesa esos datos ni los publica.**

## Integración / reversión

El laboratorio vive exclusivamente bajo `labs/deos-multiagent/`; no importa el backend, no toca producción, PR del registrador, entidad real, RAG, HF ni configuración de Vercel. Revertir implica cerrar el PR en borrador; no existe migración de datos.
