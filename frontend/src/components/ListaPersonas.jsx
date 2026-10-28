import { useId } from "react";

/** Listbox accesible con buscador. `etiqueta` arma el texto de cada opción. */
export default function ListaPersonas({ titulo, ayuda, items, seleccionadoId, etiqueta, onBuscar, onSeleccionar }) {
  const id = useId();
  return (
    <fieldset className="campo-lista">
      <legend>{titulo}</legend>
      <label htmlFor={`${id}-buscar`}>Buscar</label>
      <input
        id={`${id}-buscar`}
        type="search"
        placeholder="Apellido o nombre"
        onChange={(e) => onBuscar(e.target.value)}
      />
      <label htmlFor={`${id}-lista`} className="visualmente-oculto">Lista de {titulo.toLowerCase()}s</label>
      <select
        id={`${id}-lista`}
        size={8}
        value={seleccionadoId ?? ""}
        aria-describedby={`${id}-ayuda`}
        onChange={(e) => onSeleccionar(e.target.value)}
      >
        {items.map((it) => (
          <option key={it.id} value={it.id}>{etiqueta(it)}</option>
        ))}
      </select>
      <small id={`${id}-ayuda`}>{ayuda}</small>
    </fieldset>
  );
}
