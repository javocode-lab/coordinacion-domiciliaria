import { obtenerPacientePorId, obtenerProfesionales } from "./datos.service.js";
import { geocodificar, conLimite } from "./geocodificacion.service.js";

export const claveLocalidad = (u) => `${u.localidad}|${u.provincia}`;

/**
 * Ubicación del paciente. Primero intenta la dirección completa; si Google no la
 * encuentra (p. ej. "Manzana 37 Lote 3") cae al centro de la localidad.
 */
export async function ubicacionPaciente(id) {
  const paciente = await obtenerPacientePorId(id);
  if (!paciente) return null;
  const u = paciente.ubicacion;

  const exacta = await geocodificar(u.consultaGeocodificacion);
  if (exacta.encontrado) {
    const precisa = ["ROOFTOP", "RANGE_INTERPOLATED"].includes(exacta.tipoUbicacion);
    return {
      pacienteId: id, lat: exacta.lat, lng: exacta.lng,
      precision: precisa ? "domicilio" : "aproximada",
      direccionFormateada: exacta.direccionFormateada,
    };
  }

  const respaldo = await geocodificar(`${u.localidad}, ${u.provincia}, Argentina`);
  if (!respaldo.encontrado) return { pacienteId: id, lat: null, lng: null, precision: "no_encontrada" };
  return {
    pacienteId: id, lat: respaldo.lat, lng: respaldo.lng,
    precision: "localidad", direccionFormateada: respaldo.direccionFormateada,
  };
}

/** Coordenadas (centro) de cada localidad distinta presente en el padrón de profesionales. */
export async function ubicacionesLocalidades() {
  const profesionales = await obtenerProfesionales();
  const unicas = new Map();
  profesionales.forEach((p) => unicas.set(claveLocalidad(p.ubicacion), p.ubicacion));

  const filas = await conLimite([...unicas.entries()], 5, async ([clave, u]) => {
    const g = await geocodificar(`${u.localidad}, ${u.provincia}, Argentina`);
    return g.encontrado ? { clave, lat: g.lat, lng: g.lng } : { clave, lat: null, lng: null };
  });
  return filas;
}
