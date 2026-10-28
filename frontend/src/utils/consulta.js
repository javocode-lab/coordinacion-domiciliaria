/** Borrador operativo; no realiza envíos ni consulta datos personales. */
export const CAMPOS_CONSULTA = ["valor", "dias", "horario", "franco", "barrio"];

export function faltantesConsulta(campos) {
  return CAMPOS_CONSULTA.filter((clave) => !String(campos?.[clave] ?? "").trim());
}

export function construirMensajeOperativo({ servicio, campos, incluirDescripcion = false }) {
  const limpio = (clave, fallback = "[A CONFIRMAR]") => String(campos?.[clave] ?? "").trim() || fallback;
  const tipo = campos?.tipoValor === "hora" ? "hora" : "sesión";
  // Sintaxis propia de WhatsApp: *negrita* y _cursiva_. No es Markdown renderizado por la app.
  // Se usan saltos de línea reales; la URL los codifica al abrir WhatsApp.
  const lineas = [
    "👋 *¡Hola, buen día!*", "",
    "Te escribimos desde *Coordinación* para consultar tu disponibilidad para una cobertura domiciliaria.", "",
    `🏥 *Servicio:* ${String(servicio || "Prestación domiciliaria").trim()}`,
    `💰 *Valor por ${tipo}:* ${limpio("valor")}`,
    `📅 *Días requeridos:* ${limpio("dias")}`,
    `🕒 *Horario:* ${limpio("horario")}`,
    `🌿 *Franco / descanso:* ${limpio("franco")}`,
    `📍 *Barrio / zona:* ${limpio("barrio")}`,
  ];
  if (incluirDescripcion && String(campos?.descripcion || "").trim()) {
    lineas.push("", `📝 *Descripción general del caso:* ${limpio("descripcion")}`);
  }
  lineas.push("", "¿Contás con disponibilidad e interés en esta cobertura?", "", "_Quedamos atentos a tu respuesta. ¡Muchas gracias!_ 🙌");
  return lineas.join("\n");
}
