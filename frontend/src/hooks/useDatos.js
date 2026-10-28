import { useEffect, useState } from "react";
import { api } from "../api/cliente.js";

/** Carga inicial de pacientes, profesionales y catálogo de profesiones. */
export function useDatos() {
  const [datos, setDatos] = useState({ pacientes: [], profesionales: [], profesiones: {} });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    Promise.all([api.pacientes(), api.profesionales(), api.catalogos()])
      .then(([pacientes, profesionales, catalogos]) => {
        if (activo) setDatos({ pacientes, profesionales, profesiones: catalogos.profesiones });
      })
      .catch((e) => activo && setError(e))
      .finally(() => activo && setCargando(false));
    return () => { activo = false; };
  }, []);

  return { ...datos, cargando, error };
}
