// cliente-cache-servidor.ts — Cliente-Caché-Servidor como DATOS (Sesión 40: modelos como datos).
import type { DefinicionModelo } from "./tipos";

export const CLIENTE_CACHE_SERVIDOR: DefinicionModelo = {
  id: "cliente-cache-servidor",
  nombre: "Cliente-Caché-Servidor",
  resumen: "Una caché intermedia responde lo ya pedido y solo molesta al servidor cuando no lo tiene.",
  elevacion: 28,
  distancia: 0.72,
  piezas: [
    { id: "cliente", nombre: "Cliente", rol: "presentacion", forma: "esfera", pos: [-7, 0.6, 0], tam: [1.3, 1.3, 1.3], rotulo: "abajo", resumen: "Quien pide los datos." },
    { id: "cache", nombre: "Caché", rol: "infra", forma: "caja", pos: [-2.3, 0.6, 0], tam: [2.2, 1.4, 1.6], rotulo: "frente", resumen: "Guarda copias de respuestas recientes y contesta al instante si las tiene (acierto)." },
    { id: "servidor", nombre: "Servidor", rol: "logica", forma: "caja", pos: [2.6, 0.6, 0], tam: [2.4, 1.6, 1.8], rotulo: "frente", resumen: "La fuente de la verdad: solo se le consulta ante un fallo de caché." },
    { id: "bd", nombre: "Base de datos", rol: "datos", forma: "cilindro", pos: [7.2, 0.6, 0], tam: [2, 1.2, 2], rotulo: "frente", resumen: "Datos permanentes detrás del servidor." },
  ],
  enlaces: [
    { de: "cliente", a: "cache", tipo: "llamada", etiqueta: "pide", desvio: [0, 0.5, 0] },
    { de: "cache", a: "cliente", tipo: "datos", etiqueta: "hit: entrega", desvio: [0, -0.5, 0] },
    { de: "cache", a: "servidor", tipo: "llamada", etiqueta: "miss: pide", desvio: [0, 0.5, 0] },
    { de: "servidor", a: "cache", tipo: "datos", etiqueta: "respuesta", desvio: [0, -0.5, 0] },
    { de: "servidor", a: "bd", tipo: "llamada" },
  ],
};
