// S1.2-B: catálogo mínimo, revisable y sin llamadas externas.
// Coordenada de referencia APROXIMADA para la localidad Córdoba (no domicilios).
// No agregar localidades sin validar por separado sus coordenadas.
const LOCALIDADES = new Map([
  ["cordoba|cordoba", { lat: -31.4201, lng: -64.1888 }],
]);

export const claveLocalidad = (u = {}) =>
  `${u.localidad ?? ""}|${u.provincia ?? ""}`;

const claveCanonica = (u = {}) => claveLocalidad(u).normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function coordenadasLocales(ubicacion) {
  const punto = LOCALIDADES.get(claveCanonica(ubicacion));
  return punto ? { ...punto, precision: "localidad", fuente: "catalogo_local_inicial" } : null;
}
