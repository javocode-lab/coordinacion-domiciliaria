import ListaPersonas from "./ListaPersonas.jsx";
import FichaPersona from "./FichaPersona.jsx";

export default function SeleccionCaso({
  pacientes, profesionales, profesiones, paciente, profesional,
  onTextoPaciente, onTextoProfesional, onPaciente, onProfesional,
}) {
  const domicilio = paciente
    ? [paciente.ubicacion.direccion, paciente.ubicacion.barrio, paciente.ubicacion.localidad]
        .filter(Boolean).join(", ")
    : null;

  return (
    <section className="seleccion" aria-labelledby="titulo-seleccion">
      <h2 id="titulo-seleccion">Selección de caso</h2>

      <form onSubmit={(e) => e.preventDefault()}>
        <ListaPersonas
          titulo="Paciente"
          ayuda="Seleccione el paciente que requiere el servicio."
          items={pacientes}
          seleccionadoId={paciente?.id}
          etiqueta={(p) => `${p.nombreCompleto} — ${p.ubicacion.localidad}`}
          onBuscar={onTextoPaciente}
          onSeleccionar={onPaciente}
        />
        <ListaPersonas
          titulo="Profesional"
          ayuda="Se filtra según la profesión elegida."
          items={profesionales}
          seleccionadoId={profesional?.id}
          etiqueta={(p) => `${p.nombreCompleto} — ${p.ubicacion.localidad}`}
          onBuscar={onTextoProfesional}
          onSeleccionar={onProfesional}
        />
      </form>

      <FichaPersona
        titulo="Paciente seleccionado"
        filas={paciente ? [
          ["Nombre", paciente.nombreCompleto],
          ["Domicilio", domicilio],
          ["Obra social", paciente.obraSocial],
          ["Teléfono", paciente.telefonos.join(" / ")],
        ] : [["Nombre", null]]}
      />
      <FichaPersona
        titulo="Profesional seleccionado"
        filas={profesional ? [
          ["Nombre", profesional.nombreCompleto],
          ["Profesiones", profesional.profesiones.map((k) => profesiones[k]).join(", ")],
          ["Localidad", `${profesional.ubicacion.localidad} (${profesional.ubicacion.provincia})`],
          ["Teléfono", profesional.telefono],
          ["E-mail", profesional.email],
        ] : [["Nombre", null]]}
      />
    </section>
  );
}
