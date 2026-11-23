// arbol-binario.ts — Árbol binario como DATOS (Sesión 40: modelos como datos).
import type { DefinicionModelo } from "./tipos";

export const ARBOL_BINARIO: DefinicionModelo = {
  id: "arbol-binario",
  nombre: "Árbol binario",
  resumen: "Cada nodo tiene a lo sumo dos hijos: los menores a la izquierda, los mayores a la derecha.",
  elevacion: 18,
  piezas: [
    { id: "n8", nombre: "Nodo 8 (raíz)", rol: "coordinacion", forma: "esfera", pos: [0, 4.2, 0], tam: [1.3, 1.3, 1.3], rotulo: "arriba", resumen: "La raíz: el punto de entrada. Toda búsqueda empieza comparando contra ella." },
    { id: "n3", nombre: "Nodo 3", rol: "logica", forma: "esfera", pos: [-3.4, 2.1, 0], tam: [1.2, 1.2, 1.2], rotulo: "arriba", resumen: "Hijo izquierdo de la raíz: guarda valores menores que 8." },
    { id: "n10", nombre: "Nodo 10", rol: "logica", forma: "esfera", pos: [3.4, 2.1, 0], tam: [1.2, 1.2, 1.2], rotulo: "arriba", resumen: "Hijo derecho de la raíz: guarda valores mayores que 8." },
    { id: "n1", nombre: "Nodo 1 (hoja)", rol: "datos", forma: "esfera", pos: [-5.4, 0, 0], tam: [1.1, 1.1, 1.1], rotulo: "abajo", resumen: "Hoja: no tiene hijos. Aquí termina una búsqueda que no encontró nada menor." },
    { id: "n6", nombre: "Nodo 6 (hoja)", rol: "datos", forma: "esfera", pos: [-1.4, 0, 0], tam: [1.1, 1.1, 1.1], rotulo: "abajo", resumen: "Hoja entre 3 y 8." },
    { id: "n14", nombre: "Nodo 14 (hoja)", rol: "datos", forma: "esfera", pos: [5.4, 0, 0], tam: [1.1, 1.1, 1.1], rotulo: "abajo", resumen: "Hoja: el mayor valor del árbol." },
  ],
  enlaces: [
    { de: "n8", a: "n3", tipo: "llamada", etiqueta: "menor" },
    { de: "n8", a: "n10", tipo: "llamada", etiqueta: "mayor" },
    { de: "n3", a: "n1", tipo: "llamada", etiqueta: "menor" },
    { de: "n3", a: "n6", tipo: "llamada", etiqueta: "mayor" },
    { de: "n10", a: "n14", tipo: "llamada", etiqueta: "mayor" },
  ],
};
