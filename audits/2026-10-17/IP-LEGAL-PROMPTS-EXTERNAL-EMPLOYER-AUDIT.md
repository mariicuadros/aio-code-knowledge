# AUD-DEOS-20261017-002 · IP, trazabilidad, preguntas, answer-first y empresas externas

**Fecha:** 2026-10-17. **Estado:** inspección del código y documentos existentes; auditoría complementaria al expediente AUD-DEOS-20261017-001. No es una opinión legal ni un certificado de titularidad intelectual.

## 1. Propiedad intelectual y derechos: inventario existente
- `governance/IP-AND-CONTENT-RECOVERY-v1.md` distingue la persona (nombre, imagen, voz), AIO CODE (software, esquemas, investigación, nombre), VOID MODE (obras, música, guiones, personajes), derechos de terceros y código/licencias abiertas.
- `governance/ip-asset-register-v1.csv` registra cuatro filas base: MC, AIO, VOID y futuros materiales de terceros, pero conserva `legal_rights_holder=unconfirmed` y `review_status=needs_review` en activos principales. **No hay prueba integral de titularidad, registro marcario o cadena de cesión de todas las obras.**
- `legal/ownership.md` declara la autoría dentro del proyecto y distingue Twin MC-001 como representación de MC-001, NUX como entidad narrativa distinta y OZCU como empresa/venture declarada sin formalización acreditada. Esa declaración es una fuente de primera parte, no un registro oficial de autoría, cesión ni persona jurídica.
- `legal/RIGHTS-PROVENANCE-v1.md` separa imagen, edición, transformaciones, voz, clonación, modelos de identidad, publicidad pagada y sublicencia.
- `legal/rights-registry.json` indica para DAN-001: `signing_reported_by_administrator_pending_private_evidence_match`. **La firma fue comunicada pero versión y soporte privado todavía no están cotejados**; no elevar a `executed_active` sin validación. La licencia del fotógrafo sobre las imágenes requiere revisión por activo.
- `legal/policies/PARTICIPANT-DATA-HANDLING-v1.md` prohíbe difusión de documentos firmados, firmas, identificaciones, biometría, datos privados y pruebas de firma. No es un sustituto de una evaluación profesional para operaciones comerciales o disputas.

### Brechas IP/documentales
P0: listar por obra autor humano, contribución IA y terceros, origen, primer uso, hash SHA-256, titular declarado vs titular verificado, permisos, plazo, territorios, usos y enlace de evidencia privada.
P0: reconciliar DAN consentimiento/revisión exacta y derechos fotográficos con el Vault; dejar `unknown` hasta completar.
P1: revisar licencias de dependencias y plataformas, contrato laboral y propiedad de entregables antes de divulgar trabajo de un empleador o usar sus marcas.
P1: `governance/ip-asset-register-v1.csv` mantiene el término legado `brand_and_methodology` para AIO; actualizar solo en release canónica aprobada, no en este corte de congelación.

## 2. Sistema de trazabilidad: qué puede demostrar y qué no
**Implementado como arquitectura:**
- Fuente pública Git versionada + commits, árboles y fechas.
- Vault privado con expedientes de Entity Console, revisiones inmutables y operaciones; no se publican datos del expediente.
- `brain/contracts/brain-record-v1.schema.json`: siete contratos operativos; `brain/ledger.py` valida IDs, evita sobrescritura y exige `visibility=private`.
- Provenance con referencias, fecha/archivo fuente y SHA-256, cuando existe; `claim-ledger.json` conserva estado de evidencia.
- Bitácoras semanales, observatorio, intervenciones, revisiones de API, manifests y pruebas CI.
- Control de cambios congelado MC/AIO integrado en main (check no garantiza rama protegida mientras GitHub `main.protected=false`).

**No demostrado universalmente:** que todos los documentos tengan archivo original/hash y titular acreditado, que todos los contratos estén completados, que cada publicación corresponde a un sello de tiempo validado externamente, que cada PR fue desplegado, que existe registro o protección legal automática, o que todas las lecturas AI citan fuentes. Un commit o hash prueba principalmente existencia de una versión e integridad comparativa, no propiedad o verdad.

### Cadena de custodia/reproducción requerida
`entity_id → claim_id → evidence_id → original_asset_ref (private/public) → sha256 + creation/capture time → legal/right scope → revision approved → PR + commit → preview → authorized deployment SHA → published URL → crawl/AI observation (with timestamp and session parameters)`.
Verificar cada eslabón; no usar uno posterior para inferir el anterior.

## 3. Prompts, respuestas exactas, answer-first y keywords
- `prompt-registry-v1.json`: **16** consultas congeladas para baseline v1 (identificación, relación, desambiguación, conceptos, fuentes y recomendación), enfocadas en MC/AIO. No sobrescribirlas; crear versiones nuevas por entidad.
- `rag/answer-policy-v1.json`: **8** claims de respuesta textual revisada (AIO, MC, NUX, VOID, OZCU, sus relaciones/límite legal), correspondencia de pregunta normalizada exacta, fuente aprobada y abstención. Esto no es generador universal ni garantía de hallazgo por tercero.
- `rag/corpus-manifest-v0.json`: las 18 fuentes permitidas aún omiten pasaporte DAN-001 y `public-assets-v2.json`. El corpus puede contener menciones DAN en el grafo, pero **no una cobertura comparable a MC**. Preparar su inclusión tras revisión, regeneración de índice y pruebas de rechazo a homónimos.
- `api/answer.mjs` está desactivado por defecto, protegido y genera borradores que requieren revisión; no afirmar que publica contenido.
- **Answer-first editorial:** no existe como registro versionado de prueba obligatorio para nuevas entidades. Nueva plantilla exige respuesta directa inicial corta, fuente y estado, separada de optimizaciones de buscadores; sin palabras clave repetidas ni promesa de AI Mode.
- **Keywords:** `keywords`, `jobTitle`, `description`, aliases, `sameAs` y `officialUrls` cumplen roles distintos; no se pueden propagar entre entidades. Los términos deben estar sustentados por fuentes, no convertir palabras clave en hechos.
- `provenance/README.md` conserva frases antiguas «research and development methodology/lab» y `NUX fictional narrative universe/subordinate entity`. Contradicen la semántica vigente de `legal/ownership.md`/DEOS. **No corregir en este release** porque implicaría representación AIO/MC congelada; abrir propuesta separada después de aprobación.
- `mariicuadros/marii-cuadros/README.md` igualmente conserva definición principal metodología. Ya registrado en AUD-001 como contradicción pública pendiente, no cambia la clasificación vigente.

## 4. Empleador independiente
La empresa externa donde MC-001 desempeñe un cargo profesional **no se vuelve** cliente, subsidiaria, marca, miembro, `sameAs` ni entidad oficial de AIO-001. La afirmación de que Marii desarrolla estrategia digital con metodologías profesionales tampoco significa que el empleador haya comprado/adoptado el DEOS.

Se prepara `templates/external-employer/company-record.template.json` y `discovery-prompts.template.json` para futuros casos. El registro permanece `draft_unverified` y no publica datos reales hasta aportar: nombre, URL oficial, industria, autorización para citar la relación laboral, permisos sobre metodología/marca, fuente verificable, revisión de derechos y aprobación humana.

**No basta cambiar el nombre:** cada organización requiere ID nuevo, URL propia, fuentes, cargos, relaciones y permisos revisados. Solo la estructura de los archivos es reutilizable. El contrato privado/empleo no se sube a Git.

## 5. Errores manuales pendientes
1. Revisar en GitHub Rules la protección de `main` y exigir el check (aún reportado no protegido).
2. Cotejar documentos/consentimiento DAN y autorizaciones de fotos en privado. No mostrar ni subir IDs o firma a GitHub público.
3. Para empleador futuro obtener nombre, página oficial, sector, descripción verificada, cargo exacto publicable y permiso de empleador para aludir a empleo y metodología; verificar cláusulas de confidencialidad y PI de entregables.
4. Confirmar si se autoriza en forma pública el rol de MC-001 sin tocar su Entity Home hasta que se levante la congelación; si hay duda, dejar ficha interna, no indexable.
5. No pedir indexación si no existe URL pública aprobada y verificada con HTTP/canonical/robots/metadata.
6. No usar meta keywords como sustituto de fuente, ni afirmar relación comercial con AIO por el empleo de la creadora.

## 6. Orden propuesta
P0: branch protection + derechos/provenance reales y control de privacidad.
P1: intake externo independiente + copy answer-first + tests + aprobación.
P1: RAG DAN y prompt-registry v2 separados; revisar `answer-policy` con fuentes.
P2: generación automática de paquete público para nuevas entidades aprobadas sin escribir en MC/AIO ni activar indexación automática.

## 7. Confirmación sobre Twins
La declaración vigente en `legal/ownership.md` dice que **Twin MC-001 es una representación de MC-001, no una persona canónica aparte**. No hace falta volver a preguntar por esa definición; la tarea pendiente es contrastarla con otras rutas y documentar su consistencia, sin transformarla unilateralmente en otra entidad.

**Límite:** revisión por lectura de código y metadatos; no se cotejaron originales completos de derechos, contratos ni copyright registrations de terceros. AIO CODE conserva prueba de autoría declarada, cambios, trazabilidad y procesos, pero no emite por sí mismo certificaciones legales.
