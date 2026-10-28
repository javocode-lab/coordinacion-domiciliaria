import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

/** Caché en memoria: los JSON los genera el ETL de Python y cambian poco. */
const cache = new Map();

async function leer(nombre) {
  if (!cache.has(nombre)) {
    const texto = await readFile(path.join(env.dirDatos, nombre), "utf-8");
    cache.set(nombre, JSON.parse(texto));
  }
  return cache.get(nombre);
}

export const recargar = () => cache.clear();
export const obtenerCatalogos = () => leer("catalogos.json");
export const obtenerPacientes = () => leer("pacientes.json");

const normalizar = (t = "") =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export async function obtenerProfesionales({ profesion, q } = {}) {
  const todos = await leer("profesionales.json");
  const texto = normalizar(q);
  return todos.filter(
    (p) =>
      (!profesion || p.profesiones.includes(profesion)) &&
      (!texto || normalizar(p.nombreCompleto).includes(texto))
  );
}

export async function obtenerPacientePorId(id) {
  return (await obtenerPacientes()).find((p) => p.id === id) ?? null;
}
