import FichaPersona from "./FichaPersona.jsx";

/** Información del caso en área ancha, fuera de la columna de búsqueda. */
export default function DetalleSeleccion({ paciente, profesional, profesiones }) {
  const domicilio = paciente
    ? [paciente.ubicacion?.direccion, paciente.ubicacion?.barrio, paciente.ubicacion?.localidad]
        .filter(Boolean).join(", ")
    : null;

  return <section className="detalle-seleccion" aria-label="Información del caso seleccionado">
    <div className="detalle-seleccion__grid">
      <FichaPersona titulo="Paciente seleccionado" filas={paciente ? [
        ["Nombre", paciente.nombreCompleto],
        ["Domicilio", domicilio],
        ["Obra social", paciente.obraSocial],
        ["Teléfono", paciente.telefonos?.join(" / ")],
      ] : [["Nombre", null]]} />
      <FichaPersona titulo="Profesional seleccionado" filas={profesional ? [
        ["Nombre", profesional.nombreCompleto],
        ["Profesiones", profesional.profesiones?.map((k) => profesiones[k] || k).join(", ")],
        ["Localidad", [profesional.ubicacion?.localidad, profesional.ubicacion?.provincia].filter(Boolean).join(" · ")],
        ["Teléfono", profesional.telefono],
        ["E-mail", profesional.email],
        ["Movilidad", profesional.movilidad || "No informada"],
        ["Disponibilidad", profesional.disponibilidad?.length ? profesional.disponibilidad.join(", ") : "No informada"],
        ["Arancel", "No informado"],
        ["Scoring", "Pendiente de implementar"],
      ] : [["Nombre", null]]} />
    </div>
  </section>;
}
