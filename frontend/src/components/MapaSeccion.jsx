import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const CENTRO_INICIAL = [-31.4201, -64.1888];
function icono(color, numero) {
  const texto = numero == null ? "P" : String(numero);
  return L.divIcon({ className: "marcador-localidad",
    html: `<span style="background:${color}">${texto}</span>`, iconSize:[30,30], iconAnchor:[15,15] });
}
function descripcion(profesional) {
  const contenedor = document.createElement("div");
  const nombre = document.createElement("strong");
  nombre.textContent = profesional.nombreCompleto;
  const telefono = document.createElement("p");
  telefono.textContent = `Teléfono: ${profesional.telefono || "No informado"}`;
  const aviso = document.createElement("small");
  aviso.textContent = "Centro aproximado de localidad; no representa domicilio.";
  contenedor.append(nombre, telefono, aviso);
  return contenedor;
}
export default function MapaSeccion({ paciente, ubicacionPaciente, profesionales = [], profesionalId, onProfesional, candidatoSugeridoId, cargando, error, puedeBuscar }) {
  const lienzoRef = useRef(null);
  const mapaRef = useRef(null);
  const capaRef = useRef(null);
  const marcasRef = useRef(new Map());
  const encuadreRef = useRef(null);
  useEffect(() => {
    if (!lienzoRef.current || mapaRef.current) return;
    const mapa = L.map(lienzoRef.current, { scrollWheelZoom: true }).setView(CENTRO_INICIAL, 11);
    mapaRef.current = mapa;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom:19,
    }).addTo(mapa);
    capaRef.current = L.layerGroup().addTo(mapa);
    return () => { mapa.remove(); mapaRef.current = null; capaRef.current = null; marcasRef.current.clear(); encuadreRef.current = null; };
  }, []);
  // Leaflet debe recalcular el lienzo cuando cambia el tamaño del panel.
  useEffect(() => {
    const elemento = lienzoRef.current;
    const mapa = mapaRef.current;
    if (!elemento || !mapa || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => mapa.invalidateSize({ pan: false }));
    observer.observe(elemento);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapa || !capaRef.current) return;
    capaRef.current.clearLayers();
    marcasRef.current.clear();
    const bounds = [];
    const pacienteValido = Boolean(paciente && Number.isFinite(ubicacionPaciente?.lat) && Number.isFinite(ubicacionPaciente?.lng));
    const coordenadaPaciente = pacienteValido ? [ubicacionPaciente.lat, ubicacionPaciente.lng] : null;
    if (coordenadaPaciente) {
      L.marker(coordenadaPaciente, { icon: icono("#bd433c", null), zIndexOffset: 1000 })
        .addTo(capaRef.current)
        .bindTooltip("Paciente · centro aproximado de localidad", { direction: "top" });
      bounds.push(coordenadaPaciente);
    }
    // El punto geográfico sigue siendo el CENTRO DE LOCALIDAD.
    // Para permitir que se vean todos los pines, se distribuyen en pantalla
    // alrededor del centro. Estas posiciones NO se emplean para calcular distancias.
    const agrupados = new Map();
    profesionales.forEach((profesional) => {
      const c = profesional.coordenadas;
      if (!Number.isFinite(c?.lat) || !Number.isFinite(c?.lng)) return;
      const clave = `${c.lat}|${c.lng}`;
      agrupados.set(clave, [...(agrupados.get(clave) || []), profesional]);
    });
    agrupados.forEach((grupo) => grupo.forEach((profesional, indice) => {
      const c = profesional.coordenadas;
      const compartePaciente = pacienteValido && c.lat === ubicacionPaciente.lat && c.lng === ubicacionPaciente.lng;
      const haySuperposicion = grupo.length > 1 || compartePaciente;
      // Separación visual para el zoom inicial (12). No es geolocalización real.
      const angulo = 2 * Math.PI * indice / grupo.length - Math.PI / 2;
      const radio = haySuperposicion ? 0.014 : 0;
      const coords = [c.lat + Math.sin(angulo) * radio, c.lng + Math.cos(angulo) * radio];
      const posicion = profesionales.findIndex((p) => p.id === profesional.id) + 1;
      const destacado = profesional.id === candidatoSugeridoId;
      const seleccionado = profesional.id === profesionalId;
      const color = seleccionado ? "#10473d" : destacado ? "#b77900" : "#0b5ea8";
      const marcador = L.marker(coords, {
        icon: icono(color, posicion),
        zIndexOffset: seleccionado ? 900 : destacado ? 700 : 100,
      }).addTo(capaRef.current).bindTooltip(descripcion(profesional), {direction:"top"});
      marcador.on("click", () => onProfesional(profesional.id));
      marcasRef.current.set(profesional.id, marcador);
      bounds.push(coords);
    }));
    // No reiniciar el zoom manual cuando solo cambia el seleccionado/destacado.
    const claveEncuadre = `${paciente?.id ?? ""}|${bounds.map(([lat, lng]) => `${lat.toFixed(5)},${lng.toFixed(5)}`).join(";")}`;
    if (encuadreRef.current !== claveEncuadre) {
      encuadreRef.current = claveEncuadre;
      if (bounds.length) mapa.fitBounds(L.latLngBounds(bounds), {padding:[42,42],maxZoom:12});
      else mapa.setView(CENTRO_INICIAL,11);
    }
  }, [paciente, ubicacionPaciente, profesionales, profesionalId, candidatoSugeridoId, onProfesional]);
  const representados = profesionales.filter((p) => Number.isFinite(p.coordenadas?.lat) && Number.isFinite(p.coordenadas?.lng)).length;
  return <section className="mapa" aria-labelledby="titulo-mapa">
    <h2 id="titulo-mapa">Mapa de profesionales · localidades aproximadas</h2>
    <p className="mapa__aviso">Ningún pin representa un domicilio exacto. Los puntos que comparten localidad (incluido el paciente) se separan visualmente para distinguirlos: sus posiciones desplazadas NO indican cercanía real. El mapa no calcula rutas viales.</p>
    {cargando && <p role="status">Cargando ubicaciones locales…</p>}
    {error && <p role="alert">No se pudieron obtener ubicaciones: {error.message}</p>}
    {!puedeBuscar && <p>Seleccioná un paciente y un servicio para mostrar coincidencias automáticamente.</p>}
    <div className="mapa__lienzo" ref={lienzoRef} aria-label="Mapa de localidades aproximadas de profesionales visibles en la página" />
    <p className="mapa__leyenda"><span>🔴 Paciente</span><span>🔵 Profesional</span><span>🟡 Candidato para revisar</span><span>🟢 Selección del coordinador</span></p>
    {puedeBuscar && <output className="mapa__info" aria-live="polite">{representados} de {profesionales.length} profesionales de esta página representados en el mapa. Los demás no tienen coordenadas locales disponibles. {paciente && ubicacionPaciente?.lat == null ? "La ubicación aproximada del paciente no está disponible: no es posible comparar cercanía." : ""}</output>}
  </section>;
}
