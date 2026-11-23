// publicador-suscriptor.ts — Publicador-Suscriptor como DATOS (Sesión 40: modelos como datos).
import type { DefinicionModelo } from "./tipos";

export const PUBLICADOR_SUSCRIPTOR: DefinicionModelo = {
  id: "publicador-suscriptor",
  nombre: "Publicador-Suscriptor",
  resumen: "Quien publica no conoce a quien escucha: un canal reparte los eventos a los suscritos.",
  elevacion: 32,
  distancia: 0.95,
  piezas: [
    { id: "publicador", nombre: "Publicador", rol: "logica", forma: "caja", pos: [-6, 0.6, 0], tam: [2.4, 1.4, 1.6], rotulo: "frente", resumen: "Emite eventos cuando algo ocurre. No sabe quién los recibirá." },
    { id: "canal", nombre: "Canal de eventos", rol: "infra", forma: "caja", pos: [0, 0.6, 0], tam: [2.6, 1.4, 1.6], rotulo: "frente", resumen: "El intermediario (broker): recibe los eventos y los reenvía a cada suscriptor." },
    { id: "suscriptor-a", nombre: "Suscriptor A", rol: "presentacion", forma: "caja", pos: [6, 0.6, 3.6], tam: [2.2, 1.2, 1.4], rotulo: "frente", resumen: "Se suscribe a un tema y reacciona cuando llega un evento (por ejemplo, actualiza la pantalla)." },
    { id: "suscriptor-b", nombre: "Suscriptor B", rol: "logica", forma: "caja", pos: [6, 0.6, 0], tam: [2.2, 1.2, 1.4], rotulo: "frente", resumen: "Otro suscriptor del mismo tema (por ejemplo, envía un correo)." },
    { id: "suscriptor-c", nombre: "Suscriptor C", rol: "datos", forma: "caja", pos: [6, 0.6, -3.6], tam: [2.2, 1.2, 1.4], rotulo: "frente", resumen: "Un tercero que guarda un registro histórico." },
  ],
  enlaces: [
    { de: "publicador", a: "canal", tipo: "evento", etiqueta: "publica" },
    { de: "canal", a: "suscriptor-a", tipo: "evento", etiqueta: "entrega" },
    { de: "canal", a: "suscriptor-b", tipo: "evento" },
    { de: "canal", a: "suscriptor-c", tipo: "evento" },
  ],
};
