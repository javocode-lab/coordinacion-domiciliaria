import path from "node:path";
import { fileURLToPath } from "node:url";

const aqui = path.dirname(fileURLToPath(import.meta.url));

export const env = {
  port: Number(process.env.PORT) || 4000,
  googleServerKey: process.env.GOOGLE_MAPS_SERVER_KEY || "",
  dirDatos: path.resolve(aqui, "../../../data/processed"),
  dirCache: process.env.CACHE_DIR || path.resolve(aqui, "../../../data/cache"),
};
