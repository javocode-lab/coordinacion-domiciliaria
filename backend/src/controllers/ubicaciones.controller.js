import * as ubicaciones from "../services/ubicaciones.service.js";
import { ErrorGeocodificacion } from "../services/geocodificacion.service.js";

const envolver = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    if (e instanceof ErrorGeocodificacion) return res.status(e.estado).json({ error: e.message });
    next(e);
  }
};

export const paciente = envolver(async (req, res) => {
  const u = await ubicaciones.ubicacionPaciente(req.params.id);
  if (!u) return res.status(404).json({ error: "Paciente no encontrado" });
  res.json(u);
});

export const localidades = envolver(async (_req, res) => res.json(await ubicaciones.ubicacionesLocalidades()));
