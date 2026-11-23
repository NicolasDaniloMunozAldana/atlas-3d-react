// index.ts — catálogo de modelos del Atlas 3D (Sesión 40). Un modelo por cada patrón del catálogo.
import type { DefinicionModelo } from "./tipos";
import { CAPAS } from "./capas";
import { MVC } from "./mvc";
import { ARBOL_BINARIO } from "./arbol-binario";
import { CLIENTE_SERVIDOR } from "./cliente-servidor";
import { CLIENTE_CACHE_SERVIDOR } from "./cliente-cache-servidor";
import { MICROSERVICIOS } from "./microservicios";
import { PUBLICADOR_SUSCRIPTOR } from "./publicador-suscriptor";
import { REPOSITORIO } from "./repositorio";

export const CATALOGO: DefinicionModelo[] = [
  CAPAS,
  MVC,
  ARBOL_BINARIO,
  CLIENTE_SERVIDOR,
  CLIENTE_CACHE_SERVIDOR,
  MICROSERVICIOS,
  PUBLICADOR_SUSCRIPTOR,
  REPOSITORIO,
];

export function modeloPorId(id: string): DefinicionModelo | undefined {
  return CATALOGO.find((m) => m.id === id);
}
