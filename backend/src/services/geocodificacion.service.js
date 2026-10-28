import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

const URL_GEOCODING = "https://maps.googleapis.com/maps/api/geocode/json";
const ARCHIVO_CACHE = () => path.join(env.dirCache, "geocodificacion.json");

export class ErrorGeocodificacion extends Error {
  constructor(mensaje, estado = 502) {
    super(mensaje);
    this.estado = estado;
  }
}

let cache = null;
let escritura = Promise.resolve();

async function cargarCache() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(ARCHIVO_CACHE(), "utf-8"));
  } catch {
    cache = {};
  }
  return cache;
}

/** Escritura atómica y serializada para no corromper el archivo. */
function persistirCache() {
  escritura = escritura.then(async () => {
    await mkdir(env.dirCache, { recursive: true });
    const tmp = `${ARCHIVO_CACHE()}.tmp`;
    await writeFile(tmp, JSON.stringify(cache, null, 2), "utf-8");
    await rename(tmp, ARCHIVO_CACHE());
  });
  return escritura;
}

const claveCache = (consulta) =>
  consulta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Geocodifica un texto con Google Geocoding API (restringido a Argentina).
 * Devuelve { encontrado, lat, lng, tipoUbicacion, direccionFormateada }.
 * Resultados (incluidos los "no encontrado") se guardan en caché en disco.
 */
export async function geocodificar(consulta) {
  const memoria = await cargarCache();
  const clave = claveCache(consulta);
  if (memoria[clave]) return { ...memoria[clave], desdeCache: true };

  if (!env.googleServerKey) {
    throw new ErrorGeocodificacion(
      "Falta GOOGLE_MAPS_SERVER_KEY en backend/.env para geocodificar direcciones.",
      503
    );
  }

  const url = new URL(URL_GEOCODING);
  url.search = new URLSearchParams({
    address: consulta,
    components: "country:AR",
    region: "ar",
    language: "es",
    key: env.googleServerKey,
  }).toString();

  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new ErrorGeocodificacion(`Geocoding HTTP ${respuesta.status}`);
  const datos = await respuesta.json();

  let resultado;
  if (datos.status === "OK" && datos.results?.length) {
    const r = datos.results[0];
    resultado = {
      encontrado: true,
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      tipoUbicacion: r.geometry.location_type, // ROOFTOP | RANGE_INTERPOLATED | GEOMETRIC_CENTER | APPROXIMATE
      direccionFormateada: r.formatted_address,
    };
  } else if (datos.status === "ZERO_RESULTS") {
    resultado = { encontrado: false };
  } else {
    // OVER_QUERY_LIMIT, REQUEST_DENIED, etc.: no se cachea, es un error operativo.
    throw new ErrorGeocodificacion(
      `Geocoding: ${datos.status}${datos.error_message ? " — " + datos.error_message : ""}`
    );
  }

  memoria[clave] = resultado;
  await persistirCache();
  return { ...resultado, desdeCache: false };
}

/** Ejecuta `tarea` sobre `items` con un máximo de `limite` en paralelo. */
export async function conLimite(items, limite, tarea) {
  const resultados = new Array(items.length);
  let siguiente = 0;
  const trabajadores = Array.from({ length: Math.min(limite, items.length) }, async () => {
    while (siguiente < items.length) {
      const i = siguiente++;
      resultados[i] = await tarea(items[i], i);
    }
  });
  await Promise.all(trabajadores);
  return resultados;
}

export const _reiniciarCacheParaPruebas = () => { cache = null; };
