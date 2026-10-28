import { Fragment } from "react";

/** Ficha de datos clave/valor con lista de definición. */
export default function FichaPersona({ titulo, filas }) {
  return (
    <article className="ficha" aria-live="polite">
      <h3>{titulo}</h3>
      <dl>
        {filas.map(([clave, valor]) => (
          <FilaFicha key={clave} clave={clave} valor={valor} />
        ))}
      </dl>
    </article>
  );
}

function FilaFicha({ clave, valor }) {
  return (
    <Fragment>
      <dt>{clave}</dt>
      <dd>{valor || "—"}</dd>
    </Fragment>
  );
}
