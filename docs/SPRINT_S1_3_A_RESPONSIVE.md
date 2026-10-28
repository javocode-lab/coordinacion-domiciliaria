# Sprint S1.3-A — Distribución responsive

## Objetivo
Redistribuir la información del caso en tres tarjetas: paciente, profesional y WhatsApp. Mejorar la adaptación al redimensionar la ventana, sin tocar backend, datos ni reglas de negocio.

## Instalación
1. Confirmar `git status --short` y guardar cualquier cambio sin confirmar antes de reemplazar archivos.
2. Extraer el ZIP en la raíz del proyecto, conservando las rutas.
3. Ejecutar `npm.cmd run build` y las pruebas existentes.
4. Iniciar backend y frontend desde las dos terminales integradas ya documentadas.

## Validación manual
- En 1920 × 1080 deben verse tres tarjetas inferiores si el área de detalle tiene ancho suficiente.
- En 1366 × 768 el panel de WhatsApp puede trasladarse a una segunda fila sin dejar huecos grandes.
- En ventanas angostas las tarjetas deben apilarse sin cortar los contenidos.
- Al redimensionar, Leaflet debe actualizar su lienzo mediante el ResizeObserver existente.
- Verificar que búsqueda, paginación, selección y mensaje editable sigan funcionando.

## Alcance y limitaciones
- No modifica la normalización del teléfono: esa mejora corresponde a S1.3-B.
- No cambia los datos ni incorpora autenticación.
- Los cambios se construyeron sobre la base reconstruida de S1.2-F + S1.3. Verificar contra la copia local más reciente antes de sobrescribir si hubo cambios posteriores.
- No crear commit hasta aprobar compilación y validación visual.
