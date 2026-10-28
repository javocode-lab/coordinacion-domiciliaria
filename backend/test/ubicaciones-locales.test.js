import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coordenadasLocales, claveLocalidad } from '../src/services/ubicaciones-locales.service.js';

test('Córdoba resuelve como localidad aproximada', () => {
  const p = coordenadasLocales({ localidad: 'Córdoba', provincia: 'Córdoba' });
  assert.equal(p.precision, 'localidad');
  assert.equal(p.fuente, 'catalogo_geografico_importado');
  assert.ok(Number.isFinite(p.lat));
  assert.ok(Number.isFinite(p.lng));
});
test('Mendoza no se confunde con Córdoba', () => {
  const p = coordenadasLocales({ localidad: 'Mendoza', provincia: 'Mendoza' });
  assert.ok(p && p.lng < -60);
  assert.equal(coordenadasLocales({ localidad: 'Mendoza', provincia: 'Córdoba' }), null);
});
test('Localidad desconocida no recibe puntos inventados', () => {
  assert.equal(coordenadasLocales({ localidad: 'Ciudad Inexistente', provincia: 'Córdoba' }), null);
});
test('Clave pública conserva provincia y localidad', () => {
  assert.equal(claveLocalidad({ localidad: 'Córdoba', provincia: 'Córdoba' }), 'Córdoba|Córdoba');
});
