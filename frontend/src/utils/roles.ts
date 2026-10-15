import type { Rol } from "../tipos";

// Página de inicio según el rol (Anexo 1: roles asociados al sistema).
export function destinoSegunRol(rol: Rol): string {
  if (rol === "Administrador") return "/admin";
  if (rol === "Vendedor") return "/admin/productos";
  return "/";
}
