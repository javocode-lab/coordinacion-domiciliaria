# Sprint S1.3-E — Mensaje profesional y transporte de emojis

## Objetivo

Mejorar la presentación de la consulta de cobertura y probar una ruta de apertura de WhatsApp que no pase por la redirección de `wa.me`, donde algunos navegadores/instalaciones transforman emojis en el carácter `�`.

## Cambios

1. `frontend/src/utils/consulta.js`: texto profesional con etiquetas en **negrita de WhatsApp** (`*texto*`), despedida en _cursiva de WhatsApp_ (`_texto_`), emojis contextualizados y saltos de línea.
2. `frontend/src/utils/whatsapp.js`: el enlace se genera como `https://api.whatsapp.com/send?phone=...&text=...` con `encodeURIComponent(mensaje)`, en vez de `wa.me`. Esto evita una redirección identificada en reportes como posible causa, **sin garantizar el comportamiento de una aplicación externa**.
3. Pruebas específicas de contenido, formato y recuperación exacta de emojis desde la URL.

## Instalación

Copiar el contenido del ZIP sobre la raíz del proyecto **con S1.3-D instalado**, conservando los directorios y reemplazando solo los cuatro archivos JavaScript incluidos. No se modifican React, CSS, backend, datos ni credenciales.

## Validación en PowerShell

```powershell
node --test frontend/src/utils/consulta.test.js
node --test frontend/src/utils/whatsapp.test.js
npm.cmd run build
```

Iniciar backend y frontend con los comandos ya documentados en el README. Crear un mensaje con datos ficticios o contacto autorizado; comprobar que `Copiar mensaje` conserva los emojis, abrir WhatsApp **sin enviar**, revisar el borrador y comparar. Si el destinatario presenta `�` aun con este enlace, usar `Copiar mensaje` y pegar manualmente, y registrar navegador, destino (Web/desktop), versión y captura anonimizada. No enviar datos personales o clínicos para reproducir el fallo.

## Seguridad y límites

- No se envía nada automáticamente: WhatsApp abre el borrador y el coordinador decide.
- Se mantienen las confirmaciones de teléfono y de descripción clínica opcional del sprint anterior.
- El contenido de la URL se comunica a WhatsApp al abrir el enlace; evitar identificadores o información clínica innecesaria.
- La codificación UTF-8 se comprueba en las pruebas de código; la interpretación de caracteres dentro de WhatsApp Web/desktop debe verificarse en destino.
- No se implementa persistencia, geocodificación ni asignación automática.
