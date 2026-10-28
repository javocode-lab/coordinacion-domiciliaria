# S1.2-E — Reubicación de orientación y ampliación del mapa

## Cambios
- La orientación de candidato se muestra dentro de la columna de selección, inmediatamente después de paginación.
- El detalle explicativo es desplegable y conserva la advertencia de que la evaluación es aproximada y solo abarca los cinco profesionales visibles.
- El mapa gana altura en escritorio (clamp 450px, 62vh, 660px).
- Se retira de la vista el placeholder «Profesionales sugeridos» (sin lógica funcional). No se elimina su archivo.
- Sin cambios de backend, scoring, geocodificación ni datos.

## Instalación
Aplicar sobre el código que ya incorpora S1.2-B, S1.2-C y S1.2-D; copiar los tres archivos de frontend conservando rutas. Hacer copia de seguridad antes.
Ejecutar `npm.cmd run build` y probar en 1366×768 y 1920×1080, paciente y cinco profesionales visibles, zoom de rueda y paginación.
No publicar capturas con nombres/teléfonos/domicilios reales.
