import { useEffect, useMemo, useState } from "react";
import { api } from "../api/cliente.js";
import { claveLocalidad } from "../utils/distancia.js";

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

export function useCentrosLocalidad(habilitado) {
  const [estado, setEstado] = useState({ mapa: new Map(), cargando: false, error: null });
  useEffect(() => {
    if (!habilitado) return;
    let activo = true;
    setEstado((prev) => ({ ...prev, cargando: true }));
    api.ubicacionesLocalidades()
      .then((filas) => activo && setEstado({
        mapa: new Map(filas.filter((f) => f.lat != null && f.lng != null)
          .map((f) => [f.clave, {lat:f.lat,lng:f.lng,precision:f.precision}])),
        cargando: false, error: null,
      }))
      .catch((error) => activo && setEstado((prev) => ({ ...prev, cargando: false, error })));
    return () => { activo = false; };
  }, [habilitado]);
  const coordsDe = (profesional) => profesional ? estado.mapa.get(claveLocalidad(profesional.ubicacion)) ?? null : null;
  return { ...estado, coordsDe };
}
