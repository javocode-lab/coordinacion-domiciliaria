import { useEffect, useMemo, useState } from "react";
import { normalizarTelefonoWhatsapp, enlaceWhatsapp } from "../utils/whatsapp.js";
import { construirMensajeOperativo, faltantesConsulta } from "../utils/consulta.js";

const CAMPOS_INICIALES = { tipoValor: "sesion", valor: "", dias: "", horario: "", franco: "", barrio: "", descripcion: "" };

/** Borrador local sin persistencia: jamás envía mensajes ni registra asignaciones. */
export default function ContactoWhatsapp({ profesional, servicio, localidad }) {
  const [telefonoEditado, setTelefonoEditado] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [requiereConfirmacionOrigen, setRequiereConfirmacionOrigen] = useState(false);
  const [campos, setCampos] = useState(CAMPOS_INICIALES);
  const [incluirDescripcion, setIncluirDescripcion] = useState(false);
  const [autorizaDescripcion, setAutorizaDescripcion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [borradorVigente, setBorradorVigente] = useState(false);
  const [estadoCopia, setEstadoCopia] = useState("");

  useEffect(() => {
    const original = profesional?.telefono ? String(profesional.telefono) : "";
    const resultado = normalizarTelefonoWhatsapp(original);
    // Mostrar formato original, sin agregar '+'. El destino internacional queda debajo.
    setTelefonoEditado(original);
    setConfirmado(false);
    setRequiereConfirmacionOrigen(resultado.requiereConfirmacion);
  }, [profesional?.id, profesional?.telefono]);

  useEffect(() => {
    setCampos({ ...CAMPOS_INICIALES, barrio: "" });
    setIncluirDescripcion(false);
    setAutorizaDescripcion(false);
    setMensaje("");
    setBorradorVigente(false);
    setEstadoCopia("");
  }, [profesional?.id, servicio, localidad]);

  const validacion = useMemo(() => normalizarTelefonoWhatsapp(telefonoEditado), [telefonoEditado]);
  if (!profesional) return null;

  const faltantes = faltantesConsulta(campos);
  const requiereConfirmacion = validacion.requiereConfirmacion || requiereConfirmacionOrigen;
  const puedeIncluirDescripcion = !incluirDescripcion || (!campos.descripcion.trim() || autorizaDescripcion);
  const listo = faltantes.length === 0 && puedeIncluirDescripcion;
  const url = borradorVigente && listo && (!requiereConfirmacion || confirmado)
    ? enlaceWhatsapp(validacion.numero, mensaje)
    : null;
  const actualizar = (clave, valor) => {
    setCampos((anterior) => ({ ...anterior, [clave]: valor }));
    setBorradorVigente(false);
    setEstadoCopia("");
    if (clave === "descripcion") setAutorizaDescripcion(false);
  };
  const generar = () => {
    if (!listo) return;
    setMensaje(construirMensajeOperativo({ servicio, campos, incluirDescripcion: incluirDescripcion && autorizaDescripcion }));
    setBorradorVigente(true);
    setEstadoCopia("");
  };
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensaje);
      setEstadoCopia("Mensaje copiado al portapapeles.");
    } catch {
      setEstadoCopia("No se pudo copiar automáticamente. Seleccioná el texto de la vista previa y copialo manualmente.");
    }
  };
  const abrir = () => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };
  return <section className="contacto-whatsapp" aria-labelledby="titulo-contacto-whatsapp">
    <h4 id="titulo-contacto-whatsapp">Consulta de cobertura por WhatsApp</h4>
    <p className="contacto-whatsapp__ayuda">Completá las condiciones, generá el mensaje y revisalo antes de contactar. No se envía automáticamente.</p>

    <div className="contacto-whatsapp__formulario">
      <label>Tipo de valor
        <select value={campos.tipoValor} onChange={(e) => actualizar("tipoValor", e.target.value)}>
          <option value="sesion">Por sesión</option><option value="hora">Por hora</option>
        </select>
      </label>
      <label>Valor actualizado
        <input value={campos.valor} onChange={(e) => actualizar("valor", e.target.value)} placeholder="[VALOR ACTUALIZADO]" />
      </label>
      <label>Días requeridos
        <input value={campos.dias} onChange={(e) => actualizar("dias", e.target.value)} placeholder="Ej.: lunes, miércoles y viernes" />
      </label>
      <label>Horario
        <input value={campos.horario} onChange={(e) => actualizar("horario", e.target.value)} placeholder="Ej.: de 08:00 a 12:00" />
      </label>
      <label>Franco / descanso
        <input value={campos.franco} onChange={(e) => actualizar("franco", e.target.value)} placeholder="Ej.: sábado y domingo / a coordinar" />
      </label>
      <label>Barrio o zona (sin dirección exacta)
        <input value={campos.barrio} onChange={(e) => actualizar("barrio", e.target.value)} placeholder="Ej.: Nueva Córdoba" />
      </label>
    </div>

    <div className="contacto-whatsapp__clinico">
      <label className="contacto-whatsapp__confirmacion">
        <input type="checkbox" checked={incluirDescripcion} onChange={(e) => { setIncluirDescripcion(e.target.checked); setAutorizaDescripcion(false); setBorradorVigente(false); }} />
        Incluir una descripción general del caso (opcional)
      </label>
      {incluirDescripcion && <>
        <label>Descripción redactada por coordinación
          <textarea rows={2} value={campos.descripcion} onChange={(e) => actualizar("descripcion", e.target.value)} placeholder="Descripción general, mínima y comprensible; sin nombre ni datos identificatorios" />
        </label>
        <p className="contacto-whatsapp__advertencia">No se importa automáticamente el diagnóstico del paciente. Evitá datos identificatorios y compartí información de salud solamente si existe autorización y una necesidad concreta.</p>
        <label className="contacto-whatsapp__confirmacion">
          <input type="checkbox" checked={autorizaDescripcion} onChange={(e) => { setAutorizaDescripcion(e.target.checked); setBorradorVigente(false); }} />
          Confirmo que esta descripción es necesaria, fue minimizada y estoy autorizado a compartirla por este canal.
        </label>
      </>}
    </div>

    {faltantes.length > 0 && <p className="contacto-whatsapp__advertencia" role="status">Completá los campos operativos antes de generar: {faltantes.join(", ")}.</p>}
    <button type="button" onClick={generar} disabled={!listo}>Generar mensaje para revisión</button>

    <label htmlFor="mensaje-consulta-whatsapp">Mensaje para {profesional.nombreCompleto} (editable)</label>
    <textarea id="mensaje-consulta-whatsapp" rows={8} value={mensaje} onChange={(e) => { setMensaje(e.target.value); setEstadoCopia(""); }} placeholder="Completá el formulario y seleccioná «Generar mensaje»" disabled={!borradorVigente} />
    {borradorVigente && !listo && <p className="contacto-whatsapp__advertencia">Los datos del formulario cambiaron; generá nuevamente el mensaje.</p>}
    <div className="contacto-whatsapp__acciones">
      <button type="button" onClick={copiar} disabled={!borradorVigente || !mensaje.trim()}>Copiar mensaje</button>
    </div>
    <p role="status" aria-live="polite" className="contacto-whatsapp__estado">{estadoCopia}</p>

    <p className="contacto-whatsapp__destino">Teléfono registrado: <strong>{profesional.telefono || "No informado"}</strong></p>
    <label htmlFor="telefono-consulta-whatsapp">Teléfono para WhatsApp (editable; sin agregar + automáticamente)</label>
    <input id="telefono-consulta-whatsapp" type="tel" value={telefonoEditado} onChange={(e) => { setTelefonoEditado(e.target.value); setConfirmado(false); setRequiereConfirmacionOrigen(false); }} placeholder="3511234567 o 5493511234567" autoComplete="off" />
    {validacion.razon && <p className="contacto-whatsapp__advertencia" role="status">{validacion.razon}</p>}
    {validacion.numero && <p className="contacto-whatsapp__destino">Destino propuesto: <strong>{validacion.numero}</strong> (solo dígitos)</p>}
    {validacion.numero && requiereConfirmacion && <label className="contacto-whatsapp__confirmacion"><input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} /> Confirmé que el número corresponde al celular del profesional.</label>}
    <button type="button" className="contacto-whatsapp__boton" onClick={abrir} disabled={!url} aria-label={`Abrir chat de WhatsApp con ${profesional.nombreCompleto}`}>Abrir chat en WhatsApp</button>
    <small>El mensaje se puede copiar independientemente del teléfono. Al abrir el chat se comparte el número y el texto con WhatsApp; el envío queda a cargo del coordinador.</small>
  </section>;
}
