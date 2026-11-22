import { useEffect, useState, type ReactNode } from "react";
import { CLAVES, guardar, leerObjeto } from "../servicios/almacenamiento";
import {
  cerrarSesionApi,
  expiracionToken,
  renovarTokenApi,
} from "../servicios/auth";
import { SesionContexto } from "../hooks/useSesion";
import type { Perfil, Sesion } from "../tipos";

// La sesión se mantiene al recargar la página (localStorage), pero solo es
// válida si existe el token JWT del backend y todavía no ha vencido.
function leerSesion(): Sesion | null {
  const sesion = leerObjeto<Sesion>(CLAVES.SESION);
  const token = localStorage.getItem("token");
  const exp = token ? expiracionToken(token) : null;
  if (!sesion?.email || !exp || exp <= Date.now()) {
    localStorage.removeItem(CLAVES.SESION);
    localStorage.removeItem("token");
    return null;
  }
  return sesion;
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  // Renueva el token cuando ha pasado el 80 % de su vigencia (mínimo 5 s de espera)
  useEffect(() => {
    if (!sesion) return;
    let activo = true;
    let temporizador: number;

    const programar = () => {
      const token = localStorage.getItem("token");
      const exp = token ? expiracionToken(token) : null;
      if (!exp) return;
      const espera = Math.max((exp - Date.now()) * 0.8, 5000);
      temporizador = window.setTimeout(async () => {
        try {
          await renovarTokenApi();
          if (activo) programar();
        } catch {
          // Si el token ya venció, el interceptor cierra la sesión (401)
        }
      }, espera);
    };

    programar();
    return () => {
      activo = false;
      window.clearTimeout(temporizador);
    };
  }, [sesion]);

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