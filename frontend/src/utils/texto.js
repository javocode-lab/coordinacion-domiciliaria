/** Normaliza texto para búsquedas sin tildes ni mayúsculas. */
export const normalizar = (t = "") =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
