# S1.2-D — Ajuste de distribución visual

Parche incremental basado en el paquete S1.2-C actual. No cambia datos, backend, filtros, motor de sugerencias ni geocodificación.

## Cambios
- Mapa con altura acotada (320–490 px en escritorio).
- Panel de selección más ancho y sin estiramiento vertical de las fichas.
- Recomendación debajo del mapa, lista a la izquierda.
- Diseño de una columna en pantallas estrechas.
- ResizeObserver para que Leaflet actualice su lienzo al cambiar las dimensiones.

## Instalación
Extraer el ZIP en la raíz del proyecto, sobrescribiendo los tres archivos de `frontend/src` correspondientes. No extraer en una subcarpeta nueva.

## Verificación
1. `npm.cmd run build`
2. `npm.cmd run dev:backend` y `npm.cmd run dev:frontend` en terminales separadas.
3. Abrir localhost:5173 y pulsar Ctrl+0 para restablecer zoom del navegador al 100%.
4. Elegir paciente y servicio. Confirmar que mapa y lista de 5 caben sin un mapa excesivamente alto.
5. Probar paginación, zoom del mapa con rueda y selección de pin.

No hacer commit hasta validar visualmente. Si el mapa aún abarca demasiado por zoom del navegador o pantalla, revisar escala de pantalla antes de cambiar lógica.
