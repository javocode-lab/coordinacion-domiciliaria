# Sprint S1.3-D — Formulario de consulta de cobertura

## Alcance

- Restaura en el input el **teléfono original** de la tabla, sin añadir `+` automáticamente.
- Conserva normalización en segundo plano y muestra el destino `549...` por separado.
- Agrega formulario: tipo de valor (hora/sesión), valor, días, horario, franco y barrio.
- El texto se genera tras completar los campos; es editable, copiable y se puede abrir en WhatsApp bajo acción explícita.
- La descripción del caso es opcional y **nunca se precarga desde el diagnóstico**. Se necesita revisión y confirmación expresa de autorización y minimización para incluirla.
- No modifica Excel, backend, registros profesionales ni la persistencia. No registra el contacto ni envía mensajes.

## Instrucciones

Descomprimir este parche en la raíz del proyecto que ya tiene S1.3-C y S1.3-A instalados. Verificar archivos modificados antes de sobrescribir.

```powershell
node --test frontend/src/utils/consulta.test.js
node --test frontend/src/utils/whatsapp.test.js
npm.cmd run build
```

## Validación manual

1. Seleccionar paciente, servicio y profesional ficticio o contacto autorizado.
2. Confirmar que el input no prefija automáticamente `+` y que se ve el destino normalizado separado.
3. Completar los cinco campos operativos y generar el mensaje.
4. Editar vista previa y copiar mensaje; pegarlo en un editor para comprobar UTF-8, emojis y saltos.
5. Cambiar un campo y comprobar que exige regenerar antes de abrir WhatsApp.
6. Comprobar teléfono ambiguo o faltante, sin abrir chat.
7. Comprobar que la descripción del caso no aparece salvo activación y confirmación explícitas.

## Límites

La conversión telefónica no prueba titularidad ni presencia en WhatsApp. Evitar enviar diagnósticos identificables y cualquier dato no autorizado. La base de datos y la edición persistente se implementarán en sprints posteriores.
