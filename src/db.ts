// Sesión 33 — IndexedDB del Atlas 3D: progreso del usuario (modelos vistos, favoritos, nota de estudio).
// Mismas funciones envueltas en Promise de la Sesión 22, con los nombres reales del proyecto.
import { cifrarTexto, descifrarTexto } from "./crypto";
import type { TextoCifrado } from "./crypto";

export const DB_NOMBRE = "atlas3d-progreso-db";
// Versión 2 (Sesión 37): se agrega el almacén "descargas" (cola de fichas para usar sin conexión).
export const DB_VERSION = 2;

/*
 * `favorito` se guarda como 1 / 0 y NO como true / false: en IndexedDB un booleano no es una clave
 * válida, así que un índice sobre `favorito: true` queda vacío y `IDBKeyRange.only(true)` lanza
 * DataError. Con números el índice porFavorito sí funciona. (Comprobado en Chrome.)
 */
export interface RegistroProgreso {
  modeloId: string;
  favorito: 0 | 1;
  ultimaVisita: number | null; // null = nunca visitado: el registro no entra al índice porUltimaVisita
  notaCifrada: ArrayBuffer | null;
  notaIv: Uint8Array<ArrayBuffer> | null;
}

function registroNuevo(modeloId: string): RegistroProgreso {
  return { modeloId, favorito: 0, ultimaVisita: null, notaCifrada: null, notaIv: null };
}

export function abrirBaseDeDatos(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const peticion = indexedDB.open(DB_NOMBRE, DB_VERSION);

    peticion.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Migración por tramos (Sesión 22/26): quien viene de la v1 conserva su progreso, sus
      // favoritos y sus notas cifradas, y solo recibe lo nuevo.
      if (event.oldVersion < 1) {
        // La clave es directamente modeloId (sin autoIncrement): un registro de progreso siempre
        // pertenece a un modelo concreto del catálogo, así que su identificador es la clave natural.
        const store = db.createObjectStore("progreso", { keyPath: "modeloId" });
        store.createIndex("porFavorito", "favorito", { unique: false }); // sección "Tus favoritos"
        store.createIndex("porUltimaVisita", "ultimaVisita", { unique: false }); // "Continuar viendo"
        // Sal de PBKDF2 y verificador de contraseña para cifrar la nota de estudio (Sesión 22).
        db.createObjectStore("config", { keyPath: "clave" });
      }
      if (event.oldVersion < 2) {
        db.createObjectStore("descargas", { keyPath: "modeloId" });
      }
    };

    peticion.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
    peticion.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

// Lee-modifica-escribe un registro de progreso dentro de UNA sola transacción. Usa put(): la primera
// vez crea el registro y las siguientes lo actualizan — con add() la segunda visita fallaría por
// clave repetida.
function actualizarProgreso(
  db: IDBDatabase,
  modeloId: string,
  modificar: (registro: RegistroProgreso) => void,
): Promise<RegistroProgreso> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("progreso", "readwrite");
    const store = tx.objectStore("progreso");
    let resultado: RegistroProgreso;

    const lectura = store.get(modeloId);
    lectura.onsuccess = () => {
      const registro: RegistroProgreso = lectura.result ?? registroNuevo(modeloId);
      modificar(registro);
      resultado = registro;
      store.put(registro);
    };
    lectura.onerror = () => reject(lectura.error);
    tx.oncomplete = () => resolve(resultado);
    tx.onabort = () => reject(tx.error);
  });
}

export function marcarModeloVisto(db: IDBDatabase, modeloId: string): Promise<RegistroProgreso> {
  return actualizarProgreso(db, modeloId, (registro) => {
    registro.ultimaVisita = Date.now();
  });
}

export async function alternarFavorito(db: IDBDatabase, modeloId: string): Promise<boolean> {
  const registro = await actualizarProgreso(db, modeloId, (r) => {
    r.favorito = r.favorito === 1 ? 0 : 1;
  });
  return registro.favorito === 1;
}

export function obtenerFavoritos(db: IDBDatabase): Promise<RegistroProgreso[]> {
  return new Promise((resolve, reject) => {
    const resultado: RegistroProgreso[] = [];
    const indice = db.transaction("progreso", "readonly").objectStore("progreso").index("porFavorito");
    const cursor = indice.openCursor(IDBKeyRange.only(1));

    cursor.onsuccess = () => {
      const c = cursor.result;
      if (c) {
        resultado.push(c.value as RegistroProgreso);
        c.continue();
      } else {
        resolve(resultado);
      }
    };
    cursor.onerror = () => reject(cursor.error);
  });
}

// "Continuar viendo": los modelos visitados más recientemente, recorriendo el índice en orden
// descendente ("prev") y cortando al llegar al límite.
export function obtenerRecientes(db: IDBDatabase, limite = 3): Promise<RegistroProgreso[]> {
  return new Promise((resolve, reject) => {
    const resultado: RegistroProgreso[] = [];
    const indice = db.transaction("progreso", "readonly").objectStore("progreso").index("porUltimaVisita");
    const cursor = indice.openCursor(null, "prev");

    cursor.onsuccess = () => {
      const c = cursor.result;
      if (c && resultado.length < limite) {
        resultado.push(c.value as RegistroProgreso);
        c.continue();
      } else {
        resolve(resultado);
      }
    };
    cursor.onerror = () => reject(cursor.error);
  });
}

export function obtenerProgreso(db: IDBDatabase, modeloId: string): Promise<RegistroProgreso | undefined> {
  return new Promise((resolve, reject) => {
    const peticion = db.transaction("progreso", "readonly").objectStore("progreso").get(modeloId);
    peticion.onsuccess = () => resolve(peticion.result as RegistroProgreso | undefined);
    peticion.onerror = () => reject(peticion.error);
  });
}

export function obtenerTodoElProgreso(db: IDBDatabase): Promise<RegistroProgreso[]> {
  return new Promise((resolve, reject) => {
    const peticion = db.transaction("progreso", "readonly").objectStore("progreso").getAll();
    peticion.onsuccess = () => resolve(peticion.result as RegistroProgreso[]);
    peticion.onerror = () => reject(peticion.error);
  });
}

// --- Nota de estudio: el único campo privado, cifrado con la clave de la Sesión 22 ---

export async function guardarNotaDeEstudio(db: IDBDatabase, clave: CryptoKey, modeloId: string, texto: string): Promise<void> {
  const { cifrado, iv } = await cifrarTexto(clave, texto); // se cifra ANTES de abrir la transacción
  await actualizarProgreso(db, modeloId, (registro) => {
    registro.notaCifrada = cifrado;
    registro.notaIv = iv;
  });
}

export async function leerNotaDeEstudio(clave: CryptoKey, registro: RegistroProgreso): Promise<string | null> {
  if (!registro.notaCifrada || !registro.notaIv) return null;
  return descifrarTexto(clave, { cifrado: registro.notaCifrada, iv: registro.notaIv });
}

// --- Configuración (sal y verificador) ---

export function obtenerConfig<T>(db: IDBDatabase, clave: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const peticion = db.transaction("config", "readonly").objectStore("config").get(clave);
    peticion.onsuccess = () => resolve(peticion.result ? (peticion.result.valor as T) : undefined);
    peticion.onerror = () => reject(peticion.error);
  });
}

export function guardarConfig(db: IDBDatabase, clave: string, valor: Uint8Array<ArrayBuffer> | TextoCifrado): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("config", "readwrite");
    tx.objectStore("config").put({ clave, valor });
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}

// --- Sesión 37: cola de descargas para uso sin conexión ---

export interface Descarga {
  modeloId: string;
  estado: "pendiente" | "listo";
}

/** Anota (o reinicia a «pendiente») la descarga de varios modelos. */
export function encolarDescargas(db: IDBDatabase, ids: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("descargas", "readwrite");
    const store = tx.objectStore("descargas");
    ids.forEach((modeloId) => store.put({ modeloId, estado: "pendiente" } satisfies Descarga));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function obtenerDescargas(db: IDBDatabase): Promise<Descarga[]> {
  return new Promise((resolve, reject) => {
    const peticion = db.transaction("descargas", "readonly").objectStore("descargas").getAll();
    peticion.onsuccess = () => resolve(peticion.result as Descarga[]);
    peticion.onerror = () => reject(peticion.error);
  });
}

export function marcarDescargaLista(db: IDBDatabase, modeloId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("descargas", "readwrite");
    tx.objectStore("descargas").put({ modeloId, estado: "listo" } satisfies Descarga);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
