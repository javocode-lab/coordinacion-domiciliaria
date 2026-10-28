import { useMemo, useState } from "react";
import { useDatos } from "./hooks/useDatos.js";
import { useUbicacionPaciente, useCentrosLocalidad } from "./hooks/useUbicaciones.js";
import { normalizar } from "./utils/texto.js";
import Encabezado from "./components/Encabezado.jsx";
import PanelFiltros from "./components/PanelFiltros.jsx";
import SeleccionCaso from "./components/SeleccionCaso.jsx";
import MapaSeccion from "./components/MapaSeccion.jsx";
import Sugerencias from "./components/Sugerencias.jsx";
import PiePagina from "./components/PiePagina.jsx";

const FILTROS_INICIALES = { profesion: "" };

export default function App() {
  const { pacientes, profesionales, profesiones, cargando, error } = useDatos();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [textoPaciente, setTextoPaciente] = useState("");
  const [textoProfesional, setTextoProfesional] = useState("");
  const [pacienteId, setPacienteId] = useState(null);
  const [profesionalId, setProfesionalId] = useState(null);

  const pacientesVisibles = useMemo(() => {
    const q = normalizar(textoPaciente);
    return pacientes.filter((p) => !q || normalizar(p.nombreCompleto).includes(q));
  }, [pacientes, textoPaciente]);

  const profesionalesVisibles = useMemo(() => {
    const q = normalizar(textoProfesional);
    return profesionales.filter(
      (p) =>
        (!filtros.profesion || p.profesiones.includes(filtros.profesion)) &&
        (!q || normalizar(p.nombreCompleto).includes(q))
    );
  }, [profesionales, filtros.profesion, textoProfesional]);

  const paciente = pacientes.find((p) => p.id === pacienteId) ?? null;
  const profesional = profesionales.find((p) => p.id === profesionalId) ?? null;

  const estadoUbicacion = useUbicacionPaciente(pacienteId);
  const centros = useCentrosLocalidad(Boolean(profesionalId));
  const coordsProfesional = centros.coordsDe(profesional);
  const estadoMapa = {
    cargando: estadoUbicacion.cargando || centros.cargando,
    error: estadoUbicacion.error || centros.error,
  };

  return (
    <>
      <Encabezado
        totalPacientes={pacientesVisibles.length}
        totalProfesionales={profesionalesVisibles.length}
      />
      <PanelFiltros
        profesiones={profesiones}
        filtros={filtros}
        onCambiar={(parcial) => setFiltros((f) => ({ ...f, ...parcial }))}
        onLimpiar={() => setFiltros(FILTROS_INICIALES)}
      />
      <main className="app-main">
        {error && <p role="alert">No se pudieron cargar los datos: {error.message}. ¿Está corriendo el backend?</p>}
        {cargando && <p role="status">Cargando datos…</p>}
        <SeleccionCaso
          pacientes={pacientesVisibles}
          profesionales={profesionalesVisibles}
          profesiones={profesiones}
          paciente={paciente}
          profesional={profesional}
          onTextoPaciente={setTextoPaciente}
          onTextoProfesional={setTextoProfesional}
          onPaciente={setPacienteId}
          onProfesional={setProfesionalId}
        />
        <MapaSeccion
          paciente={paciente}
          profesional={profesional}
          ubicacionPaciente={estadoUbicacion.ubicacion}
          coordsProfesional={coordsProfesional}
          estadoUbicacion={estadoMapa}
        />
        <Sugerencias />
      </main>
      <PiePagina />
    </>
  );
}
