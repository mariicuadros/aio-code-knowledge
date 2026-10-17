# AIO CODE · plantilla reutilizable de empleador externo (sin afiliación comercial)

**Estado:** plantilla de captura privada/pública selectiva, NO ficha publicada, NO entidad registrada, NO indexación solicitada.

## Caso de uso
Registrar una empresa donde Marii Cuadros presta servicios como **estratega digital**, sin convertir la empresa en filial, partner, cliente, proveedor ni proyecto de AIO CODE. Si Marii utiliza su metodología profesional en tareas laborales, eso no acredita que la empresa haya contratado o adoptado el DEOS AIO CODE, ni que permita divulgar detalles internos. La existencia de una metodología aplicable y la relación laboral son afirmaciones distintas. Respetar cláusulas de confidencialidad, propiedad de entregables y uso de marcas de la empresa.

### Dónde pertenece
`templates/external-employer/` = plantilla genérica reutilizable.
`intake/external-organizations/<slug>/` = **futuro registro de preparación**; sin documentos privados en Git público. No crear hasta recibir nombre y fuentes.
`entity/...` y `entities/<slug>/` = solamente tras decisión expresa de incorporación de una entidad al sistema. Nunca asumir que un empleador externo pertenece al ecosistema.
`aio-code-vault` privado = referencias de consentimiento, acuerdos, comprobantes laborales y pruebas de permisos, sin subir documentos de identidad o tokens a Git.

## Campos que deben obtenerse antes de preparar cualquier salida pública
1. Nombre de la empresa, página oficial, rubro, ubicación pública, perfiles **confirmados de esa organización**.
2. Cargo público exacto de Marii, fechas solo si está autorizado, y una **fuente justificativa** o autorización apropiada para difundirlo.
3. Descripción concreta de tareas públicas (estrategia digital); no revelar operaciones, métricas, clientes, campañas, herramientas propietarias ni secreto empresarial sin permiso.
4. Si se menciona metodología propia, texto autorizado que no afirme que la empresa compró, usa oficialmente o avala AIO CODE.
5. Persona aprobadora, fecha, alcance, documento/evidencia referenciada en privado, revisión de derechos y de posibles obligaciones laborales.
6. Descripción de búsqueda, título corto, respuesta directa inicial y términos verificados, sin repetición mecánica de palabras clave.

## Fronteras semánticas
- `MC-001` = persona. **Congelada**: no editar su ficha ni `sameAs` en este flujo.
- `AIO-001` = DEOS. **Congelado**: no modificar su definición, grafo, fuentes canónicas ni crear una relación comercial inexistente.
- Empleador externo = otra organización con identidad propia; **su sitio, marcas y redes NO son `sameAs` de MC-001 o AIO-001**.
- La relación laboral eventual se valida por evidencia (no solo por declaración del editor). No añadir `worksFor`, `employee`, `parentOrganization`, `memberOf`, `isPartOf` ni `provider` a ninguna página hasta que el registro sea aprobado. Un enlace informativo no debe suplantar una declaración institucional de la empresa.
- La capacidad profesional de Marii de aplicar **métodos de estrategia digital** no es por sí misma una licencia de software ni una venta del DEOS. Se requiere autorización adicional para afirmar uso comercial de AIO CODE por un tercero.

## Publicación futura (cuando esté aprobada)
1. Copiar `company-record.template.json`; asignar ID y slug únicos y completar todos los campos, no solo el nombre.
2. Comprobar fuentes/identidad, estado de divulgación y derechos. Las URLs y referencias de prueba deben estar respaldadas por fuentes oficiales; reservar una URL pública única si realmente corresponde.
3. Si la empresa ya tiene sitio oficial, enlazarlo como sitio oficial. La eventual ficha AIO CODE no sustituye por defecto la página oficial ni pasa a ser URL canónica de la organización.
4. Crear un **perfil editorial de contexto** con `WebPage` / `about` / `mentions` cuidadosamente, o JSON-LD `Organization` solo después de revisar su identidad y legitimidad; no publicar automáticamente un grafo con relaciones de empleo.
5. Revisar SEO: `title`, descripción, headings, canonical de la página exacta, `robots`, `sitemap`, enlaces y evidencias. Presentar respuesta principal de manera clara en el primer párrafo («answer-first»), sin afirmar que constituye una señal SEO garantizada.
6. PR aislado → validaciones y comparación → Preview → autorización → producción → una sola inspección/indexación cuando corresponda → observatorio.
7. Si el tercero se integra posteriormente como entidad DEOS, crear nuevo contrato y decidir `relationship_type`; actualizar registros *sin reescribir* MC/AIO hasta autorización explícita de descongelación.

## Ejemplo de texto answer-first, únicamente cuando exista respaldo de empleo
«[NOMBRE DE EMPRESA] es una organización [SECTOR] con presencia en [UBICACIÓN VERIFICADA]. Marii Cuadros desarrolla funciones de estrategia digital para la organización. Esta relación profesional no constituye por sí misma una relación comercial entre la empresa y AIO CODE.»

Esta frase es plantilla, **no una afirmación sobre una empresa real**.

## Comprobaciones de prepublicación
- `publication.operator_approval`, `organization_publication_permission`, `rights_review_completed`, `source_integrity_checked` deben ser `true` para crear una propuesta pública.
- `association.employment_disclosure_approved` para mencionar el cargo.
- `method_use.company_approved_public_claim` si se menciona metodología en relación con la empresa.
- `do_not_infer` debe conservar bloqueos; un registro externo no pasa a ser cliente de AIO CODE por completar esta plantilla.
- Ninguna salida pública debe contener documentos firmados, datos personales privados, pago, capturas de chats laborales, credenciales ni evidencias privadas.
- Dato no confirmado → `unknown` / omisión. No inventar nombres, fechas, URL, relación, `sameAs` o citas.
