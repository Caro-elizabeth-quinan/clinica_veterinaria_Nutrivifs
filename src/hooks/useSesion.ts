import { createContext, useContext } from "react";
import type { Perfil, Sesion } from "../tipos";

// Contexto de la sesión y su hook. El proveedor (ProveedorSesion) está en
// contexto/SesionContexto.tsx; aquí solo va lo que no es un componente, para
// que el Fast Refresh de Vite funcione en ese archivo.
export interface ValorSesion {
  sesion: Sesion | null;
  iniciarSesion: (perfil: Perfil) => void;
  cerrarSesion: () => void;
}

export const SesionContexto = createContext<ValorSesion | null>(null);

export function useSesion(): ValorSesion {
  const valor = useContext(SesionContexto);
  if (!valor)
    throw new Error("useSesion debe usarse dentro de ProveedorSesion");
  return valor;
}
