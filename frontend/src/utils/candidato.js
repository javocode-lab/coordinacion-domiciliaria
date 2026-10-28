/** Recomendación EXPLORATORIA, no asignación ni scoring profesional. */
export function sugerirCandidato(pacienteUbicacion, profesionales) {
  if (!Number.isFinite(pacienteUbicacion?.lat) || !Number.isFinite(pacienteUbicacion?.lng)) {
    return { candidato: null, razon: "Sin ubicación aproximada del paciente no podemos evaluar cercanía." };
  }
  const validos = profesionales.filter((p) => Number.isFinite(p.coordenadas?.lat) && Number.isFinite(p.coordenadas?.lng));
  if (!validos.length) return { candidato: null, razon: "No hay coordenadas verificadas para los profesionales de esta página." };
  // Cada distancia es entre CENTROS de localidades, nunca entre domicilios.
  const dist = (p) => {
    const rad = (v) => v * Math.PI / 180;
    const lat1 = rad(pacienteUbicacion.lat), lat2 = rad(p.coordenadas.lat);
    const dlat = lat2 - lat1, dlng = rad(p.coordenadas.lng - pacienteUbicacion.lng);
    const h = Math.sin(dlat / 2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlng/2)**2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
  };
  const orden = validos.map((p) => ({ profesional: p, km: dist(p) })).sort((a,b) => a.km-b.km);
  // Distancias equivalentes no permiten distinguir candidatos con rigor.
  if (orden.length > 1 && orden[1].km - orden[0].km < 0.5) {
    return { candidato: null, razon: "Los centros de localidad disponibles no permiten distinguir un candidato claramente más cercano. Revisá los perfiles." };
  }
  if (orden.length === 1 && profesionales.length > 1) {
    return { candidato: null, razon: "Solo un profesional tiene ubicación conocida. No hay datos suficientes para comparar." };
  }
  return {
    candidato: orden[0].profesional,
    razon: `Centro de localidad aparentemente más cercano (≈${orden[0].km.toFixed(1)} km en línea recta). No mide domicilios, tiempos de viaje ni idoneidad profesional.`,
  };
}
