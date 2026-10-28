import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { distanciaKm } from "../utils/distancia.js";

// S1.1: coordenadas exclusivamente ficticias. NO se envían domicilios reales.
const DEMO = [
  { lat: -31.4201, lng: -64.1888, label: "Paciente Demo A", color: "#c62828" },
  { lat: -31.435, lng: -64.205, label: "Profesional Demo B", color: "#0b5ea8" },
];
function marcador(punto) {
  return L.divIcon({
    className: "marcador-demo",
    html: `<span style="background:${punto.color}"></span>`,
    iconSize: [22, 22], iconAnchor: [11, 11],
  });
}
export default function MapaSeccion() {
  const lienzoRef = useRef(null);
  const mapaRef = useRef(null);
  useEffect(() => {
    if (!lienzoRef.current || mapaRef.current) return;
    const mapa = L.map(lienzoRef.current, { scrollWheelZoom: false });
    mapaRef.current = mapa;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapa);
    DEMO.forEach((p) => L.marker([p.lat, p.lng], { icon: marcador(p) })
      .addTo(mapa).bindPopup(p.label));
    const puntos = DEMO.map((p) => [p.lat, p.lng]);
    L.polyline(puntos, { color: "#0b5ea8", weight: 3, dashArray: "6,6" }).addTo(mapa);
    mapa.fitBounds(L.latLngBounds(puntos), { padding: [45, 45], maxZoom: 14 });
    return () => { mapa.remove(); mapaRef.current = null; };
  }, []);
  const km = distanciaKm(DEMO[0], DEMO[1]);
  return (
    <section className="mapa" aria-labelledby="titulo-mapa">
      <h2 id="titulo-mapa">Mapa — prueba técnica S1.1</h2>
      <p className="mapa__aviso" role="status">
        Modo demostración: ambos marcadores son ficticios. Las selecciones de pacientes y profesionales todavía no modifican este mapa.
      </p>
      <div className="mapa__lienzo" ref={lienzoRef} aria-label="Mapa interactivo con dos ubicaciones ficticias en Córdoba" />
      <output className="mapa__info" aria-live="polite">
        Paciente Demo A (rojo) · Profesional Demo B (azul) · Distancia en línea recta: {km.toFixed(1)} km.
        La línea no representa una ruta vial.
      </output>
      <a href="https://www.google.com/maps/dir/?api=1&origin=-31.4201%2C-64.1888&destination=-31.435%2C-64.205"
         target="_blank" rel="noopener noreferrer">Ver ruta DEMO en Google Maps (sitio externo)</a>
    </section>
  );
}
