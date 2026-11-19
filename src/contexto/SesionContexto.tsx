import { useState, type ReactNode } from "react";
import { CLAVES, guardar, leerObjeto } from "../servicios/almacenamiento";
import { cerrarSesionApi } from "../servicios/auth";
import { SesionContexto } from "../hooks/useSesion";
import type { Perfil, Sesion } from "../tipos";

// La sesión se mantiene al recargar la página (localStorage), pero solo es
// válida si también existe el token JWT que entregó el backend al iniciar sesión.
function leerSesion(): Sesion | null {
  const sesion = leerObjeto<Sesion>(CLAVES.SESION);
  const token = localStorage.getItem("token");
  if (!sesion?.email || !token) {
    localStorage.removeItem(CLAVES.SESION);
    return null;
  }
  return sesion;
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

  // Cierra la sesión en el navegador y borra el token JWT
  const cerrarSesion = () => {
    localStorage.removeItem(CLAVES.SESION);
    cerrarSesionApi();
    setSesion(null);
  };

  return (
    <SesionContexto.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
      {children}
    </SesionContexto.Provider>
  );
}