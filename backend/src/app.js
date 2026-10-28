import express from "express";
import cors from "cors";
import router from "./routes/index.js";

export function crearApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", router);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor" });
  });
  return app;
}
