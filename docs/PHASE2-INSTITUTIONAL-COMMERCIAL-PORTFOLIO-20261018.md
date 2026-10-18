# AIO CODE — Institutional & Commercial Portfolio v1
Status: **proposed editorial copy — review required before deployment**  
Date: 2026-10-18 · Phase 2 · Public-facing content only  
Source of truth: AIO-CODE-SYSTEM-SPEC-v2.md, README.md, PROVENANCE-ARCHITECTURE.md, PUBLIC-DISCOVERY-SIGNALS.md.  
Do not publish private vault, real-client evidence, agreements, unreleased music, unapproved case details, or confidential research.

## Homepage / ES

### Hero
**AIO CODE**
**Digital Entity Operating System**
**Identidad, procedencia y evidencia para creadores en la era de la inteligencia artificial.**

Desarrollamos infraestructura para que creadores, artistas y sus representantes puedan administrar identidades digitales, proyectos, obras y fuentes autorizadas, con trazabilidad y control sobre qué información se comparte.

**CTA primario:** Explorar el sistema  
**CTA secundario:** Conversar sobre un piloto

### Qué problema abordamos
Un creador puede tener perfiles, personajes, colaboraciones, obras y acuerdos repartidos en múltiples plataformas. Esa fragmentación dificulta mantener información coherente, documentar cómo se creó una obra y comprobar qué permisos están disponibles. A medida que los sistemas de IA intervienen en el descubrimiento y uso de contenido, estas necesidades se vuelven más complejas.

### Nuestra solución
AIO CODE es un **Digital Entity Operating System (DEOS)** en desarrollo, enfocado inicialmente en creadores. Conecta:
- **Identity & Entity Graph:** entidad canónica, perfiles, alias, proyectos y relaciones.
- **Evidence & Provenance:** afirmaciones documentadas, fuentes, contribuciones, versiones y uso declarado de IA.
- **Controlled Disclosure:** revisión, autorización y separación de registros públicos y privados.
- **AI Entity Intelligence:** observación documentada de cómo distintos sistemas recuperan y representan la información de una entidad.
- **Entity Console:** prototipo administrativo para crear, revisar y preparar registros de entidades.

No somos un sistema operativo para computadoras ni controlamos el funcionamiento interno de buscadores o modelos externos.

### Misión
Construir herramientas accesibles y trazables que ayuden a creadores y organizaciones creativas a administrar su identidad digital, sus obras y la evidencia asociada a sus derechos, sin perder el control sobre la información que comparten.

### Visión
Desarrollar una infraestructura interoperable para la economía creativa, donde identidad, procedencia y permisos puedan viajar con los creadores y, progresivamente, interactuar con plataformas y agentes de IA autorizados.

### Qué tenemos construido
- Modelos canónicos de entidad y relaciones, Entity Passport y estructuras JSON-LD públicas.
- Reglas de evidencia, Claim Ledger y Provenance Architecture documentada.
- Prototipo local de recuperación de fuentes públicas aprobadas (RAG).
- AI Observatory con pruebas y observaciones fechadas; baseline histórico parcial, no una garantía de visibilidad.
- Entity Console y API de entidades con pruebas locales, versiones y aprobación previa; la publicación automática, el multiusuario comercial y la verificación remota integral siguen pendientes.
- Infraestructura pública de Entity Home, sitemap, robots, llms.txt y fuentes documentadas.

**Estado:** Fase 2 — arquitectura operativa en desarrollo, pilotos y validación comercial; no se presenta como SaaS comercial terminado.

### Para quién
**Creadores y artistas:** identidad profesional, personajes, obras y contribuciones humano–IA.  
**Representantes y estudios:** relaciones entre varias entidades, autorizaciones y evidencias organizadas.  
**Agencias, disqueras y empresas creativas:** oportunidades de piloto, interoperabilidad y herramientas futuras para trabajar con catálogos y colaboradores.

### Primer caso y pilotos
**MC-001** es el caso longitudinal inicial de investigación y desarrollo. Los casos externos se incorporan con revisión de permisos; no se publicarán nombres, resultados ni testimonios sin autorización específica. La aceptación de un piloto no demuestra eficacia universal ni una relación comercial remunerada.

### Hoja de ruta
**Ahora:** identidad estructurada, evidencias, observatorio, prototipo de consola y recuperación local.  
**En desarrollo:** flujos unificados para obras, permisos, expedientes exportables y pilotos con creadores.  
**Visión futura:** credenciales portátiles, interoperabilidad con procedencia y licencias, autorización y auditoría de agentes, posibles integraciones de telemetría y compensación mediante socios.

### Alianzas y oportunidad comercial
Buscamos socios para **pilotos**, validación de casos de uso, interoperabilidad, desarrollo técnico y comercialización futura. Los posibles clientes y colaboradores incluyen representantes de talento, estudios, disqueras, plataformas creativas y organizaciones que trabajan con creadores. **No insinuar acuerdos existentes con ninguna empresa nombrada**.

**CTA:** Proponer colaboración / Solicitar información institucional

### Gobernanza y límites
La procedencia documentada no demuestra por sí sola titularidad jurídica o veracidad; ningún archivo o firma interna garantiza derechos universales. Los registros son administrados según consentimiento, confidencialidad, revisión humana y controles de publicación. No garantizamos indexación, citas, posicionamiento, recomendación, licencias aceptadas ni pagos de plataformas de IA.

### Equipo
**Fundadora y dirección de producto:** Marii Cuadros.  
**Cofundador:** Israel (describir responsabilidades técnicas concretas únicamente tras confirmar sus funciones y consentimiento para el sitio).  
**OZCU:** iniciativa desarrolladora declarada, formalización legal pendiente. AIO CODE es la marca pública principal. VOID MODE es el sistema creativo asociado para artistas.

## Homepage / EN (executive section)

**AIO CODE — A Digital Entity Operating System for Creators**

We are developing creator-focused infrastructure connecting digital identity, creative works, documented provenance, permissions, and the observation of how AI systems represent entities.

**Mission:** Help creators and creative organizations manage digital identities, works, relationships, and rights-related evidence with traceability and control over disclosure.

**Vision:** Make creator identity, provenance, and permissions more portable and interoperable across the digital creative economy, including future authorized AI-agent workflows.

**Built to date:** canonical entity records, relationship mapping, evidence standards, provenance architecture, local source retrieval, AI representation observation, and an early administrative console with review and approval controls.

**Phase 2 — in development:** creator-work and permissions workflows, pilot validation, and a path toward a secure multi-tenant product. Automatic publication, cross-platform recognition, and agent-based transactions are not implemented or guaranteed.

**Partnerships:** We welcome discussions with creators, talent representatives, creative studios, music labels, technology providers, and pilot partners.

## Proposed site information architecture

- `/` — Overview, value proposition, proof, mission/vision, partnership CTA
- `/about` — Mission, vision, founder story, governance, corporate status
- `/system` — DEOS layers and technical architecture (implemented vs roadmap)
- `/creators` — Creator-first workflows and benefits
- `/trust-rights` — Provenance and rights documentation, explicit legal limits
- `/research` — Observatory, evidence standards, methodology as internal component, archived research
- `/portfolio` — Public approved cases, results with dates and scopes, demo
- `/partners` — Partnership categories, pilot scope, contact (no fabricated logos)
- `/roadmap` — Current, in development, future
- `/contact` — Public contact channel after verification
- `/en` — English executive entry point, later full multilingual parity
- Existing `/entities/...`, `/rag`, `/checker`, `robots.txt`, `sitemap.xml`, `llms.txt` preserved.

## Implementation gates and safety

1. **No production changes in this PR.** Review and map the existing site routes and templates before editing deployment code.
2. Verify canonical `@id`, `sameAs`, public URLs and graph against current entity records; do not reassign IDs or transform relationship predicates into `sameAs`.
3. Keep JSON-LD about actual entities separate from proposed product features. Never publish mock customer cases as real.
4. Preserve the public/private boundary: no personal identities, contracts or client consent documents in the public repo without specific approval.
5. Add bilingual metadata, semantic headings, OG tags, accessible contrast, mobile navigation, sitemap entries and canonical tags during implementation.
6. Use grayscale/black/white/silver; no gold, beige, fabricated partner endorsements or stock screenshots misrepresented as product.
7. Request review before merging; run builds, link checks, structured data validation, and deployment smoke tests on an authorized preview.
8. Maintain current independent Entity Console and API labs; portfolio is public read-only and must not directly expose Vault, tokens, administrative routes or private datasets.

## Success measures
- A partner can understand **what it is, who it helps, what exists today, what comes next, and how to contact the team** in under three minutes.
- Every stated technical capability maps to a dated repository artifact or approved demo.
- No unsupported client, legal-registration, revenue, investment or platform-recognition claims.
- No private data exposure or broken canonical IDs.
