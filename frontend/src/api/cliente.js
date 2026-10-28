/** Cliente HTTP de la API de coordinación (el proxy de Vite apunta a Node en dev). */
async function pedir(ruta) {
  const respuesta = await fetch(`/api${ruta}`);
  if (!respuesta.ok) {
    const cuerpo = await respuesta.json().catch(() => ({}));
    throw new Error(cuerpo.error || `Error ${respuesta.status} al pedir ${ruta}`);
  }
  return respuesta.json();
}

export const api = {
  catalogos: () => pedir("/catalogos"),
  pacientes: () => pedir("/pacientes"),
  profesionales: () => pedir("/profesionales"),
  ubicacionPaciente: (id) => pedir(`/ubicaciones/paciente/${id}`),
  ubicacionesLocalidades: () => pedir("/ubicaciones/localidades"),
};
