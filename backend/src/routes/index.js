import { Router } from "express";
import * as c from "../controllers/datos.controller.js";
import * as u from "../controllers/ubicaciones.controller.js";

const router = Router();

router.get("/salud", (_req, res) => res.json({ estado: "ok" }));
router.get("/catalogos", c.catalogos);
router.get("/pacientes", c.pacientes);
router.get("/pacientes/:id", c.paciente);
router.get("/profesionales", c.profesionales);
router.get("/ubicaciones/paciente/:id", u.paciente);
router.get("/ubicaciones/localidades", u.localidades);

export default router;
