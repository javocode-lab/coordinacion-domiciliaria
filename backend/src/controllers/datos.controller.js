import * as datos from "../services/datos.service.js";

const envolver = (fn) => (req, res, next) => fn(req, res).catch(next);

export const catalogos = envolver(async (_req, res) => res.json(await datos.obtenerCatalogos()));
export const pacientes = envolver(async (_req, res) => res.json(await datos.obtenerPacientes()));

export const profesionales = envolver(async (req, res) => {
  const { profesion, q } = req.query;
  res.json(await datos.obtenerProfesionales({ profesion, q }));
});

export const paciente = envolver(async (req, res) => {
  const p = await datos.obtenerPacientePorId(req.params.id);
  if (!p) return res.status(404).json({ error: "Paciente no encontrado" });
  res.json(p);
});
