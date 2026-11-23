// ZonaInstalar — Sesión 43. «Instalar la app»: el estado lo decide instalar.ts; el hook lo trae.
import { useState } from "react";
import { useInstalacion } from "../hooks/useInstalacion";

export function ZonaInstalar() {
  const { instalable, texto, pedir } = useInstalacion();
  const [pidiendo, setPidiendo] = useState(false);

  async function alPulsar() {
    setPidiendo(true);
    try {
      await pedir(); // el resultado llega por useInstalacion: no hay que pintar nada aquí
    } finally {
      setPidiendo(false);
    }
  }

  return (
    <section className="instalar-zona descargas-zona" aria-labelledby="titulo-instalar">
      <h2 id="titulo-instalar">Instalar la app</h2>
      <div className="descargas-barra">
        <button type="button" id="btn-instalar" className="btn-nota" hidden={!instalable} disabled={pidiendo} onClick={alPulsar}>⬇ Instalar Atlas 3D</button>
        <span id="estado-instalacion" className="estado-linea" role="status">{texto}</span>
      </div>
    </section>
  );
}
