# AIO CODE — piloto de desambiguación de entidades (propuesta v0)

**Fecha:** 2026-09-24  
**Estado:** diseño experimental; sin resultados, baseline ni intervención ejecutada.  
**Entidades iniciales:** MC-001 (persona), AIO-001 (metodología), NUX-001 (entidad creativa digital).

## Hipótesis verificable

Una representación pública coherente de nombre, enlaces oficiales y relaciones explícitas puede ayudar a que sistemas externos distingan estas entidades. El efecto sobre sistemas de terceros es una hipótesis: solo el Observatory puede registrar sus respuestas; no inferir mecanismos internos ni prometer reconocimiento.

Los términos «Agentic Entity Framing» y «Scoped AI Identity» se tratan como etiquetas de trabajo, no como estándares adoptados por AIO CODE. Identidad pública y permisos para actuar en nombre de una persona son asuntos distintos.

## Activos existentes

- Pasaportes canónicos y grafo de relaciones en `entity/` y `entity-graph.json`.
- Reglas de no fusión en `entities/marii-cuadros/technical/schema/disambiguation.json`.
- JSON-LD de MC-001 en `entities/marii-cuadros/technical/jsonld/marii-cuadros.jsonld` y otro grafo en `schemas/person-schema.json`.
- Observatory, Prompt Registry y Recognition Rubric v1.

Antes de publicar más marcado, comprobar la URL de la página canónica de MC-001 y elegir una política única de `@id`: los dos JSON-LD actuales usan URI distintas para MC-001. Resolver también quién controla y verifica cada URL antes de añadirla a `sameAs`. El ID `MC-001` es interno a AIO CODE; repetirlo fuera de sus propios registros no obliga a plataformas a adoptarlo.

## Diseño del ensayo

1. Congelar la versión del Prompt Registry y el conjunto de entidades y claims esperados según pasaportes y Claim Ledger. No tratar el contenedor `ai-social-baseline.json` vacío como baseline.
2. Preparar preguntas neutrales: identidad de Marii; autoría de AIO CODE; relación entre Marii y NUX; identificación con variantes de nombre observadas; preguntas sin evidencia. Incluir ES/EN. No inventar homónimas reales ni publicar afirmaciones sobre terceros sin fuente.
3. Registrar por pregunta, sistema y repetición: fecha, entorno, sesión, acceso a búsqueda, respuesta completa, citas, fuentes y confusores, siguiendo `OBSERVATORY-PROTOCOL-v1.md`.
4. Evaluar por separado resolución, desambiguación, atributos, relaciones y citas con `RECOGNITION-RUBRIC-v1.md`. Reportar aciertos sobre ejecuciones comparables y conservar errores y abstenciones.
5. Si existe una medición anterior comparable, registrar como intervención una corrección verificable de una página o relación oficial (`INT-*`), con URL, commit, fecha de publicación y fecha de rastreo si se conoce. Repetir el mismo protocolo tras la intervención y describir el cambio observado sin atribuir causalidad automática.

## Salida útil

Una ficha de confusión por entidad: consulta, entidad esperada, entidad observada, prueba citada, tipo de mezcla, fecha y acción corregible. Priorizar enlaces oficiales erróneos, relaciones incorrectas y `sameAs` ambiguos. Publicar solo hallazgos observados y aprobados para difusión.

## Futuro: agentes que realizan acciones

Si AIO CODE ofrece después tareas o transacciones mediante agentes, diseñar por separado: principal, agente autorizado, acciones permitidas, recursos, duración, revocación, autenticación y registro de acciones. Un pasaporte público o JSON-LD no constituye autorización; no incorporar permisos, secretos ni mandatos operativos en la ficha pública de identidad.

## Puerta de decisión

Ampliar a búsqueda semántica, Vercel AI SDK o un producto para agentes solo cuando la ficha muestre fallos repetibles y una solución concreta que el prototipo actual no cubra. No usar un score comercial global hasta cumplir la calibración exigida por la rúbrica.
