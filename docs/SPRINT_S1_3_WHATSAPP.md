# Blacksmith — Sprint S1.3: Contacto por WhatsApp

## Alcance

Se añade un panel de contacto a la ficha del profesional seleccionado. El coordinador puede editar un texto de consulta de disponibilidad y abrir WhatsApp mediante `wa.me`. La aplicación no envía el mensaje automáticamente ni confirma asignaciones.

## Privacidad

El texto por defecto incluye servicio y localidad del paciente, pero **no** su nombre, domicilio exacto ni información clínica. Al abrir WhatsApp, el mensaje y el teléfono se transmiten al servicio externo; la acción exige un clic explícito.

## Limitación de datos

El ETL admite teléfonos de diez o más dígitos, pero no identifica de manera fiable líneas móviles de Argentina. Por seguridad, este sprint solo habilita el enlace cuando el número registrado tiene el formato inequívoco `549` + 10 dígitos. **Muchos teléfonos reales quedarán temporalmente inhabilitados** aunque puedan utilizar WhatsApp; será necesario mejorar la normalización mediante una etapa de verificación de teléfonos, sin inventar dígitos ni convertir líneas fijas a móviles.

## Instalación

Extraer el ZIP sobre la raíz del proyecto, conservando la estructura; reemplazar únicamente los archivos indicados. No se modifican backend, ETL, datos ni dependencias.

## Validación local (PowerShell)

```powershell
node --test frontend/src/utils/whatsapp.test.js
npm.cmd run build
```

Backend: `node --watch backend/src/server.js`.
Frontend: `node .\node_modules\vite\bin\vite.js frontend --config frontend/vite.config.js`.

Seleccionar paciente, servicio y profesional. Verificar estado deshabilitado si el teléfono no es inequívocamente móvil, y verificar manualmente el texto prearmado con un **número ficticio de prueba** antes de usar datos reales. No realizar envío.

## Estado

- 5 tests unitarios de WhatsApp ejecutados correctamente en preparación del parche.
- Compilación Vite y prueba de navegador: pendientes de ejecutar en la estación del usuario.
- Sin actualización de README o commit hasta validar el funcionamiento local.
