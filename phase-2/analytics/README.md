# Analytics y dashboard — criterios de implementación

## Estado verificado al 6 de octubre

- Instagram Insights: [PR #10](https://github.com/mariicuadros/aio-code-knowledge/pull/10) abierto, draft, no fusionado. El código incorpora un interruptor y autenticación; no se ejecutó una consulta real a Meta en esta auditoría. Configurar variables o autorizar una app no demuestra una lectura operativa.
- YouTube y TikTok: no se localizaron conectores en los main de los tres repositorios accesibles revisados. Esto no verifica recursos que existan solo en Vercel o en la computadora de la creadora.
- Dashboard: no se localizó una implementación en esos main. El Ledger manual privado y los contratos de observación sí existen.

## Circuito esperado

Captura manual o API autorizada → snapshot privado con fecha y ventana → normalización sin cambiar la definición de plataforma → validación e incorporación al Ledger → visualización privada. Cada etapa conserva referencia a su fuente y errores. No guardar credenciales en capturas, registros ni Git.

## Dashboard mínimo

Una tabla de publicaciones por Content ID y plataforma; métricas con definición y unidad; ventana/captura/fuente; datos ausentes diferenciados de cero; estado del conector y sus errores. Permitir cotejar cada valor contra el registro privado. Alcance, visualizaciones y engagement se muestran por separado del reconocimiento de entidades en buscadores/IA. No sumar métricas de distintas plataformas como si fueran equivalentes.

Conservar acceso privado. La aceptación requiere al menos una fila real validada y una segunda ventana que demuestre actualización sin sobrescribir la anterior. El diseño visual puede elaborarse antes, etiquetado como prototipo sin datos reales.
