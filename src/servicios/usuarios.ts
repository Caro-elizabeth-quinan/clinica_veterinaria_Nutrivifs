import { api } from "../api/axiosConfig";
import type { Perfil } from "../tipos";

// Usuario tal como lo devuelve el backend (incluye su id numérico)
export type UsuarioApi = Perfil & { id: number };

// Datos que se envían para crear o editar un usuario
export type DatosUsuario = {
  run: string;
  name: string;
  apellido: string;
  email: string;
  password: string;
  role?: string;
  birthDate: string | null;
  direccion: string;
  region: string;
  comuna: string;
  phone: string;
};

// ===== Mi perfil (cualquier usuario con sesión) =====

// GET /api/v1/auth/me
export async function obtenerMiPerfilApi(): Promise<Perfil> {
  const respuesta = await api.get<Perfil>("/auth/me");
  return respuesta.data;
}

// PUT /api/v1/usuarios/me (nunca cambia el rol ni el correo)
export async function actualizarMiPerfilApi(
  datos: Omit<DatosUsuario, "password" | "role">,
): Promise<Perfil> {
  const respuesta = await api.put<Perfil>("/usuarios/me", datos);
  return respuesta.data;
}

// ===== Mantenedor de usuarios (solo Administrador) =====

// GET /api/v1/usuarios
export async function listarUsuariosApi(): Promise<UsuarioApi[]> {
  const respuesta = await api.get<UsuarioApi[]>("/usuarios");
  return respuesta.data;
}

// POST /api/v1/usuarios
export async function crearUsuarioApi(datos: DatosUsuario): Promise<UsuarioApi> {
  const respuesta = await api.post<UsuarioApi>("/usuarios", datos);
  return respuesta.data;
}

// PUT /api/v1/usuarios/{id} (contraseña vacía = se conserva la actual)
export async function actualizarUsuarioApi(
  id: number,
  datos: DatosUsuario,
): Promise<UsuarioApi> {
  const respuesta = await api.put<UsuarioApi>(`/usuarios/${id}`, datos);
  return respuesta.data;
}

// DELETE /api/v1/usuarios/{id}
export async function eliminarUsuarioApi(id: number): Promise<void> {
  await api.delete(`/usuarios/${id}`);
}

// PATCH /api/v1/usuarios/{id}/desbloquear
export async function desbloquearUsuarioApi(id: number): Promise<UsuarioApi> {
  const respuesta = await api.patch<UsuarioApi>(`/usuarios/${id}/desbloquear`);
  return respuesta.data;
}