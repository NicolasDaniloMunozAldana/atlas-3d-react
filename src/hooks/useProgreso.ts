// useProgreso — Sesión 43. La capa de IndexedDB (db.ts) y la de cifrado (crypto.ts) siguen IGUAL que en la
// versión sin framework; el hook las ofrece a los componentes: el progreso por modelo, las fichas
// descargadas, la clave de las notas (en memoria, nunca en disco) y las acciones que lo cambian.
import { useCallback, useEffect, useRef, useState } from "react";
import {
  abrirBaseDeDatos, alternarFavorito, guardarConfig, guardarNotaDeEstudio, leerNotaDeEstudio, marcarModeloVisto,
  obtenerConfig, obtenerDescargas, obtenerProgreso, obtenerTodoElProgreso, type RegistroProgreso,
} from "../db";
import { crearVerificador, derivarClaveDesdeContrasena, generarSal, verificarClave, type TextoCifrado } from "../crypto";

export interface MensajeNota {
  texto: string;
  tipo: "ok" | "error" | "info";
}

export function useProgreso() {
  // La base se abre una sola vez; la promesa se guarda para que cualquier manejador pueda esperarla.
  const dbPromesa = useRef<Promise<IDBDatabase> | null>(null);
  if (dbPromesa.current === null) dbPromesa.current = abrirBaseDeDatos();

  const [progreso, setProgreso] = useState<Map<string, RegistroProgreso>>(new Map());
  const [descargados, setDescargados] = useState<Set<string>>(new Set());
  const [clave, setClave] = useState<CryptoKey | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [textoNota, setTextoNota] = useState("");
  const [mensaje, setMensaje] = useState<MensajeNota>({ texto: "", tipo: "info" });

  const recargar = useCallback(async () => {
    const db = await dbPromesa.current!;
    const [todo, descargas] = await Promise.all([obtenerTodoElProgreso(db), obtenerDescargas(db)]);
    setProgreso(new Map(todo.map((p) => [p.modeloId, p])));
    setDescargados(new Set(descargas.filter((d) => d.estado === "listo").map((d) => d.modeloId)));
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  // Cuando cambia el modelo elegido o se desbloquea la clave, se lee la nota de ese modelo.
  useEffect(() => {
    let vigente = true;
    setTextoNota("");
    if (!seleccionado || !clave) return;
    void (async () => {
      const db = await dbPromesa.current!;
      const registro = await obtenerProgreso(db, seleccionado);
      if (!registro?.notaCifrada) return;
      try {
        const texto = (await leerNotaDeEstudio(clave, registro)) ?? "";
        if (vigente) {
          setTextoNota(texto);
          setMensaje({ texto: "Nota descifrada con tu contraseña.", tipo: "ok" });
        }
      } catch {
        if (vigente) setMensaje({ texto: "No se pudo descifrar la nota con la clave actual.", tipo: "error" });
      }
    })();
    return () => {
      vigente = false;
    };
  }, [seleccionado, clave]);

  return {
    dbPromesa: dbPromesa.current,
    progreso,
    descargados,
    recargar,
    clave,
    seleccionado,
    textoNota,
    setTextoNota,
    mensaje,
    async abrirModelo(id: string) {
      setSeleccionado(id);
      await marcarModeloVisto(await dbPromesa.current!, id);
      setMensaje({ texto: clave ? "" : "Desbloquea con tu contraseña para leer o escribir la nota.", tipo: "info" });
      await recargar();
    },
    async alternarFavorito(id: string) {
      await alternarFavorito(await dbPromesa.current!, id);
      await recargar();
    },
    async desbloquear(contrasena: string) {
      if (!contrasena) return;
      const db = await dbPromesa.current!;
      let sal = await obtenerConfig<Uint8Array<ArrayBuffer>>(db, "sal");
      const verificador = await obtenerConfig<TextoCifrado>(db, "verificador");
      if (!sal) {
        sal = generarSal();
        await guardarConfig(db, "sal", sal);
      }
      const candidata = await derivarClaveDesdeContrasena(contrasena, sal);
      if (!verificador) {
        await guardarConfig(db, "verificador", await crearVerificador(candidata));
        setClave(candidata);
        setMensaje({ texto: "Contraseña creada. Tus notas de estudio se cifrarán con ella.", tipo: "ok" });
      } else if (await verificarClave(candidata, verificador)) {
        setClave(candidata);
        setMensaje({ texto: "Notas desbloqueadas.", tipo: "ok" });
      } else {
        setMensaje({ texto: "Contraseña incorrecta.", tipo: "error" });
      }
    },
    bloquear() {
      setClave(null);
      setTextoNota("");
      setMensaje({ texto: "Notas bloqueadas.", tipo: "info" });
    },
    async guardarNota() {
      if (!clave || !seleccionado) return;
      await guardarNotaDeEstudio(await dbPromesa.current!, clave, seleccionado, textoNota);
      setMensaje({ texto: "Nota guardada cifrada (AES-GCM) en IndexedDB.", tipo: "ok" });
    },
  };
}
