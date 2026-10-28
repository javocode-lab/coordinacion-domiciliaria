# Coordinación de Domicilios — Blacksmith

Aplicación interna para buscar profesionales compatibles con un paciente y un servicio domiciliario, consultar sus localidades aproximadas en un mapa y ayudar a la coordinación a evaluar candidatos. **La elección corresponde al coordinador: la aplicación no asigna automáticamente.**

## Estado funcional (octubre de 2026)

- Frontend: **React 18 + Vite 5 + Leaflet + OpenStreetMap**.
- Backend: **Node.js + Express**; datos locales en JSON.
- Preparación de datos: **Python + pandas + openpyxl** (Excel → JSON).
- Búsqueda automática por paciente y servicio/profesión; filtros según datos disponibles.
- Resultados paginados de **cinco profesionales**, sincronizados con los pines de la página.
- Paciente y profesionales representados juntos cuando se dispone de coordenadas locales.
- La geolocalización disponible es principalmente **aproximada por localidad**, no un domicilio exacto. La orientación de candidatos es preliminar y no vinculante.
- El scoring integral, los aranceles, la edición persistente de perfiles y el contacto por WhatsApp siguen pendientes de completar.

> **Seguridad:** el proyecto utiliza datos personales. Los Excel originales, JSON procesados, cachés y credenciales **no deben publicarse en GitHub ni compartirse sin autorización**. Usar datos ficticios para demostraciones y capturas.

## 1. Requisitos de una estación nueva (Windows)

1. **Git** y **Git Bash** instalados.
2. **Node.js 22 o 24** y npm disponibles. La versión utilizada durante el desarrollo fue Node 24.18.0. Para estos scripts se necesita una versión que soporte `--env-file-if-exists`.
3. **Python 3.12** (o versión compatible con pandas/openpyxl) instalado si se van a regenerar los datos desde Excel. Python no es necesario para iniciar la aplicación si ya están presentes los JSON procesados.
4. Acceso autorizado a los datos de pacientes y profesionales, transferidos por un canal privado.

Verificar desde **PowerShell**, en la terminal integrada de VS Code:

```powershell
git --version
node --version
npm.cmd --version
py --version
```

Si `py` no está disponible, probar `python --version`.

## 2. Obtener el código

Elegí una carpeta de trabajo. Ejemplo desde **Git Bash**:

```bash
mkdir -p /c/Fer/DEV
cd /c/Fer/DEV
git clone https://github.com/javocode-lab/coordinacion-domiciliaria.git
cd coordinacion-domiciliaria
```

> El repositorio remoto podría ser privado: requiere acceso de GitHub. Si ya tenés una copia local, entrá en su carpeta raíz en lugar de clonar de nuevo. El nombre de carpeta puede ser `coordinacion-domicilios` u otro; lo importante es ubicarse donde está el `package.json` principal.
>
> **Atención a los sprints locales:** algunos parches S1.2 pueden no estar en la rama remota hasta que se confirme su `commit` y `push`. Revisá el historial del repositorio antes de asumir que el clon incluye la interfaz más reciente.

## 3. Instalar dependencias de Node

En la raíz del proyecto (PowerShell):

```powershell
npm.cmd ci
```

El proyecto usa npm workspaces: este único comando instala las dependencias del frontend y del backend de acuerdo con `package-lock.json`. Si un repositorio exportado no trae `package-lock.json`, se puede usar `npm.cmd install`, pero conviene conservar el lockfile en Git.

No uses `npm audit fix --force` automáticamente: puede introducir actualizaciones incompatibles.

## 4. Preparar datos privados (paso obligatorio)

El backend lee estos archivos desde `data/processed/`:

```text
data/processed/catalogos.json
data/processed/pacientes.json
data/processed/profesionales.json
data/processed/reporte_calidad.json
```

**Opción A — Transferir datos procesados:** copiar estos cuatro JSON desde una estación autorizada al directorio `data/processed/` de la nueva PC. Es la forma más sencilla de reproducir el estado existente. Protegé el medio de transferencia y eliminá copias temporales cuando corresponda.

**Opción B — Regenerar desde Excel:** copiar de manera privada y autorizada:

```text
data/raw/pacientes.xlsx
data/raw/profesionales.xlsx
```

Después instalar las bibliotecas de Python y ejecutar el ETL, desde la raíz:

```powershell
py -m pip install pandas openpyxl
py scripts/etl/build_data.py
```

Si `py` no existe, sustituirlo por `python`. El script transforma el formato de Excel documentado en `docs/DATOS.md`. **No lo ejecutes sobre otros Excel sin revisar su estructura.** El ETL genera/reemplaza los archivos de `data/processed/`; hacé una copia de seguridad si ya existían datos trabajados manualmente.

Verificar que existan los archivos sin mostrar sus contenidos:

```powershell
Get-ChildItem .\data\processed\
```

**No subir los archivos de `data/raw/`, `data/processed/` ni `data/cache/` a Git.**

## 5. Iniciar y detener el proyecto desde VS Code (Windows / PowerShell)

**Procedimiento validado en una estación Windows:** utilizar **dos terminales integradas dentro de VS Code**, no dos ventanas externas. Esta opción permite ver por separado los registros de la API y de Vite, y detener cada proceso con `Ctrl + C` sin las preguntas adicionales de los archivos por lotes `npm.cmd`.

1. Abrir la carpeta del repositorio en VS Code (la que contiene el `package.json` de la raíz).
2. Abrir el panel **Terminal → Nueva terminal**; comprobar que la terminal sea **PowerShell** y esté ubicada en la raíz del proyecto.
3. En la **Terminal 1 — API**, ejecutar:

   ```powershell
   node --watch backend/src/server.js
   ```

   **Resultado esperado:** `API de coordinación escuchando en http://localhost:4000/api`. Mantener esta terminal abierta.

4. Abrir una **segunda terminal integrada** con el botón `+` del panel Terminal. En la **Terminal 2 — Web**, ejecutar:

   ```powershell
   node .\node_modules\vite\bin\vite.js frontend --config frontend/vite.config.js
   ```

   **Resultado esperado:** Vite indica `Local: http://localhost:5173/`. Mantener también esta terminal abierta.

5. Abrir la aplicación en **http://localhost:5173/**. La API responde en **http://localhost:4000/api**.

### Detener correctamente

- En **Terminal 1**, presionar **`Ctrl + C`** para detener el backend.
- En **Terminal 2**, presionar **`Ctrl + C`** para detener Vite.
- En ambos casos debería regresar el prompt `PS ...>` sin pedir `¿Desea terminar el trabajo por lotes (S/N)?`. Este comportamiento fue comprobado en la estación de trabajo Windows utilizada.
- **No** escribir `S` si el prompt `PS ...>` ya reapareció: PowerShell intentaría ejecutar la letra como comando.

> **Por qué evitamos `npm.cmd` para ejecutar los servidores:** en esta configuración de Windows, interrumpir un archivo por lotes puede generar preguntas `S/N`, incluso repetidas al usar scripts anidados. Los comandos `node` anteriores invocan directamente el backend y Vite. No requieren Concurrently ni herramientas adicionales.
>
> **No usar `--root` con Vite 5:** la opción no está disponible como argumento CLI. El directorio `frontend` se pasa como argumento posicional, como se muestra arriba.

### Verificación rápida sin imprimir datos personales

Con ambos servidores encendidos, abrir **una tercera terminal integrada de forma temporal**, o utilizar otra consola PowerShell, y ejecutar:

```powershell
foreach ($ruta in @('pacientes', 'profesionales', 'catalogos')) {
    $codigo = & curl.exe -s -o NUL -w '%{http_code}' "http://localhost:4000/api/$ruta"
    Write-Host "$ruta`: $codigo"
}
```

Esperado: `200` para los tres endpoints. `000` significa que no se pudo establecer conexión; `500` puede indicar problemas en el backend o en los datos; `404`, ruta incorrecta.

Abrir la aplicación, elegir un paciente y un servicio y verificar que los resultados aparezcan automáticamente. El mapa solo puede representar registros con coordenadas disponibles.

### Confirmar que los procesos se detuvieron (opcional)

Después de detener ambos servicios:

```powershell
Get-NetTCPConnection -State Listen -LocalPort 4000,5173 -ErrorAction SilentlyContinue
```

Si no devuelve filas, ninguno de los dos puertos está escuchando. Si muestra resultados, identificar el proceso antes de intentar detenerlo.

## 6. Comandos cotidianos (PowerShell en VS Code)

| Objetivo | Comando |
|---|---|
| Instalar dependencias | `npm.cmd ci` |
| Iniciar backend | `node --watch backend/src/server.js` |
| Iniciar frontend | `node .\node_modules\vite\bin\vite.js frontend --config frontend/vite.config.js` |
| Detener cada servicio | `Ctrl + C` en su terminal |
| Compilar frontend | `npm.cmd run build` |
| Probar backend | `npm.cmd test -w backend` |
| Probar sugerencia de candidatos (si existe en la versión) | `node --test frontend/src/utils/candidato.test.js` |
| Regenerar JSON desde Excel | `py scripts/etl/build_data.py` |
| Verificar cambios Git | `git status --short` |

Los scripts npm individuales se conservan para mantenimiento y tareas automatizadas; el arranque cotidiano en Windows se realiza directamente con Node, como se comprobó en esta estación.

## 7. Solución de problemas

**La pantalla abre, pero no aparecen pacientes, servicios o profesionales:** verificar que el backend esté ejecutándose en el puerto 4000 y que existan los JSON en `data/processed/`. Que el frontend compile no significa que la API esté disponible.

**`curl` devuelve `000`:** el servidor backend no responde. Revisar su terminal y volver a iniciarlo con `node --watch backend/src/server.js`.

**`500` en un endpoint:** revisar el error del backend y el directorio `data/processed/`. Evitar pegar en chats respuestas completas de `/api/pacientes` o `/api/profesionales` porque contienen datos privados.

**Vite usa otro puerto:** puede haber otro proceso ocupando 5173. Mirar la URL que anuncia la terminal de Vite; evitar tener múltiples versiones ejecutándose a la vez.

**El mapa carga, pero faltan pines:** las ubicaciones locales disponibles son parciales. Profesionales sin coordenadas siguen apareciendo en la lista; no deben mostrarse como domicilios exactos.

**Windows pregunta varias veces `¿Desea terminar el trabajo por lotes (S/N)?`:** comprobar que los servidores se iniciaron con los comandos `node` de la sección 5, no con `npm.cmd run ...` ni con Concurrently. No confundir la confirmación del shell con un error de Vite.

**Los cambios de un parche no aparecen al clonar:** comprobar `git status` y que el commit del sprint haya sido subido a GitHub. `git archive HEAD` exporta solo el último commit, no los archivos modificados sin confirmar.

## 8. Estructura relevante

```text
coordinacion-domicilios/
├── package.json                 # Comandos y workspaces npm
├── package-lock.json            # Versiones de dependencias
├── backend/                     # API Express
├── frontend/                    # React + Vite + Leaflet
├── scripts/etl/build_data.py    # Excel -> JSON
├── data/
│   ├── raw/                     # PRIVADO: Excel originales
│   ├── processed/               # PRIVADO: JSON del backend
│   └── cache/                   # PRIVADO: cachés locales
└── docs/                        # Datos, roadmap y sprints
```

## 9. Variables de entorno

Para el flujo local actual de Leaflet/OpenStreetMap **no hace falta una clave de Google Maps**. Los archivos `.env.example` existentes pueden contener variables de integraciones Google anteriores; no son un requisito para la búsqueda local del MVP.

El backend utiliza el puerto **4000** por defecto. Podés configurar `PORT=4000` en `backend/.env` si lo necesitás. Nunca subas `.env` a GitHub.

## 10. Alcance y límites

- La proximidad por centro de localidad no equivale a distancia vial ni a domicilio exacto.
- El módulo de orientación de candidatos debe distinguir falta de datos y empates; no confirma asignaciones.
- Los filtros de movilidad, disponibilidad y distancia pueden no estar operativos hasta contar con los datos correspondientes.
- La interfaz y documentación evolucionan por sprints. Consultar `docs/ROADMAP.md` y `docs/SPRINT_*.md` cuando existan en tu versión.

---

**Puesta en marcha resumida en VS Code / PowerShell, para una estación con dependencias y JSON ya preparados:**

**Terminal integrada 1 — Backend**

```powershell
node --watch backend/src/server.js
```

**Terminal integrada 2 — Frontend**

```powershell
node .\node_modules\vite\bin\vite.js frontend --config frontend/vite.config.js
```

Abrir **http://localhost:5173/**. Detener con `Ctrl + C` en cada terminal.
