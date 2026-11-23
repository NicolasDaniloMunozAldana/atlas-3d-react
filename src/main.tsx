// Punto de entrada — Sesión 43. Hasta la Sesión 42 era main.ts: ~650 líneas que buscaban elementos
// con querySelector y les enganchaban oyentes. Ahora solo monta el árbol de React en #root.
// Mulish servida desde node_modules (no desde Google Fonts): así también carga sin conexión.
import "@fontsource/mulish/400.css";
import "@fontsource/mulish/500.css";
import "@fontsource/mulish/600.css";
import "@fontsource/mulish/700.css";
import "@fontsource/mulish/800.css";
import "./style.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
