// cliente-servidor.ts — Cliente-Servidor como DATOS (Sesión 40: modelos como datos).
import type { DefinicionModelo } from "./tipos";

export const CLIENTE_SERVIDOR: DefinicionModelo = {
  id: "cliente-servidor",
  nombre: "Cliente-Servidor",
  resumen: "Un cliente pide, un servidor responde: la lógica y los datos viven en el servidor.",
  elevacion: 26,
  distancia: 0.68,
  piezas: [
    { id: "cliente", nombre: "Cliente", rol: "presentacion", forma: "esfera", pos: [-5.2, 0.6, 0], tam: [1.3, 1.3, 1.3], rotulo: "abajo", resumen: "Navegador o app: muestra la interfaz y envía las peticiones." },
    { id: "servidor", nombre: "Servidor", rol: "logica", forma: "caja", pos: [0, 0.6, 0], tam: [2.8, 1.6, 1.8], rotulo: "frente", resumen: "Recibe peticiones, aplica las reglas del negocio y responde." },
    { id: "bd", nombre: "Base de datos", rol: "datos", forma: "cilindro", pos: [5.2, 0.6, 0], tam: [2.2, 1.2, 2.2], rotulo: "frente", resumen: "Almacena los datos de forma permanente; solo el servidor la toca." },
  ],
  enlaces: [
    { de: "cliente", a: "servidor", tipo: "llamada", etiqueta: "petición", desvio: [0, 0.5, 0] },
    { de: "servidor", a: "cliente", tipo: "datos", etiqueta: "respuesta", desvio: [0, -0.5, 0] },
    { de: "servidor", a: "bd", tipo: "llamada", etiqueta: "consulta" },
  ],
};
