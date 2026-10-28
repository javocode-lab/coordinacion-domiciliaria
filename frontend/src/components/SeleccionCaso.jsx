import ListaPersonas from "./ListaPersonas.jsx";

export default function SeleccionCaso({
  pacientes, profesionales, paciente, profesional,
  onTextoPaciente, onTextoProfesional, onPaciente, onProfesional,
  pagina, totalPaginas, totalResultados, onPagina, puedeBuscar, orientacion,
}) {
  return <section className="seleccion" aria-labelledby="titulo-seleccion">
    <h2 id="titulo-seleccion">Selección de caso</h2>
    <form onSubmit={(e) => e.preventDefault()}>
      <ListaPersonas titulo="Paciente" ayuda="Seleccione el paciente que requiere el servicio."
        items={pacientes} seleccionadoId={paciente?.id}
        etiqueta={(p) => `${p.nombreCompleto} — ${p.ubicacion.localidad}`}
        onBuscar={onTextoPaciente} onSeleccionar={onPaciente} />
      <ListaPersonas titulo="Profesional" ayuda={puedeBuscar
        ? `Resultados ${totalResultados ? (pagina - 1) * 5 + 1 : 0}–${Math.min(pagina * 5, totalResultados)} de ${totalResultados}. Seleccione para ver la ficha.`
        : "Seleccione paciente y servicio para iniciar la búsqueda automática."}
        items={profesionales} seleccionadoId={profesional?.id}
        etiqueta={(p) => `${p.nombreCompleto} — ${p.ubicacion.localidad}`}
        onBuscar={onTextoProfesional} onSeleccionar={onProfesional} />
      <nav className="paginador" aria-label="Páginas de profesionales">
        <button type="button" disabled={!puedeBuscar || pagina <= 1} onClick={() => onPagina(pagina - 1)}>← Anterior</button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button type="button" disabled={!puedeBuscar || pagina >= totalPaginas} onClick={() => onPagina(pagina + 1)}>Siguiente →</button>
      </nav>
    </form>
    {orientacion}
  </section>;
}
