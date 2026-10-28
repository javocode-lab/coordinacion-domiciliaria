import { obtenerPacientePorId, obtenerProfesionales } from "./datos.service.js";
import { claveLocalidad, coordenadasLocales } from "./ubicaciones-locales.service.js";
export { claveLocalidad };

/** S1.2: solo localidad aproximada, jamás geocodificar direcciones privadas automáticamente. */
export async function ubicacionPaciente(id) {
  const paciente = await obtenerPacientePorId(id);
  if (!paciente) return null;
  const punto = coordenadasLocales(paciente.ubicacion);
  return { pacienteId: id, lat: punto?.lat ?? null, lng: punto?.lng ?? null,
    precision: punto?.precision ?? "no_encontrada", fuente: punto?.fuente ?? null };
}

/** Todas las localidades del padrón, sin llamadas a terceros. */
export async function ubicacionesLocalidades() {
  const profesionales = await obtenerProfesionales();
  const unicas = new Map();
  profesionales.forEach((p) => unicas.set(claveLocalidad(p.ubicacion), p.ubicacion));
  return [...unicas.entries()].map(([clave, ubicacion]) => {
    const punto = coordenadasLocales(ubicacion);
    return { clave, lat: punto?.lat ?? null, lng: punto?.lng ?? null,
      precision: punto?.precision ?? "no_encontrada", fuente: punto?.fuente ?? null };
  });
}
