// Catalogo — Sesión 43. Las 8 tarjetas del catálogo con favorito, «visto» y «Ver en 3D» (Sesión 33).
// Antes, cada cambio terminaba en render(): borrar todo y reescribirlo (por eso la nota escrita se perdía en la
// versión de la Sesión 42). Ahora cada tarjeta es un componente y React solo cambia lo que cambió.
import { useEffect } from "react";
import type { RegistroProgreso } from "../db";

export interface Patron { id: string; nombre: string; resumen: string }

function haceCuanto(marca: number): string {
  const segundos = Math.max(0, Math.round((Date.now() - marca) / 1000));
  if (segundos < 60) return "hace unos segundos";
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.round(horas / 24)} d`;
}

interface TarjetaProps {
  numero: number;
  patron: Patron;
  registro?: RegistroProgreso;
  descargado: boolean;
  destacada: boolean;
  seleccionada: boolean;
  abrir: (id: string) => void;
  ver3D: (id: string) => void;
  alternarFavorito: (id: string) => void;
}

function Tarjeta({ numero, patron, registro, descargado, destacada, seleccionada, abrir, ver3D, alternarFavorito }: TarjetaProps) {
  const favorito = registro?.favorito === 1;
  // Una notificación puede abrir la app con ?modelo=ID para destacar esa tarjeta (Sesión 37).
  useEffect(() => {
    if (destacada) document.getElementById(`tarjeta-${patron.id}`)?.scrollIntoView({ block: "center" });
  }, [destacada, patron.id]);

  const clases = ["patron-card", descargado && "sin-conexion", destacada && "destacada", seleccionada && "seleccionada"].filter(Boolean).join(" ");
  return (
    <article id={`tarjeta-${patron.id}`} className={clases} data-id={patron.id}>
      <div className="patron-top">
        <span className="numero">0{numero}</span>
        <button
          type="button"
          className={favorito ? "btn-fav activo" : "btn-fav"}
          aria-pressed={favorito}
          aria-label={`Marcar ${patron.nombre} como favorito`}
          onClick={() => alternarFavorito(patron.id)}
        >
          {favorito ? "★" : "☆"}
        </button>
      </div>
      <button type="button" className="patron-abrir" onClick={() => abrir(patron.id)}>{patron.nombre}</button>
      <span className="resumen-card">{patron.resumen}</span>
      <span className="estado">{descargado ? "✓ Ficha disponible sin conexión" : "Modelo 3D disponible · ficha descargable"}</span>
      <span className="visita">{registro?.ultimaVisita ? `Visto ${haceCuanto(registro.ultimaVisita)}` : "Sin visitar"}</span>
      <button type="button" className="btn-ver3d" data-id={patron.id} onClick={() => ver3D(patron.id)}>🧊 Ver en 3D</button>
    </article>
  );
}

interface Props {
  patrones: Patron[];
  progreso: Map<string, RegistroProgreso>;
  descargados: Set<string>;
  seleccionado: string | null;
  abrir: (id: string) => void;
  ver3D: (id: string) => void;
  alternarFavorito: (id: string) => void;
}

export function Catalogo({ patrones, progreso, descargados, seleccionado, abrir, ver3D, alternarFavorito }: Props) {
  const destacado = new URLSearchParams(location.search).get("modelo");
  return (
    <section className="catalogo">
      <h2>Los 8 patrones del catálogo</h2>
      <div className="catalogo-grid">
        {patrones.map((p, i) => (
          <Tarjeta
            key={p.id}
            numero={i + 1}
            patron={p}
            registro={progreso.get(p.id)}
            descargado={descargados.has(p.id)}
            destacada={destacado === p.id}
            seleccionada={seleccionado === p.id}
            abrir={abrir}
            ver3D={ver3D}
            alternarFavorito={alternarFavorito}
          />
        ))}
      </div>
    </section>
  );
}
