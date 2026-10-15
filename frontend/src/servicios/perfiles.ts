import type { Perfil } from "../tipos";
import { CLAVES, guardar, leerLista } from "./almacenamiento";

export function leerPerfiles(): Perfil[] {
  return leerLista<Perfil>(CLAVES.PERFILES);
}

export function guardarPerfiles(perfiles: Perfil[]): void {
  guardar(CLAVES.PERFILES, perfiles);
}
