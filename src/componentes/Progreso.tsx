// Progreso — Sesión 43. «Continuar viendo», favoritos y la nota de estudio cifrada (Sesiones 33-34).
import { useState, type FormEvent } from "react";
import type { RegistroProgreso } from "../db";
import type { MensajeNota } from "../hooks/useProgreso";

interface Props {
  nombreDe: (id: string) => string;
  progreso: Map<string, RegistroProgreso>;
  seleccionado: string | null;
  desbloqueada: boolean;
  textoNota: string;
  mensaje: MensajeNota;
  setTextoNota: (t: string) => void;
  abrir: (id: string) => void;
  desbloquear: (contrasena: string) => Promise<void>;
  bloquear: () => void;
  guardarNota: () => Promise<void>;
}

export function Progreso(p: Props) {
  const [contrasena, setContrasena] = useState("");
  const todos = [...p.progreso.values()];
  const recientes = todos.filter((r) => r.ultimaVisita).sort((a, b) => (b.ultimaVisita ?? 0) - (a.ultimaVisita ?? 0)).slice(0, 3);
  const favoritos = todos.filter((r) => r.favorito === 1);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const valor = contrasena;
    setContrasena("");
    await p.desbloquear(valor);
  }

  const chips = (lista: RegistroProgreso[], vacio: string) =>
    lista.length === 0 ? (
      <span className="chips-vacio">{vacio}</span>
    ) : (
      lista.map((r) => (
        <button key={r.modeloId} type="button" className="chip" onClick={() => p.abrir(r.modeloId)}>{p.nombreDe(r.modeloId)}</button>
      ))
    );

  return (
    <section className="progreso" id="progreso">
      <h2>Tu progreso</h2>
      <div className="progreso-fila">
        <h3>Continuar viendo</h3>
        <div id="recientes" className="chips">{chips(recientes, "Aún no has visto ningún modelo.")}</div>
      </div>
      <div className="progreso-fila">
        <h3>Tus favoritos</h3>
        <div id="favoritos" className="chips">{chips(favoritos, "Marca un modelo con ★ para verlo aquí.")}</div>
      </div>

      <div id="nota-estudio" className="nota-estudio" hidden={p.seleccionado === null}>
        <div className="nota-cabecera">
          <h3 id="nota-titulo">Nota de estudio{p.seleccionado ? ` — ${p.nombreDe(p.seleccionado)}` : ""}</h3>
          <span id="nota-estado" className={p.desbloqueada ? "pill desbloqueado" : "pill"}>{p.desbloqueada ? "Notas desbloqueadas" : "Notas bloqueadas"}</span>
        </div>
        <form id="form-clave-atlas" className="form-clave-atlas" hidden={p.desbloqueada} onSubmit={enviar}>
          <input id="input-clave-atlas" type="password" placeholder="Contraseña de tus notas" autoComplete="off" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
          <button type="submit" className="btn-nota">Desbloquear</button>
        </form>
        <textarea id="nota-texto" rows={3} placeholder="Escribe tu nota de estudio — se guarda cifrada" disabled={!p.desbloqueada} value={p.textoNota} onChange={(e) => p.setTextoNota(e.target.value)} />
        <div className="nota-acciones">
          <button id="btn-guardar-nota" type="button" className="btn-nota" disabled={!p.desbloqueada} onClick={() => void p.guardarNota()}>Guardar nota cifrada</button>
          <button id="btn-bloquear-atlas" type="button" className="btn-nota secundario" hidden={!p.desbloqueada} onClick={p.bloquear}>Bloquear</button>
        </div>
        <p id="nota-mensaje" className="nota-mensaje" role="status" data-tipo={p.mensaje.tipo}>{p.mensaje.texto}</p>
      </div>
    </section>
  );
}
