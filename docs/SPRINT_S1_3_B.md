# Sprint S1.3-B — Normalización de teléfonos para WhatsApp

## Alcance

Mejora el contacto desde la ficha de profesional; no cambia los Excel, ETL, datos JSON, backend ni dependencias.

## Formatos admitidos

- `+54 9 351 123 4567` → `5493511234567` (formato internacional explícito).
- `3511234567` → `5493511234567` (requiere confirmación manual de que sea móvil).
- `+54 351 1234567` → `5493511234567` (requiere confirmación manual).
- `0351 15 1234567` → `5493511234567` (requiere confirmación manual).
- Prefijo nacional `15` se reconoce solo para áreas `11`, `261`, `341`, `351`; otros prefijos se revisan manualmente.

## Salvaguardas

La conversión no certifica titularidad ni existencia de una cuenta de WhatsApp. El coordinador debe revisar el destino visible y confirmar explícitamente las conversiones inferidas. El número editado es temporal: **no se guarda en el Excel ni en una base de datos**. El botón abre WhatsApp con el mensaje sin enviarlo.

Los números con múltiples contactos, extensiones, formatos inesperados o que no permitan obtener 10 dígitos nacionales no producen enlace automático.

## Instalar

Extraer los archivos del parche sobre la raíz del proyecto, conservando carpetas y reemplazando coincidentes. Antes, revisar `git status --short` para proteger cambios locales.

## Verificar en PowerShell

```powershell
node --test frontend/src/utils/whatsapp.test.js
npm.cmd run build
```

Iniciar servicios usando las dos terminales integradas ya documentadas en README. Probar un contacto de ejemplo o autorizado, sin enviar mensajes.

## Estado

- Pruebas de normalización: 7/7 aprobadas en entorno de preparación.
- Build de Vite y validación visual en Windows: pendientes.
- Verificación real de titularidad o cuenta de WhatsApp: fuera de alcance.
