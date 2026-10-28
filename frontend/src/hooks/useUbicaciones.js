import { useEffect, useState } from "react";
import { api } from "../api/cliente.js";
import { claveLocalidad } from "../utils/distancia.js";

/** Coordenadas del paciente seleccionado (se geocodifica en el backend). */
export function useUbicacionPaciente(pacienteId) {
  const [estado, setEstado] = useState({ ubicacion: null, cargando: false, error: null });

  useEffect(() => {
    if (!pacienteId) { setEstado({ ubicacion: null, cargando: false, error: null }); return; }
    let activo = true;
    setEstado({ ubicacion: null, cargando: true, error: null });
    api.ubicacionPaciente(pacienteId)
      .then((ubicacion) => activo && setEstado({ ubicacion, cargando: false, error: null }))
      .catch((error) => activo && setEstado({ ubicacion: null, cargando: false, error }));
    return () => { activo = false; };
  }, [pacienteId]);

  return estado;
}

/**
 * Centros de localidad de los profesionales. Se piden una sola vez, la primera
 * vez que hay un profesional seleccionado (`habilitado`), para no gastar cuota antes de tiempo.
 */
export function useCentrosLocalidad(habilitado) {
  const [estado, setEstado] = useState({ mapa: new Map(), cargando: false, error: null });
  const [pedido, setPedido] = useState(false);

  useEffect(() => { if (habilitado) setPedido(true); }, [habilitado]);

  useEffect(() => {
    if (!pedido) return;
    let activo = true;
    setEstado((e) => ({ ...e, cargando: true }));
    api.ubicacionesLocalidades()
      .then((filas) => activo && setEstado({
        mapa: new Map(filas.filter((f) => f.lat != null).map((f) => [f.clave, { lat: f.lat, lng: f.lng }])),
        cargando: false, error: null,
      }))
      .catch((error) => activo && setEstado((e) => ({ ...e, cargando: false, error })));
    return () => { activo = false; };
  }, [pedido]);

  const coordsDe = (profesional) =>
    profesional ? estado.mapa.get(claveLocalidad(profesional.ubicacion)) ?? null : null;

  return { ...estado, coordsDe };
}
