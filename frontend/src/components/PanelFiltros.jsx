const DISPONIBILIDADES = [
  ["diurna", "Diurna"],
  ["nocturna", "Nocturna"],
  ["fines_de_semana", "Fines de semana"],
];

export default function PanelFiltros({ profesiones, filtros, onCambiar, onLimpiar }) {
  return (
    <aside className="panel-filtros" aria-label="Filtros de búsqueda">
      <form autoComplete="off" onReset={(e) => { e.preventDefault(); onLimpiar(); }}>
        <h2>Filtros</h2>

        <fieldset>
          <legend>Servicio a asignar</legend>
          <label htmlFor="filtro-profesion">Profesión</label>
          <select
            id="filtro-profesion"
            value={filtros.profesion}
            onChange={(e) => onCambiar({ profesion: e.target.value })}
          >
            <option value="">Todas</option>
            {Object.entries(profesiones).map(([clave, etiqueta]) => (
              <option key={clave} value={clave}>{etiqueta}</option>
            ))}
          </select>
        </fieldset>

        <fieldset disabled>
          <legend>Distancia al domicilio</legend>
          <label htmlFor="filtro-km-min">Mínima (km)</label>
          <input id="filtro-km-min" type="number" min="0" step="1" />
          <label htmlFor="filtro-km-max">Máxima (km)</label>
          <input id="filtro-km-max" type="number" min="0" step="1" />
          <small>Se habilita en la Etapa 2 (requiere Google Maps).</small>
        </fieldset>

        <fieldset disabled>
          <legend>Movilidad</legend>
          <label htmlFor="filtro-movilidad">Medio de movilidad</label>
          <select id="filtro-movilidad"><option>Indistinto</option></select>
          <small>Se habilita en la Etapa 3 (dato aún no disponible en el Excel).</small>
        </fieldset>

        <fieldset disabled>
          <legend>Disponibilidad</legend>
          <ul className="lista-checks">
            {DISPONIBILIDADES.map(([valor, etiqueta]) => (
              <li key={valor}>
                <label><input type="checkbox" value={valor} /> {etiqueta}</label>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="reset">Limpiar filtros</button>
      </form>
    </aside>
  );
}
