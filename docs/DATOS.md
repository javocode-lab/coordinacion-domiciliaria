# Datos de entrada

## pacientes.xlsx (SIN fila de encabezado, 64 registros)
Columnas por posición: 0 nombre ("APELLIDO, NOMBRE"), 1 obra social, 2 sexo, 3 teléfono,
4 domicilio (calle y número), 5 y 6 teléfonos repetidos/alternativos,
7 zona ("CORDOBA" = capital, "PROVINCIA" = interior), 8 localidad o barrio.

## profesionales.xlsx (con encabezado, 1083 registros)
PROFESIONAL, PROVINCIA MAT., TELEFONO, E-MAIL, LOCALIDAD ("( 5000 ) CORDOBA"),
ESPECIALIDAD 01, ESPECIALIDAD 02 (formato "( 8 ) Enf. Profesional").

## Limitaciones detectadas
1. Los profesionales NO tienen domicilio: solo localidad. La ubicación en el mapa es
   el centro de la localidad (57 localidades únicas). La distancia es aproximada.
   Si se obtiene calle/barrio, mejora la precisión.
2. El Excel NO trae movilidad, disponibilidad diurna/nocturna ni radio máximo.
   El ETL deja esos campos vacíos (`movilidad`, `disponibilidad`, `radioMaxKm`).
   Hay que cargarlos (nuevo Excel o edición dentro de la app, Etapa 3).
3. Un profesional puede tener hasta dos especialidades (enfermero + cuidador es lo más común).
4. 5 profesionales sin profesión reconocida (ver `reporte_calidad.json`).
5. ~156 sin e-mail y ~61 sin teléfono válido.
6. Profesionales de Mendoza (83), San Luis (10) y Santiago del Estero (1): todos los pacientes
   están en Córdoba y un caso en San Luis; conviene filtrarlos por distancia.
7. Pacientes: direcciones tipo "Manzana 37 Lote 3" o "Calle Pública 1343" pueden fallar al geocodificar.
