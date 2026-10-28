# Coordinación de domicilios

Herramienta interna para que el departamento de coordinación asigne profesionales
(enfermeros, cuidadores, kinesiólogos, fonoaudiólogos, médicos, psicólogos, etc.)
al domicilio de cada paciente según cercanía y facilidad de acceso, con Google Maps.

**Stack:** React (Vite) · Node + Express · Python (ETL de Excel) · Google Maps.

## Estructura

```
coordinacion-domicilios/
├── package.json               # Workspaces npm (backend + frontend)
├── data/
│   ├── raw/                   # Excel originales
│   └── processed/             # JSON generados por el ETL (los lee el backend)
├── scripts/etl/build_data.py  # Python: Excel -> JSON normalizado
├── backend/                   # API Node + Express
│   └── src/ { config, routes, controllers, services }
├── frontend/                  # UI React + Vite (HTML semántico)
│   └── src/ { api, hooks, components, styles, utils }
└── docs/                      # DATOS.md, ROADMAP.md
```

## Puesta en marcha

```bash
# 1) Datos (Python)
pip install pandas openpyxl
npm run etl

# 2) Dependencias (Node >= 20)
npm install

# 3) Dos terminales
npm run dev:backend     # API en http://localhost:4000/api
npm run dev:frontend    # UI en  http://localhost:5173
```

Copiar `backend/.env.example` a `backend/.env` y `frontend/.env.example` a
`frontend/.env` cuando se incorporen las claves de Google Maps (Etapa 2).

## API actual

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/salud` | Estado del servicio |
| GET | `/api/catalogos` | Catálogo de profesiones |
| GET | `/api/pacientes` | Lista de pacientes |
| GET | `/api/pacientes/:id` | Un paciente |
| GET | `/api/profesionales?profesion=&q=` | Profesionales filtrados |
| GET | `/api/ubicaciones/paciente/:id` | Coordenadas del domicilio (Geocoding + caché) |
| GET | `/api/ubicaciones/localidades` | Centro de cada localidad de los profesionales |

## Claves de Google (Etapa 2)
En Google Cloud habilitar **Maps JavaScript API** y **Geocoding API**.
- `frontend/.env` → `VITE_GOOGLE_MAPS_API_KEY` (restringir por dominio / HTTP referrer).
- `backend/.env` → `GOOGLE_MAPS_SERVER_KEY` (restringir por IP, solo Geocoding).
Las geocodificaciones se guardan en `data/cache/geocodificacion.json`, así cada dirección se consulta una sola vez.
Pruebas del backend: `npm test -w backend`.

## Notas de diseño
- El HTML evita `<div>`: se usan `header`, `aside`, `main`, `section`, `article`, `fieldset`, `dl`, `ol/ul`, `figure`, `footer`. El punto de montaje de React es el elemento personalizado `<app-root>`.
- Las claves de Google se separan: la del **servidor** (Geocoding/Distance Matrix) vive solo en el backend; la del **navegador** (Maps JavaScript) se restringe por dominio.

## Estado
Etapas 1 y 2 completas. Ver `docs/ROADMAP.md`.
