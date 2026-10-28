import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarTelefonoWhatsapp, construirMensajeConsulta, enlaceWhatsapp } from "./whatsapp.js";

test("Acepta móvil internacional explícito", () => {
  assert.deepEqual(normalizarTelefonoWhatsapp("+54 9 351 123 4567"), {numero:"5493511234567", requiereConfirmacion:false, razon:null});
  assert.equal(normalizarTelefonoWhatsapp("005493511234567").numero, "5493511234567");
});
test("Número local de Córdoba se convierte pero exige confirmación", () => {
  const r = normalizarTelefonoWhatsapp("3511234567");
  assert.equal(r.numero, "5493511234567");
  assert.equal(r.requiereConfirmacion, true);
});
test("Formato 0351 15 requiere confirmación", () => {
  const r = normalizarTelefonoWhatsapp("0351 15 1234567");
  assert.equal(r.numero, "5493511234567");
  assert.equal(r.requiereConfirmacion, true);
});
test("Número con +54 sin 9 requiere confirmación", () => {
  const r = normalizarTelefonoWhatsapp("+54 351 1234567");
  assert.equal(r.numero, "5493511234567");
  assert.equal(r.requiereConfirmacion, true);
});
test("Números no reconocibles y múltiples no generan destino", () => {
  for (const val of [null,"","123", "3511234567 / 3517654321", "0351 15 1234 int 2", "+59899123456", "abc", "+54+93511234567"]) {
    assert.equal(normalizarTelefonoWhatsapp(val).numero, null, String(val));
  }
});
test("Enlace codifica el texto y no acepta números nacionales", () => {
  assert.match(enlaceWhatsapp("5493511234567", "Hola, ¿disponible?"), /^https:\/\/api\.whatsapp\.com\/send\?phone=5493511234567&text=/);
  assert.equal(enlaceWhatsapp("3511234567", "Hola"), null);
});
test("El mensaje no incorpora datos clínicos", () => {
  const m = construirMensajeConsulta({servicio:"Fonoaudiología", localidad:"Córdoba"});
  assert.match(m, /Fonoaudiología/);
  assert.doesNotMatch(m, /diagnóstico|paciente:/i);
});

test("El enlace conserva emoji, tildes y saltos de línea en UTF-8", () => {
  const mensaje = construirMensajeConsulta({ servicio: "Fonoaudiología", localidad: "Córdoba" });
  const url = enlaceWhatsapp("5493511234567", mensaje);
  assert.ok(url.includes("%F0%9F%91%8B"), "Debe codificar el saludo 👋 como UTF-8");
  const decodificado = new URL(url).searchParams.get("text");
  assert.equal(decodificado, mensaje);
  assert.ok(decodificado.includes("👋"));
  assert.ok(decodificado.includes("¿Contás"));
  assert.ok(decodificado.includes("\n\n"));
  assert.ok(!decodificado.includes("�"));
});


test("La URL directa conserva mensaje operativo con formato y emojis", () => {
  const mensaje = "👋 *¡Hola!*\n\n🏥 *Servicio:* Fonoaudiología\n_Gracias_ 🙌";
  const url = enlaceWhatsapp("5493511234567", mensaje);
  assert.ok(url.startsWith("https://api.whatsapp.com/send?phone=5493511234567&text="));
  assert.ok(url.includes("%F0%9F%91%8B"));
  assert.equal(new URL(url).searchParams.get("text"), mensaje);
  assert.ok(!url.includes("�"));
});
