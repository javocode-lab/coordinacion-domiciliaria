/** Normalización conservadora: formato de enlace no prueba titularidad ni cuenta WhatsApp. */
const MOVIL_INTERNACIONAL = /^549\d{10}$/;
const NACIONAL = /^\d{10}$/;

export function normalizarTelefonoWhatsapp(valor) {
  if (valor == null || !String(valor).trim()) return { numero: null, requiereConfirmacion: false, razon: "No hay teléfono registrado." };
  const texto = String(valor).trim();
  if (/[;/]|\b(?:int|interno|ext|anexo)\b/i.test(texto) || /\d\s+(?:o|y)\s+\d/i.test(texto)) {
    return { numero: null, requiereConfirmacion: false, razon: "Hay varios teléfonos o una extensión. Revisá el contacto manualmente." };
  }
  if (!/^[+\d\s().-]+$/.test(texto) || (texto.match(/\+/g) || []).length > 1 || (texto.includes("+") && !texto.startsWith("+"))) {
    return { numero: null, requiereConfirmacion: false, razon: "El teléfono tiene caracteres o prefijos no admitidos." };
  }
  let digitos = texto.replace(/\D/g, "");
  if (digitos.startsWith("00")) digitos = digitos.slice(2);

  if (MOVIL_INTERNACIONAL.test(digitos)) {
    return { numero: digitos, requiereConfirmacion: false, razon: null };
  }

  // Ej.: +54 351 1234567, 3511234567. Falta prefijo 9; no se puede confirmar si es celular.
  if (/^54\d{10}$/.test(digitos)) digitos = digitos.slice(2);

  // Ej.: 0351 15 1234567. Solo reconoce códigos de área explícitos conocidos.
  // Cualquier otro prefijo 15 queda para edición manual; no se adivina dónde termina el área.
  if (/^0(?:11|261|341|351)15\d+$/.test(digitos)) {
    const sinCero = digitos.slice(1);
    const area = ["11", "261", "341", "351"].find((a) => sinCero.startsWith(a + "15"));
    const local = sinCero.slice(area.length + 2);
    digitos = area + local;
  }

  if (NACIONAL.test(digitos)) {
    return {
      numero: "549" + digitos,
      requiereConfirmacion: true,
      razon: "Número convertido al formato móvil argentino. Confirmá que sea un celular del profesional antes de abrir WhatsApp."
    };
  }

  return { numero: null, requiereConfirmacion: false, razon: "No se pudo convertir a diez dígitos nacionales. Ingresá el número móvil con +54 9 y código de área." };
}

export function construirMensajeConsulta({ servicio, localidad }) {
  const etiquetaServicio = servicio?.trim() || "una prestación domiciliaria";
  const zona = localidad?.trim() || "una zona a confirmar";
  return `Hola, buen día. \u{1F44B}\n\nTe escribimos desde Coordinación para consultar tu disponibilidad para cubrir ${etiquetaServicio} en ${zona}.\n\n¿Contás con disponibilidad e interés en la cobertura?\n\nMuchas gracias.`;
}

export function enlaceWhatsapp(numero, mensaje) {
  if (!MOVIL_INTERNACIONAL.test(String(numero ?? "")) || !String(mensaje ?? "").trim()) return null;
  // Acceso directo al compositor: evita la redirección wa.me, que en ciertas
  // versiones de WhatsApp Web ha sustituido emojis por el carácter �.
  // No garantiza comportamiento del servicio externo; se mantiene "Copiar mensaje".
  return `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
}
