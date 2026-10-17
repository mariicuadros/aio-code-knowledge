# AIO CODE — Propuestas de actualización pública (Fase 2)

Estado: módulo de preparación y vista previa. No publica, no abre PR y no consulta el Vault.

## Límites y condiciones

1. Las revisiones aprobadas e inmutables permanecen en el Vault **privado**.
2. La entrada es una revisión privada ya aprobada, guardada temporalmente **fuera de cualquier repositorio Git**. Nunca se sube a GitHub público, pruebas CI, issues ni comentarios.
3. Se valida la revisión exacta, su huella de aprobación, estado pendiente y que el paquete calculado coincide con la proyección pública aprobada.
4. Por ahora solamente existe un destino canónico explícito: DAN-001. No se inventan URLs.
5. La página pública y sus siete perfiles deben estar coherentes antes de preparar la propuesta.
6. Descripción, alias y palabras clave solo se ofrecen para decisión humana; la descripción editorial publicada no se sustituye por defecto.
7. Los cambios en perfiles sociales requieren una revisión coordinada de web, JSON-LD y registro de plataformas. No se pueden aceptar con la vista previa normal.
8. Ocupaciones, imagen, créditos y otras propiedades públicas se conservan.
9. Ningún candidato se publica sin una autorización humana posterior y explícita.

## Uso operativo local

En una copia de trabajo limpia de aio-code-knowledge, con Node.js 24:

1. Obtener la revisión privada aprobada por un procedimiento autorizado y guardarla en un directorio temporal exterior al repositorio. No incluir contraseñas ni tokens en los comandos.
2. Ejecutar lo siguiente con rutas absolutas reales: node scripts/prepare_public_update_proposal.mjs --revision /absolute/private/revision.json --out /absolute/private/danisan-review-proposal.json
3. En Windows usar rutas C:\... en lugar de las rutas Unix del ejemplo.
4. La salida local contiene solo sugerencias procedentes de la proyección pública autorizada y una comparación del JSON-LD público existente. La consola imprime únicamente nombres de campos y estados.
5. Revisar el archivo privado con la administradora. La función pura previewReviewedCandidate permite seleccionar campos aprobados explícitamente y calcular el JSON-LD candidato en memoria, preservando el documento original y bloqueando revisiones obsoletas.
6. Un proceso separado y posteriormente autorizado podrá proponer un PR público, con controles de revisión y despliegue. **Este módulo no implementa esa publicación.**

## Archivos

- lib/public-update-proposal.mjs: valida revisión y construye diferencias; vista previa explícita sin escribir.
- scripts/prepare_public_update_proposal.mjs: interfaz local con entrada y salida fuera de Git; crea archivo nuevo sin sobrescribir.
- tests/public-update-proposal.test.mjs: pruebas con registros sintéticos sin datos reales ni tokens.
- scripts/check_public_entity_sync.mjs: auditoría pública existente usada como requisito previo.
- lib/public-identity-targets.mjs: destino canónico explícito.

La propuesta contiene el número de revisión, número de fuente aprobada, huella de la proyección **pública**, huella del JSON-LD actual y los valores **públicos autorizados** sugeridos para revisión. Excluye ID administrativo ENT, evidencia privada, derechos privados y hash completo de los datos del expediente.

## Pendiente de construcción

- Pantalla privada de comparación y aprobación campo por campo en Entity Console.
- Registro de decisión de publicación ligado a una revisión inmutable y un responsable.
- PR con cambios coordinados a HTML, JSON-LD y plataformas, más revisión humana antes de desplegar.
- Verificación de URL pública después de publicación y seguimiento de drift.
- Cotejo documental privado del acuerdo firmado, sin exigir una nueva firma.

Una propuesta técnicamente válida no implica autorización legal ni aprobación para publicar.
