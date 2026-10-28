import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

process.env.CACHE_DIR = mkdtempSync(path.join(tmpdir(), "geo-"));
process.env.GOOGLE_MAPS_SERVER_KEY = "clave-falsa";

const { geocodificar, _reiniciarCacheParaPruebas } = await import("../src/services/geocodificacion.service.js");
const { ubicacionPaciente } = await import("../src/services/ubicaciones.service.js");

const respuestaOK = (lat, lng, tipo = "ROOFTOP") => ({
  ok: true,
  json: async () => ({ status: "OK", results: [{ geometry: { location: { lat, lng }, location_type: tipo }, formatted_address: "X" }] }),
});
const respuestaVacia = { ok: true, json: async () => ({ status: "ZERO_RESULTS", results: [] }) };

test("geocodifica y usa la caché en la segunda llamada", async () => {
  let llamadas = 0;
  globalThis.fetch = async () => { llamadas++; return respuestaOK(-31.4, -64.2); };
  const a = await geocodificar("Calle Falsa 123, Córdoba");
  _reiniciarCacheParaPruebas(); // fuerza relectura desde disco
  const b = await geocodificar("calle falsa 123, cordoba");
  assert.equal(llamadas, 1);
  assert.equal(a.lat, -31.4);
  assert.equal(b.desdeCache, true);
});

test("errores operativos de Google no se cachean", async () => {
  globalThis.fetch = async () => ({ ok: true, json: async () => ({ status: "OVER_QUERY_LIMIT" }) });
  await assert.rejects(() => geocodificar("Otra dirección 1"), /OVER_QUERY_LIMIT/);
});

test("paciente sin dirección encontrada cae a la localidad", async () => {
  let n = 0;

  globalThis.fetch = async () =>
    ++n === 1
      ? respuestaVacia
      : respuestaOK(-31.0, -64.0, "APPROXIMATE");

  const u = await ubicacionPaciente("PAC-0001");

  assert.equal(u.precision, "localidad");
  assert.equal(u.lat, -31.40648311);
});
