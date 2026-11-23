// repositorio.ts — Repositorio como DATOS (Sesión 40: modelos como datos).
import type { DefinicionModelo } from "./tipos";

export const REPOSITORIO: DefinicionModelo = {
  id: "repositorio",
  nombre: "Repositorio",
  resumen: "La lógica pide datos a una interfaz; detrás, una implementación decide dónde viven realmente.",
  elevacion: 14,
  distancia: 1.3,
  piezas: [
    { id: "servicio", nombre: "Servicio de dominio", rol: "logica", forma: "caja", pos: [0, 4.2, 0], tam: [6, 0.9, 3], rotulo: "frente", resumen: "Las reglas del negocio. Pide y guarda objetos sin saber cómo se almacenan." },
    { id: "interfaz", nombre: "Interfaz del repositorio", rol: "coordinacion", forma: "caja", pos: [0, 2.1, 0], tam: [6, 0.9, 3], rotulo: "frente", resumen: "El contrato: operaciones como buscar, guardar y borrar, sin detalles técnicos." },
    { id: "implementacion", nombre: "Implementación", rol: "datos", forma: "caja", pos: [0, 0, 0], tam: [6, 0.9, 3], rotulo: "frente", resumen: "Cumple el contrato con una tecnología concreta (SQL, IndexedDB, memoria para pruebas)." },
    { id: "almacen", nombre: "Almacenamiento", rol: "infra", forma: "cilindro", pos: [0, -2.4, 0], tam: [2.6, 1, 2.6], rotulo: "frente", resumen: "La base de datos o el medio físico donde viven los datos." },
  ],
  enlaces: [
    { de: "servicio", a: "interfaz", tipo: "llamada", etiqueta: "usa" },
    { de: "implementacion", a: "interfaz", tipo: "llamada", etiqueta: "implementa", desvio: [2, 0, 0] },
    { de: "implementacion", a: "almacen", tipo: "llamada", etiqueta: "lee y escribe" },
  ],
};
