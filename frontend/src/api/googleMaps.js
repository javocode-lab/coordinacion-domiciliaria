/** Carga única de Maps JavaScript API (modo async + importLibrary). */
let promesa = null;

export function cargarGoogleMaps(apiKey) {
  if (promesa) return promesa;
  promesa = new Promise((resolver, rechazar) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({ key: apiKey, v: "weekly", loading: "async", language: "es", region: "AR" });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    script.async = true;
    script.onerror = () => { promesa = null; rechazar(new Error("No se pudo cargar Google Maps")); };
    script.onload = async () => {
      try {
        const [maps, marker] = await Promise.all([
          window.google.maps.importLibrary("maps"),
          window.google.maps.importLibrary("marker"),
        ]);
        resolver({ ...maps, ...marker });
      } catch (e) {
        promesa = null;
        rechazar(e);
      }
    };
    document.head.append(script);
  });
  return promesa;
}
