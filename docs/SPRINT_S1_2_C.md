# S1.2-C — Vista simultánea y orientación conservadora

## Cambios
- El mapa incluye simultáneamente el paciente y los profesionales de la página con coordenadas locales conocidas.
- Permite zoom con rueda del mouse y botones de Leaflet.
- Un cambio de selección o de candidato no reinicia el zoom manual. Cambio de página o de paciente sí puede reencuadrar.
- Las coincidencias de centro de localidad se separan visualmente (no son domicilios ni distancias reales).
- Leyenda: rojo paciente, azul profesional, amarillo candidato a revisar, verde profesional elegido manualmente.
- Tarjeta fuera del mapa muestra, cuando es distinguible, la referencia de cercanía entre centros aproximados de localidades, SOLO entre profesionales de la página. No evalúa historial, calidad, arancel, disponibilidad real ni determina asignación.
- Si los profesionales comparten centro de localidad y no hay diferencia geográfica significativa (<0.5 km), NO se inventa ganador.

## Limitaciones
- El catálogo local del sprint previo solo contiene Córdoba capital. En múltiples casos no se podrá identificar un candidato superior.
- Pueden faltar coordenadas del paciente o profesionales; el sistema muestra el límite y no inventa posiciones.
- La separación visual de marcadores no debe usarse para medir distancia.
- El acceso a tiles de OpenStreetMap continúa siendo una consulta de red.
- El futuro motor de ranking necesita reglas, evidencia, cobertura por servicio y datos mejor definidos para poder recomendar un mejor candidato integral.

## Instalación
Extraer el parche sobre la raíz del proyecto después de S1.2-B, sin reemplazar archivos privados. Verificar:
`npm.cmd test -w backend`
`node --test frontend/src/utils/candidato.test.js`
`npm.cmd run build`
Luego correr backend y frontend. Si build falla, no crear commit hasta diagnosticar.
