# S1.4-B — Catálogo geográfico sin migración del padrón

## Objetivo
Ampliar las localidades que pueden mostrarse en Leaflet SIN sustituir los Excel actuales ni perder registros.

## Archivo de origen
`Blacksmith_Profesionales_Georreferenciacion_v1.xlsx`, hoja `CATALOGO_LOCALIDADES`.
El ZIP solo incluye las 17 referencias geográficas disponibles, sin nombres, teléfonos ni direcciones de personas.

## Instalación
1. Respaldar el proyecto y ejecutar `git status --short`.
2. Copiar la carpeta `backend` y `data/geo` de este parche sobre la raíz del proyecto, sin borrar otras carpetas.
3. Ejecutar `node --test backend/test/ubicaciones-locales.test.js` y `npm.cmd test -w backend`.
4. Reiniciar el backend desde VS Code: `node --watch backend/src/server.js`.
5. Mantener el frontend con el comando habitual de Node/Vite. Probar localidades con y sin coordenadas.

## Seguridad y precisión
- Ninguna coordenada de este catálogo representa un domicilio individual.
- Estos puntos SOLO sirven para visualizar centros aproximados de localidad.
- No se deben usar para calcular distancias exactas, ETAs o un mejor candidato confiable.
- No se envían direcciones a ningún servicio externo.
- Referencias de la planilla de origen conservadas en el JSON; requieren revisión cartográfica independiente antes de uso operativo de precisión.

## Discrepancias sin resolver
- Planilla profesional nueva: 1006 filas; padrón anterior: 1083. **No sustituir** `data/raw/profesionales.xlsx` hasta conciliar la diferencia.
- Planilla de pacientes nueva: 330 registros; anterior: 64. El ETL actual requiere adaptar el esquema de pacientes y la estabilidad de identificadores. **No sustituir** `data/raw/pacientes.xlsx` todavía.

## Estado
Parche incremental sobre el servicio geográfico S1.2, sin cambios al ETL ni a los datos privados. Requiere validación de compatibilidad y visual en estación local.
