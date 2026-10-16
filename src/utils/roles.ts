import type { Rol } from "../tipos";

// Los tres roles del sistema, en un solo lugar.
export const ROLES: Rol[] = ["Administrador", "Vendedor", "Cliente"];

// Roles que cada perfil puede asignar al crear usuarios: el Administrador
// asigna cualquiera; el Vendedor solo puede crear clientes.
export function rolesAsignables(rol: Rol): Rol[] {
  return rol === "Administrador" ? ROLES : ["Cliente"];
}

// Página de inicio según el rol (Anexo 1: roles asociados al sistema).
export function destinoSegunRol(rol: Rol): string {
  if (rol === "Administrador") return "/admin";
  if (rol === "Vendedor") return "/admin/productos";
  return "/";
}
