# Sprint S1.3-C — Presentación de teléfono y verificación UTF-8

## Alcance
- El campo editable inicia con el destino normalizado en formato `+549...` cuando se reconoce.
- Se conserva y muestra el teléfono original, sin modificar los archivos Excel o JSON.
- Los teléfonos convertidos desde formatos nacionales siguen exigiendo confirmación humana; mostrar `+549...` no elimina ese control.
- El emoji de saludo se construye mediante el escape Unicode `\u{1F44B}` para evitar dependencia de la codificación del archivo fuente.
- Nueva prueba de ida y vuelta de codificación URI para emoji, tildes y saltos de línea.

## Verificaciones
```powershell
node --test frontend/src/utils/whatsapp.test.js
npm.cmd run build
```

## Limitaciones
`encodeURIComponent` ya estaba presente y es correcto. Una prueba local no demuestra que WhatsApp Web renderice correctamente todos los caracteres. No enviar mensajes reales sin autorización. Si WhatsApp muestra el símbolo de reemplazo, inspeccionar el texto en el editor y el destino codificado antes de atribuir la causa a nuestra aplicación.
