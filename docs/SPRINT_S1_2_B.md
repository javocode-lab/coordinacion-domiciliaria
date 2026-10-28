# Sprint S1.2-B — Buscador automático y mapa por localidades (MVP)

- Seleccionar paciente + servicio activa resultados automáticamente.
- Profesionales filtrados por profesión; búsqueda de nombre automática.
- Página de hasta 5 resultados. Botones Anterior/Siguiente sincronizan lista y mapa.
- Se muestra el paciente mediante centro de localidad solo si existe referencia local.
- Los profesionales se posicionan mediante un catálogo **inicial** de referencia por localidad, no domicilios individuales.
- El catálogo inicial contiene exclusivamente Córdoba capital como punto aproximado de referencia. Las demás localidades quedan sin pin hasta su revisión y carga.
- Los marcadores que comparten localidad se separan **visualmente** para evitar superposición. El desplazamiento gráfico no representa dirección ni ubicación del profesional.
- Al posicionar el mouse sobre el pin: nombre y teléfono; al hacer clic: selecciona el profesional y muestra su ficha en la columna de lista.
- No hay geocodificación automática, solicitudes a proveedores de direcciones ni rutas de domicilios reales.
- OpenStreetMap continúa entregando tiles externos del mapa; consultar política de uso y privacidad antes de operación productiva.
- Movilidad, disponibilidad, arancel y scoring se indican como pendientes/no informados; no hay puntuaciones ficticias.
- WhatsApp con mensaje prearmado se implementará en un sprint específico después de revisar formato, teléfono y privacidad.
- Código JS/JSX original conservado. Sin cambios al ETL o a los Excel privados.

## Puesta en marcha

Desde la raíz del proyecto: `npm.cmd ci`, `npm.cmd test -w backend`, `npm.cmd run build`.
Mantener `data/processed/*.json` existentes en local o regenerarlos mediante el ETL desde Excel privados.
No reemplazar ni compartir las carpetas `data/raw` o `data/processed`.
