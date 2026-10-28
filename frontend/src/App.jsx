import { useEffect, useMemo, useState } from "react";
import { useDatos } from "./hooks/useDatos.js";
import { useUbicacionPaciente, useCentrosLocalidad } from "./hooks/useUbicaciones.js";
import { normalizar } from "./utils/texto.js";
import { sugerirCandidato } from "./utils/candidato.js";
import Encabezado from "./components/Encabezado.jsx";
import PanelFiltros from "./components/PanelFiltros.jsx";
import SeleccionCaso from "./components/SeleccionCaso.jsx";
import DetalleSeleccion from "./components/DetalleSeleccion.jsx";
import MapaSeccion from "./components/MapaSeccion.jsx";
import PiePagina from "./components/PiePagina.jsx";

const FILTROS_INICIALES = { profesion: "" };
const POR_PAGINA = 5;

export default function App() {
  const { pacientes, profesionales, profesiones, cargando, error } = useDatos();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [textoPaciente, setTextoPaciente] = useState("");
  const [textoProfesional, setTextoProfesional] = useState("");
  const [pacienteId, setPacienteId] = useState(null);
  const [profesionalId, setProfesionalId] = useState(null);
  const [pagina, setPagina] = useState(1);

  const pacientesVisibles = useMemo(() => {
    const q = normalizar(textoPaciente);
    return pacientes.filter((p) => !q || normalizar(p.nombreCompleto).includes(q));
  }, [pacientes, textoPaciente]);
  const profesionalesVisibles = useMemo(() => {
    const q = normalizar(textoProfesional);
    return profesionales.filter((p) =>
      (!filtros.profesion || p.profesiones.includes(filtros.profesion)) &&
      (!q || normalizar(p.nombreCompleto).includes(q)));
  }, [profesionales, filtros.profesion, textoProfesional]);
  const paciente = pacientes.find((p) => p.id === pacienteId) ?? null;
  const totalPaginas = Math.max(1, Math.ceil(profesionalesVisibles.length / POR_PAGINA));
  const paginaActiva = Math.min(pagina, totalPaginas);
  const profesionalesPagina = profesionalesVisibles.slice((paginaActiva - 1) * POR_PAGINA, paginaActiva * POR_PAGINA);
  const profesional = profesionales.find((p) => p.id === profesionalId) ?? null;

  // Sin solicitud de mapas externos: endpoints locales y catálogo de localidades inicial.
  const estadoPaciente = useUbicacionPaciente(pacienteId);
  const centros = useCentrosLocalidad(Boolean(pacienteId && filtros.profesion));
  const puedeBuscar = Boolean(pacienteId && filtros.profesion);
  const profesionalesMapa = puedeBuscar ? profesionalesPagina.map((p) => ({
    ...p, coordenadas: centros.coordsDe(p),
  })) : [];

  // Solo candidatos visibles; no simula un scoring ni compara datos ausentes.
  const sugerencia = puedeBuscar
    ? sugerirCandidato(estadoPaciente.ubicacion, profesionalesMapa)
    : { candidato: null, razon: "Seleccioná paciente y servicio para evaluar candidatos." };

  const cambiarPaciente = (id) => { setPacienteId(id || null); setPagina(1); setProfesionalId(null); };
  const cambiarFiltros = (parcial) => { setFiltros((f) => ({ ...f, ...parcial })); setPagina(1); setProfesionalId(null); };
  const cambiarBusqueda = (texto) => { setTextoProfesional(texto); setPagina(1); setProfesionalId(null); };
  const cambiarPagina = (n) => { setPagina(n); setProfesionalId(null); };

  useEffect(() => {
    if (profesionalId && !profesionalesPagina.some((p) => p.id === profesionalId)) setProfesionalId(null);
  }, [profesionalId, profesionalesPagina]);

  return <>
    <Encabezado totalPacientes={pacientesVisibles.length} totalProfesionales={puedeBuscar ? profesionalesVisibles.length : 0} />
    <PanelFiltros profesiones={profesiones} filtros={filtros} onCambiar={cambiarFiltros}
      onLimpiar={() => cambiarFiltros(FILTROS_INICIALES)} />
    <main className="app-main">
      {error && <p role="alert">No se pudieron cargar los datos: {error.message}. ¿Está corriendo el backend?</p>}
      {cargando && <p role="status">Cargando datos…</p>}
      <SeleccionCaso pacientes={pacientesVisibles} profesionales={puedeBuscar ? profesionalesPagina : []}
        paciente={paciente} profesional={profesional}
        onTextoPaciente={setTextoPaciente} onTextoProfesional={cambiarBusqueda}
        onPaciente={cambiarPaciente} onProfesional={setProfesionalId}
        pagina={paginaActiva} totalPaginas={totalPaginas} totalResultados={puedeBuscar ? profesionalesVisibles.length : 0}
        onPagina={cambiarPagina} puedeBuscar={puedeBuscar} orientacion={puedeBuscar ? (
          <aside className="candidato-informativo" aria-label="Orientación para coordinación">
        <h2>Orientación para coordinación</h2>
        {sugerencia.candidato ? <p><strong>{sugerencia.candidato.nombreCompleto}</strong> · {sugerencia.candidato.ubicacion?.localidad || "Localidad no informada"}</p>
          : <p><strong>Sin candidato destacado por ahora.</strong></p>}
        <details><summary>Ver fundamento de la orientación</summary><p>{sugerencia.razon}</p>
        <small>No es una asignación. La decisión corresponde al coordinador. La evaluación usa solo los cinco registros de esta página y coordenadas aproximadas.</small></details>
      </aside>) : null} />
      <MapaSeccion paciente={paciente} ubicacionPaciente={estadoPaciente.ubicacion}
        profesionales={profesionalesMapa} candidatoSugeridoId={sugerencia.candidato?.id ?? null} profesionalId={profesionalId} onProfesional={setProfesionalId}
        cargando={estadoPaciente.cargando || centros.cargando}
        error={estadoPaciente.error || centros.error} puedeBuscar={puedeBuscar} />
      <DetalleSeleccion paciente={paciente} profesional={profesional} profesiones={profesiones} servicioSeleccionado={filtros.profesion} />
    </main>
    <PiePagina />
  </>;
}
