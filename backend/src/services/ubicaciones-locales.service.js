// S1.4-B: referencias aproximadas de localidades; NO representan domicilios.
// Catálogo derivado de la hoja CATALOGO_LOCALIDADES del XLSX facilitado.
// Su precisión no fue verificada a nivel de calle. No usar para ranking exacto.
import { readFileSync } from 'node:fs';

const claveCanonica = (u = {}) => `${u.localidad ?? ''}|${u.provincia ?? ''}`
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export const claveLocalidad = (u = {}) => `${u.localidad ?? ''}|${u.provincia ?? ''}`;

const rutaCatalogo = new URL('../../../data/geo/localidades_referencia.json', import.meta.url);
let localidades = {};
try {
  localidades = JSON.parse(readFileSync(rutaCatalogo, 'utf8'));
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  // Sin el catálogo, no presentar puntos sin respaldo como ubicaciones exactas.
}

export function coordenadasLocales(ubicacion = {}) {
  const p = localidades[claveCanonica(ubicacion)];
  if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return null;
  if (p.lat < -90 || p.lat > 90 || p.lng < -180 || p.lng > 180) return null;
  return {
    lat: p.lat,
    lng: p.lng,
    precision: 'localidad',
    fuente: 'catalogo_geografico_importado',
  };
}
