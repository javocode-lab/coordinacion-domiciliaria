#!/usr/bin/env python3
"""
ETL: Excel -> JSON normalizado.

Uso (desde la raíz del proyecto):
    pip install pandas openpyxl
    python scripts/etl/build_data.py

Entradas : data/raw/pacientes.xlsx, data/raw/profesionales.xlsx
Salidas  : data/processed/pacientes.json
           data/processed/profesionales.json
           data/processed/catalogos.json
           data/processed/reporte_calidad.json
"""
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parents[2]
RAW = RAIZ / "data" / "raw"
OUT = RAIZ / "data" / "processed"

# --------------------------------------------------------------------------
# Catálogo canónico de profesiones (clave -> etiqueta visible)
# --------------------------------------------------------------------------
PROFESIONES = {
    "cuidador": "Cuidador/a domiciliario/a",
    "enfermero": "Enfermero/a",
    "kinesiologo": "Kinesiólogo/a",
    "fonoaudiologo": "Fonoaudiólogo/a",
    "medico": "Médico/a",
    "psicologo": "Psicólogo/a",
    "psicomotricista": "Psicomotricista",
    "terapista_ocupacional": "Terapista ocupacional",
    "asistente_terapeutico": "Asistente terapéutico",
    "nutricionista": "Nutricionista",
    "estimulacion_temprana": "Estimulación temprana",
    "trabajador_social": "Trabajador/a social",
}

# Texto del Excel (sin código numérico, sin acentos) -> (clave, subespecialidad)
MAPA_ESPECIALIDAD = {
    "cuidadores domiciliarios": ("cuidador", None),
    "enf. profesional": ("enfermero", None),
    "kinesiologia": ("kinesiologo", None),
    "fonoaudiologia": ("fonoaudiologo", None),
    "medicos clinicos": ("medico", "Clínica médica"),
    "medico": ("medico", None),
    "pediatria": ("medico", "Pediatría"),
    "fisiatria": ("medico", "Fisiatría"),
    "paleativo": ("medico", "Cuidados paliativos"),
    "psiquiatria": ("medico", "Psiquiatría"),
    "psicologia": ("psicologo", None),
    "psicomotricidad": ("psicomotricista", None),
    "terapia ocupacional": ("terapista_ocupacional", None),
    "asistente terapeutico": ("asistente_terapeutico", None),
    "nutriologia": ("nutricionista", None),
    "estimulacion temprana": ("estimulacion_temprana", None),
    "trabajador social": ("trabajador_social", None),
}

# Barrios de la ciudad de Córdoba que aparecen como "localidad" en los Excel
BARRIOS_CORDOBA = {"ALTO ALBERDI", "BAJO PALERMO", "ARGUELLO", "VILLA BELGRANO"}
ALIAS_LOCALIDAD = {
    "CALERA CENTRAL": "La Calera",
    "LA CALERA (DPTO.COLON)": "La Calera",
    "LA CUMBRE (DPTO.PUNILLA)": "La Cumbre",
    "LA FALDA (DPTO.PUNILLA)": "La Falda",
    "ANI-MI": "Ani Mí",
    "VILLA NUEVA DE GUAYMALLEN": "Guaymallén",
    "VILLA 9 DE JULIO": "Villa 9 de Julio",
}
MINUSCULAS = {"de", "del", "la", "las", "los", "y", "el"}

# Restituye tildes en localidades (clave: minúsculas sin acentos)
TILDES_LOCALIDAD = {
    "cordoba": "Córdoba", "rio cuarto": "Río Cuarto", "rio primero": "Río Primero",
    "rio segundo": "Río Segundo", "guaymallen": "Guaymallén", "lujan de cuyo": "Luján de Cuyo",
    "maipu": "Maipú", "unquillo": "Unquillo", "arguello": "Argüello", "juarez celman": "Juárez Celman",
    "jesus maria": "Jesús María", "tanti": "Tanti", "saldan": "Saldán", "calchin": "Calchín",
    "guinazu": "Guiñazú", "despenaderos": "Despeñaderos", "bialet masse": "Bialet Massé",
    "transito": "Tránsito", "san luis": "San Luis", "santiago del estero": "Santiago del Estero",
    "rodeo de la cruz": "Rodeo de la Cruz", "villa maria": "Villa María",
}


def tilde_localidad(texto):
    clave = sin_acentos(texto).lower().strip()
    return TILDES_LOCALIDAD.get(clave, texto)


def sin_acentos(texto):
    return "".join(
        c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn"
    )


def titulo(texto):
    palabras = re.sub(r"\s+", " ", str(texto)).strip().lower().split(" ")
    return " ".join(
        p if (i and p in MINUSCULAS) else p.capitalize() for i, p in enumerate(palabras)
    )


def nombre_persona(bruto):
    """'APELLIDO, NOMBRE' -> {apellido, nombre, nombreCompleto}"""
    bruto = re.sub(r"\s+", " ", str(bruto)).strip()
    if "," in bruto:
        ape, nom = [t.strip() for t in bruto.split(",", 1)]
    else:
        ape, nom = bruto, ""
    return {
        "apellido": titulo(ape),
        "nombre": titulo(nom),
        "nombreCompleto": f"{titulo(ape)}, {titulo(nom)}".strip(", "),
    }


def telefono(valor):
    """Devuelve solo dígitos si parece un teléfono real (>= 10 dígitos)."""
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return None
    texto = str(valor)
    if texto.endswith(".0"):
        texto = texto[:-2]
    digitos = re.sub(r"\D", "", texto)
    if digitos.startswith("0"):
        digitos = digitos[1:]
    return digitos if len(digitos) >= 10 else None


def provincia_por_cp(cp, localidad):
    if localidad.upper() == "MERLO":
        return "San Luis"
    if not cp:
        return "Córdoba"
    n = int(cp)
    if 5500 <= n <= 5699:
        return "Mendoza"
    if 5700 <= n <= 5799:
        return "San Luis"
    if n == 4200:
        return "Santiago del Estero"
    return "Córdoba"


def parsear_localidad(bruto):
    """'( 5000 ) CORDOBA' -> {cp, localidad, barrio, provincia}"""
    m = re.match(r"\(\s*(\d+)\s*\)\s*(.+)", str(bruto).strip())
    cp, resto = (m.group(1), m.group(2)) if m else (None, str(bruto).strip())
    clave = resto.strip().upper()
    barrio = None
    if clave in BARRIOS_CORDOBA:
        barrio, loc = tilde_localidad(titulo(clave)), "Córdoba"
    elif clave in ALIAS_LOCALIDAD:
        loc = ALIAS_LOCALIDAD[clave]
    else:
        loc = tilde_localidad(titulo(re.sub(r"\(.*?\)", "", resto)))
    return {
        "cp": cp,
        "localidad": loc,
        "barrio": barrio,
        "provincia": provincia_por_cp(cp, loc),
    }


def parsear_especialidad(bruto):
    texto = re.sub(r"^\(\s*-?\d*\s*\)\s*", "", str(bruto)).strip()
    clave = sin_acentos(re.sub(r"\s+", " ", texto)).lower()
    return MAPA_ESPECIALIDAD.get(clave)


# --------------------------------------------------------------------------
def procesar_profesionales():
    df = pd.read_excel(RAW / "profesionales.xlsx")
    salida, sin_profesion = [], []
    for i, fila in enumerate(df.itertuples(index=False), start=1):
        profesiones, subesp, originales = [], [], []
        for col in (fila[5], fila[6]):
            originales.append(str(col))
            hit = parsear_especialidad(col)
            if hit:
                if hit[0] not in profesiones:
                    profesiones.append(hit[0])
                if hit[1] and hit[1] not in subesp:
                    subesp.append(hit[1])
        loc = parsear_localidad(fila[4])
        mail = str(fila[3]).strip().lower()
        registro = {
            "id": f"PRO-{i:04d}",
            **nombre_persona(fila[0]),
            "telefono": telefono(fila[2]),
            "email": None if mail in ("falta", "nan", "") else mail,
            "provinciaMatricula": None if pd.isna(fila[1]) else str(fila[1]),
            "ubicacion": loc,
            "profesiones": profesiones,
            "subespecialidades": subesp,
            "especialidadesOriginales": originales,
            # Campos operativos: NO vienen en el Excel (ver docs/DATOS.md)
            "movilidad": None,      # auto | moto | transporte_publico | sin_movilidad
            "disponibilidad": [],   # diurna | nocturna | fines_de_semana
            "radioMaxKm": None,     # radio máximo que acepta recorrer
        }
        if not profesiones:
            sin_profesion.append(registro["id"])
        salida.append(registro)
    return salida, sin_profesion


def procesar_pacientes():
    # El Excel de pacientes NO tiene fila de encabezado.
    df = pd.read_excel(RAW / "pacientes.xlsx", header=None)
    salida = []
    for i, f in enumerate(df.itertuples(index=False), start=1):
        loc = parsear_localidad(str(f[8]).strip())
        tels = [t for t in (telefono(f[3]), telefono(f[5]), telefono(f[6])) if t]
        direccion = re.sub(r"\s+", " ", str(f[4])).strip()
        provincia = "San Luis" if loc["localidad"].lower() == "san luis" else "Córdoba"
        ubic = {
            "direccion": titulo(direccion),
            "localidad": loc["localidad"],
            "barrio": loc["barrio"],
            "provincia": provincia,
            "zona": "capital" if str(f[7]).strip().upper() == "CORDOBA" else "interior",
        }
        partes = [ubic["direccion"], ubic["barrio"], ubic["localidad"], provincia, "Argentina"]
        ubic["consultaGeocodificacion"] = ", ".join(p for p in partes if p)
        salida.append(
            {
                "id": f"PAC-{i:04d}",
                **nombre_persona(f[0]),
                "obraSocial": titulo(f[1]),
                "sexo": str(f[2]).strip().upper(),
                "telefonos": list(dict.fromkeys(tels)),
                "ubicacion": ubic,
                "serviciosRequeridos": [],  # a completar por coordinación
            }
        )
    return salida


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    pros, sin_prof = procesar_profesionales()
    pacs = procesar_pacientes()

    pros.sort(key=lambda r: r["nombreCompleto"])
    pacs.sort(key=lambda r: r["nombreCompleto"])

    reporte = {
        "totales": {"pacientes": len(pacs), "profesionales": len(pros)},
        "profesionalesSinProfesionReconocida": sin_prof,
        "profesionalesSinEmail": sum(1 for p in pros if not p["email"]),
        "profesionalesSinTelefonoValido": sum(1 for p in pros if not p["telefono"]),
        "profesionalesPorProfesion": dict(
            Counter(k for p in pros for k in p["profesiones"]).most_common()
        ),
        "profesionalesPorProvincia": dict(Counter(p["ubicacion"]["provincia"] for p in pros)),
        "localidadesUnicasProfesionales": len(
            {(p["ubicacion"]["localidad"], p["ubicacion"]["provincia"]) for p in pros}
        ),
        "pacientesSinTelefonoValido": sum(1 for p in pacs if not p["telefonos"]),
    }

    escribir = lambda nombre, dato: (OUT / nombre).write_text(
        json.dumps(dato, ensure_ascii=False, indent=2), "utf-8"
    )
    escribir("catalogos.json", {"profesiones": PROFESIONES})
    escribir("pacientes.json", pacs)
    escribir("profesionales.json", pros)
    escribir("reporte_calidad.json", reporte)
    print(json.dumps(reporte, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
