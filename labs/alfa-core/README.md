# ALFA CORE v0.1 — capacidad adaptable de DEOS

Prototipo **local, sintético y determinista** para evaluar el recorrido mínimo antes de la presentación de Dubái. No es razonamiento de un LLM. No registra ni publica entidades. Dependencia explícita del [PR #84](https://github.com/mariicuadros/aio-code-knowledge/pull/84), fijado en `ba5b490d4c1e2a81aa6a030e269017c9f541a9aa`; no se presume fusionado.

## Ejecutar sin instalar dependencias

Requiere Node 24+. Desde la raíz de esta rama:

```sh
node labs/alfa-core/runner.mjs serve
```

El lanzador muestra un directorio **temporal nuevo exclusivamente sintético** y una URL `http://127.0.0.1:PUERTO`. Abra esa URL, elija A o B y pulse iniciar sesión. No sirve la raíz del repositorio, no se conecta a Entity Console, no lee archivos .env y no despliega. Ctrl+C detiene el servidor. No usar datos reales.

El catálogo está en «Frases disponibles» y en el autocompletado del cuadro de texto. Puede escribir o elegir una frase y pulsar Enviar. No es conversación abierta: las frases desconocidas se rechazan sin persistirlas. Esto evita que un prefijo ficticio permita introducir datos privados.

### Recorrido A: cantante, informal

1. `Soy cantante`
2. `Llámate Luna`
3. `Háblame informal`
4. `Mi nombre artístico es Aurora Sintética`
5. `Creo canciones ficticias de pop`
6. `Declaro titular sintético Aurora`

Las preguntas evolucionan según lo que falta. Preparar borrador muestra el JSON validado, cambios de un nuevo borrador y huella exacta. Confirmar la revisión solo reconoce el borrador sintético: no equivale a consentimiento de publicación ni aprobación jurídica.

Para corregir: `Háblame formal`, revisar la contradicción y `Confirmo el cambio` (o `Cancela el cambio`). Para borrar: `Olvida el tono`. Consulte con `Consulta mi memoria`. También se puede olvidar cada campo o toda la memoria. Cierre sesión y vuelva a iniciar A: los valores conservados se recuperan automáticamente, sin editar archivos.

### Recorrido B: emprendedor, formal

`Soy emprendedor` → `Llámate Atlas` → `Háblame formal` → `Mi proyecto es Taller Horizonte Ficticio` → `Desarrollo proyectos ficticios` → `Declaro titular sintético Horizonte`.

B empieza sin datos de A. A dispone además de una segunda entidad sintética para comprobar separación por entidad. Cambiar el perfil de usuario cierra la sesión actual. El selector A/B **no es autenticación real**: cualquier operador local puede elegir ambos perfiles; las pruebas demuestran aislamiento de sesiones/ownership, no seguridad multiusuario en producción.

## Pruebas y demo reproducible

```sh
node labs/alfa-core/runner.mjs test
node labs/alfa-core/runner.mjs demo
python scripts/check_frozen_core.py
python scripts/audit_repository_integrity.py
```

La demo automática usa dos perfiles, cierra sesión y reconstruye el motor/almacén para demostrar recuperación desde disco; no fabrica una confirmación humana. Cada ejecución del lanzador crea un directorio nuevo. Las sesiones dentro de la misma instancia comparten su almacenamiento sintético; reiniciar el lanzador empieza otra demo limpia. No existe selector de rutas ni recuperación de archivos reales.

Prueba opcional de navegador, sin instalar paquetes: `node labs/alfa-core/browser-check.mjs RUTA_ABSOLUTA_A_PLAYWRIGHT/index.mjs`. Usa una instalación de Playwright/Chromium ya disponible, lanza y detiene un servidor aislado, bloquea navegación externa y guarda una captura sintética en temporal. No es requisito para abrir la demo ni una dependencia de ejecución.

## Arquitectura

Navegador → sesión opaca local y origen exacto → motor de conversación → almacenamiento por usuario/entidad → Entity Builder puro → `validateEntity` existente → vista previa y revisión humana local.

- `catalog.mjs`: únicos valores/frases ficticios aceptados, seis actividades y validación de memoria.
- `core.mjs`: preferencias expresadas/confirmadas, contradicciones, progreso, ownership, expiración, borrador y binding a sesión/entidad/revisión/acción/SHA-256.
- `store.mjs`: snapshots JSON por usuario y entidad, revisión optimista y cola de un solo proceso; escritura temporal y rename. No reutiliza VaultStore ni LocalStore administrativos.
- `server.mjs`: solo loopback, cookie HttpOnly/SameSite=Strict, origen/Host exactos y límites de cuerpo. Sin endpoints de publicación, registrador o Vault. Cookie sin Secure únicamente por HTTP loopback; no apta para despliegue.
- `ui.mjs`: invalida generaciones de sesión, cancela requests en logout y bloquea ante errores/409. Un cierre no confirmado exige reintento antes de login.
- `runner.mjs` y `offline.mjs`: proceso sin variables de credenciales, lectura acotada, escritura solo en el directorio temporal creado, subprocesos/workers denegados y red externa bloqueada. Las pruebas HTTP solo habilitan el puerto de su propio servidor sintético.

Entity Builder mapea una actividad individual a person y una organización explícita a organization. No deduce constitución societaria por decir «emprendedor». Usa campos del contrato actual; derechos declarados sintéticos no verificados, `useAuthorized=false`, `locationAuthorized=false`, `publicFields=[]`, `canonicalEntityId=null`, sin ENT ID. `lastReviewed` es fecha fija del fixture, no constancia jurídica.

Cada preview reutiliza el orquestador ModelAdapter v1 con un fixture independiente. Sus trazas y coste cero se muestran como **simulación separada**; no recibe conversación ni memoria, ni se afirma que construyó el JSON. Futuras adaptaciones necesitan un contrato nuevo/revisado que autorice contexto tipado y minimizado: no abrir el catálogo cerrado de #84 mediante un bypass.

## Memoria, privacidad y límites

Memoria, borrador administrativo y RAG público son dominios distintos. Aquí solo existe el primero sintético y una preview en memoria del segundo; no se escribe un expediente ni se indexa nada. Preferencias guardan valor y origen expressed/confirmed, evento, actor y secuencia. El historial registra la acción/campo, no valores antiguos ni transcripción. Borrar elimina el valor del snapshot, propuestas pendientes y nuevas previews; no promete borrado forense del disco ni de capturas externas.

No se infieren diagnósticos, rasgos sensibles o capacidades cognitivas. Lo provisional queda pendiente y no se convierte en registro canónico. La revisión se consume una vez; cualquier cambio/conflicto/logout la invalida. No es recibo durable autenticado ni autoridad operativa.

Almacenamiento local sin cifrado, sin CAS multiproceso, sin HA, backups o migración. Un archivo temporal residual tras fallo puede bloquear la escritura de forma segura; no se repara automáticamente. Sesiones de 15 minutos, hasta 50 activas, hasta 1.000 eventos por ámbito. Datos solo ficticios. El bloqueo de red es defensa de código revisado, no sandbox de JavaScript hostil arbitrario.

**Integración real BLOQUEADA** hasta resolver los P0 y añadir identidad/tenancy, storage privado apropiado, consentimiento y revisión en servidor. No conectar Vault, datos reales, proveedores, voz, redes sociales, copyright, MCP/A2A o agentes externos sin nueva autorización.

Auditoría previa: [INTEGRATION-AUDIT.md](INTEGRATION-AUDIT.md). Evidencia: [VALIDATION.md](VALIDATION.md). Reversión: cerrar el borrador, detener la demo; no hay migración ni efectos externos que revertir. No fusionar #84 ni otros PR para usar esta rama local.
