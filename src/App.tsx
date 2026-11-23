// App — Sesión 43/44. El Atlas 3D de Arquitectura de Software como árbol de componentes de React.
// Lo que NO cambió respecto a la versión sin framework: visor.ts (Three.js y WebXR), xr.ts, sw.ts, db.ts,
// crypto.ts, los modelos como datos y el manifest. Lo que cambió: main.ts (querySelector + addEventListener)
// se reparte en hooks (estado y efectos) y componentes (pantalla).
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { crearVisor, type Visor } from "./visor";
import { CATALOGO } from "./modelos";
import { mostrarAviso } from "./avisos";
import { useConexion } from "./hooks/useConexion";
import { useProgreso } from "./hooks/useProgreso";
import { usePanel } from "./hooks/usePanel";
import { useSensores } from "./hooks/useSensores";
import { useCamara } from "./hooks/useCamara";
import { useAR } from "./hooks/useAR";
import { ZonaVisor } from "./componentes/ZonaVisor";
import { PanelModelo } from "./componentes/PanelModelo";
import { ZonaInstalar } from "./componentes/ZonaInstalar";
import { ZonaDescargas } from "./componentes/ZonaDescargas";
import { OverlayAR } from "./componentes/OverlayAR";
import { Catalogo, type Patron } from "./componentes/Catalogo";
import { Progreso } from "./componentes/Progreso";

const PATRONES: Patron[] = CATALOGO.map((m) => ({ id: m.id, nombre: m.nombre, resumen: m.resumen }));
const IDS = PATRONES.map((p) => p.id);
const nombreDe = (id: string) => PATRONES.find((p) => p.id === id)?.nombre ?? id;

export function App() {
  const textoConexion = useConexion();
  const progreso = useProgreso();

  // ── El visor: un objeto de Three.js que vive fuera de React ──────────────
  const contenedor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const [visor, setVisor] = useState<Visor | null>(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const nuevo = crearVisor(contenedor.current!);
    setVisor(nuevo);
    return () => {
      nuevo.destruir(); // la limpieza: sin ella, StrictMode dejaría dos lienzos
      setVisor(null);
    };
  }, []);

  const panel = usePanel(visor);
  const sensores = useSensores(visor, setAviso);
  const camara = useCamara(visor, video, setAviso);
  const ar = useAR({
    visor,
    overlay,
    avisar: setAviso,
    antesDeEntrar: () => {
      camara.apagar();
      sensores.apagar();
    },
  });

  // ── El Service Worker (virtual:pwa-register/react) ───────────────────────
  const [estadoSw, setEstadoSw] = useState<"comprobando" | "activo" | "error">("comprobando");
  const { offlineReady } = useRegisterSW({
    immediate: true,
    onOfflineReady() {
      // El usuario está mirando la pantalla: la notificación solo si NO la está mirando.
      if (document.visibilityState !== "visible") {
        void mostrarAviso("Atlas 3D listo", "Ya funciona sin conexión.", import.meta.env.BASE_URL, "atlas-offline");
      }
    },
    onRegisteredSW: () => setEstadoSw("activo"),
    onRegisterError(error) {
      console.error("Error al registrar el SW de Workbox:", error);
      setEstadoSw("error");
    },
  });

  // appinstalled se dispara cuando el usuario instala la PWA.
  useEffect(() => {
    const alInstalar = () => void mostrarAviso("Atlas 3D instalado", "Ya puedes abrirlo desde tu pantalla de inicio.", import.meta.env.BASE_URL, "atlas-instalado");
    window.addEventListener("appinstalled", alInstalar);
    return () => window.removeEventListener("appinstalled", alInstalar);
  }, []);

  const pieza = panel.def.piezas.find((p) => p.id === panel.piezaId);
  const extra = pieza ? panel.ficha?.piezas[pieza.id] : null;
  const textoPieza = pieza ? `${pieza.nombre}: ${extra ? extra.responsabilidad : pieza.resumen}` : `${panel.def.nombre}. Usa ◀ ▶ para recorrer sus piezas.`;

  // Abrir una tarjeta la marca como vista, abre su nota y muestra su modelo.
  const abrir = (id: string) => {
    void progreso.abrirModelo(id);
    panel.elegirModelo(id);
  };

  return (
    <>
      <p id="estado-conexion" className="estado-conexion" role="status" hidden={textoConexion === null}>{textoConexion}</p>
      <header className="nav-bar">
        <div className="nav-brand">
          <span className="nav-dot" aria-hidden="true" />
          <span>Atlas 3D</span>
        </div>
        <span id="estado-sw" className={estadoSw === "activo" ? "sw-badge activo" : estadoSw === "error" ? "sw-badge error" : "sw-badge"}>
          {estadoSw === "activo" ? "Service Worker: activo" : estadoSw === "error" ? "Service Worker: error al registrar" : "Service Worker: comprobando…"}
        </span>
      </header>

      <main className="contenido">
        <section className="hero">
          <p className="hero-eyebrow">Módulo AR · Versión React</p>
          <h1>Atlas 3D de Arquitectura de Software</h1>
          <p>Ocho patrones de arquitectura de software dibujados en 3D con Three.js: míralos, toca una pieza para leer qué hace y apóyalos sobre tu mesa con realidad aumentada. Se instala y funciona sin conexión.</p>
        </section>

        <ZonaVisor contenedor={contenedor} video={video} aviso={aviso} sensores={sensores} camara={camara} ar={ar}>
          <PanelModelo def={panel.def} piezaId={panel.piezaId} ficha={panel.ficha} alElegirModelo={panel.elegirModelo} alElegirPieza={panel.elegirPieza} />
        </ZonaVisor>

        <Catalogo
          patrones={PATRONES}
          progreso={progreso.progreso}
          descargados={progreso.descargados}
          seleccionado={progreso.seleccionado}
          abrir={abrir}
          alternarFavorito={(id) => void progreso.alternarFavorito(id)}
          ver3D={(id) => {
            panel.elegirModelo(id);
            document.querySelector("#visor")?.scrollIntoView({ block: "center", behavior: "smooth" });
          }}
        />

        <Progreso
          nombreDe={nombreDe}
          progreso={progreso.progreso}
          seleccionado={progreso.seleccionado}
          desbloqueada={progreso.clave !== null}
          textoNota={progreso.textoNota}
          mensaje={progreso.mensaje}
          setTextoNota={progreso.setTextoNota}
          abrir={abrir}
          desbloquear={progreso.desbloquear}
          bloquear={progreso.bloquear}
          guardarNota={progreso.guardarNota}
        />

        <ZonaInstalar />
        <ZonaDescargas ids={IDS} dbPromesa={progreso.dbPromesa} alCambiarDescargas={progreso.recargar} appLista={offlineReady[0]} />
      </main>

      <OverlayAR raiz={overlay} ayuda={ar.textos.ayuda} datos={ar.textos.datos} pieza={textoPieza} alRecorrer={panel.recorrerPiezas} alSalir={ar.salir} />

      <footer className="pie">
        <p>Vite + React + TypeScript + Three.js + Workbox + WebXR · Instalable · Funciona sin conexión</p>
      </footer>
    </>
  );
}
