export default function Encabezado({ totalPacientes, totalProfesionales }) {
  return (
    <header className="app-header">
      <h1 className="app-header__titulo">Coordinación de domicilios</h1>
      <p className="app-header__subtitulo">Asignación de profesionales según cercanía al paciente</p>
      <nav aria-label="Estado de la aplicación">
        <ul className="estado">
          <li>Pacientes: <strong>{totalPacientes}</strong></li>
          <li>Profesionales: <strong>{totalProfesionales}</strong></li>
        </ul>
      </nav>
    </header>
  );
}
