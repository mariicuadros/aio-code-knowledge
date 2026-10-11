# Analytics y dashboard — criterios de implementación

## Estado verificado al 11 de octubre

- Instagram / Meta: una reconstrucción limpia sobre el main actual confirmó en Vercel Preview lectura autorizada de la cuenta configurada, media real y account-level Insights. La integración de producción se implementa con snapshots privados, normalización, Content ID candidato, vault inmutable, cron diario y dashboard privado. La automatización solo se declarará operativa después de observar ejecuciones reales sucesivas sin sobrescritura.
- PR #10 y los intentos intermedios quedaron cerrados sin fusionarse; no son la base operativa.
- YouTube y TikTok: siguen siendo conectores Phase-2 separados y todavía no se declaran operativos.
- Dashboard: la capa privada está implementada en esta rama de integración y exige credencial de administración para leer el vault. La página pública no contiene datos operativos.

## Circuito esperado

Captura manual o API autorizada → snapshot privado con fecha y ventana → normalización sin cambiar la definición de plataforma → validación e incorporación al Ledger → visualización privada. Cada etapa conserva referencia a su fuente y errores. No guardar credenciales en capturas, registros ni Git.

## Dashboard mínimo

Una tabla de publicaciones por Content ID y plataforma; métricas con definición y unidad; ventana/captura/fuente; datos ausentes diferenciados de cero; estado del conector y sus errores. Permitir cotejar cada valor contra el registro privado. Alcance, visualizaciones y engagement se muestran por separado del reconocimiento de entidades en buscadores/IA. No sumar métricas de distintas plataformas como si fueran equivalentes.

Conservar acceso privado. La aceptación requiere al menos una fila real validada y una segunda ventana que demuestre actualización sin sobrescribir la anterior. El diseño visual puede elaborarse antes, etiquetado como prototipo sin datos reales.

## Instagram Views: cambio de métrica y evaluación estratégica (2026-10-10)

- **Confirmado en información pública:** Views pasa a ser métrica principal de visibilidad del contenido en Instagram; reemplaza parte de los antiguos recuentos de impressions/plays y afecta la disponibilidad de campos de API. La definición exacta depende del formato, endpoint, versión y fecha; no extrapolar un valor a otras plataformas. Fuentes: https://support.supermetrics.com/support/solutions/articles/19000164739-instagram-insights-field-changes-march-25-2025 ; https://about.fb.com/news/2026/01/2026-ai-drives-performance/ .
- **Observación informada por la creadora (2026-10-10):** en conversación con Meta le comunicaron prioridad de visualizaciones. No disponemos en el repositorio de transcripción o comprobación independiente de esa conversación.
- **Hipótesis distinta, no confirmada:** una eventual eliminación de contadores de seguidores. No publicar como anuncio de Meta ni diseñar campos que eliminen followers por anticipado.
- **Modelo propuesto:** guardar `views` con unidad, ámbito (publicación/cuenta), formato, ventana, fuente, versión y fecha; conservar por separado `reach` (cuentas únicas cuando esté disponible), `followers`, reproducciones heredadas, tiempo de visualización/retención, guardados, compartidos, reposts y conversiones. Distinguir origen orgánico y pagado cuando haya fuente válida.
- **Comparabilidad:** métricas de nombres distintos o recolectadas bajo definiciones antiguas no se convierten automáticamente a Views; usar `metric_definition_version`, campo original, estado de disponibilidad, y nota de discontinuidad histórica.
- **Decisión editorial:** experimentar con distribución y atención al contenido, sin afirmar control del algoritmo, causalidad ni indexación por IA. Las métricas sociales no reemplazan las pruebas independientes de desambiguación o citación del Observatory.
- **Aceptación futura:** confirmar valores reales a través de Meta Insights o capturas fechadas con permisos; el conector no queda declarado operativo por este documento.
