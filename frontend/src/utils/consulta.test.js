import { test } from 'node:test';
import assert from 'node:assert/strict';
import { construirMensajeOperativo, faltantesConsulta } from './consulta.js';

const campos = { tipoValor:'sesion',valor:'[VALOR ACTUALIZADO]',dias:'Lunes y miércoles',horario:'10 a 12',franco:'Domingo',barrio:'Centro',descripcion:'Descripción general aprobada' };
test('Detecta los campos que requieren revisión',()=>{
  assert.deepEqual(faltantesConsulta({valor:'100'}), ['dias','horario','franco','barrio']);
  assert.deepEqual(faltantesConsulta(campos), []);
});
test('El borrador incorpora condiciones operativas sin datos identificatorios',()=>{
 const m=construirMensajeOperativo({servicio:'Fonoaudiología',campos});
 assert.match(m,/\*Valor por sesión:\* \[VALOR ACTUALIZADO\]/);
 assert.match(m,/\*Franco \/ descanso:\* Domingo/);
 assert.match(m,/\*Barrio \/ zona:\* Centro/);
 assert.doesNotMatch(m,/Descripción general del caso/);
 assert.ok(m.includes('👋'));
});
test('La descripción clínica es optativa y requiere autorización explícita en el llamador',()=>{
 const m=construirMensajeOperativo({servicio:'Enfermería',campos,incluirDescripcion:true});
 assert.match(m,/\*Descripción general del caso:\* Descripción general aprobada/);
});
test('Campos vacíos se identifican para revisión, no se inventan datos',()=>{
 const m=construirMensajeOperativo({servicio:'',campos:{}});
 assert.match(m,/\[A CONFIRMAR\]/);
 assert.doesNotMatch(m,/undefined/);
});


test("Mensaje usa formato WhatsApp, emojis y líneas separadas", () => {
  const m=construirMensajeOperativo({servicio:"Enfermería", campos});
  assert.ok(m.includes("👋 *¡Hola, buen día!*"));
  assert.ok(m.includes("🏥 *Servicio:* Enfermería"));
  assert.ok(m.includes("📅 *Días requeridos:* Lunes y miércoles"));
  assert.ok(m.includes("🕒 *Horario:* 10 a 12"));
  assert.ok(m.includes("💰 *Valor por sesión:* [VALOR ACTUALIZADO]"));
  assert.ok(m.includes("_Quedamos atentos a tu respuesta."));
  assert.ok(m.includes("🙌"));
  assert.ok(!m.includes("�"));
});
