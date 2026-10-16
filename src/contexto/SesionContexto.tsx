import { useState, type ReactNode } from "react";
import { CLAVES, guardar, leerObjeto } from "../servicios/almacenamiento";
import { SesionContexto } from "../hooks/useSesion";
import type { Perfil, Sesion } from "../tipos";

function leerSesion(): Sesion | null {
  const sesion = leerObjeto<Sesion>(CLAVES.SESION);
  return sesion?.email ? sesion : null;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  const iniciarSesion = (perfil: Perfil) => {
    const nueva: Sesion = {
      name: perfil.name,
      apellido: perfil.apellido || "",
      email: perfil.email,
      role: perfil.role || "Cliente",
      birthDate: perfil.birthDate || "",
      phone: perfil.phone || "",
    };
    guardar(CLAVES.SESION, nueva);
    setSesion(nueva);
  };

  const cerrarSesion = () => {
    localStorage.removeItem(CLAVES.SESION);
    setSesion(null);
  };

  return (
    <SesionContexto.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  );
}
