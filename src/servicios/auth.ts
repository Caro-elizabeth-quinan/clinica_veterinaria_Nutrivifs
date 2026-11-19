import { api } from "../api/axiosConfig";
import type { Perfil } from "../tipos";

// POST /api/v1/auth/login → { token, usuario }
export async function loginApi(email: string, password: string): Promise<Perfil> {
  const respuesta = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", respuesta.data.token); // el interceptor lo envía solo
  return respuesta.data.usuario as Perfil;
}

// POST /api/v1/auth/registro: crea la cuenta en la BD (siempre como Cliente)
export async function registrarApi(datos: {
  run: string;
  name: string;
  apellido: string;
  email: string;
  password: string;
  birthDate: string | null;
  direccion: string;
  region: string;
  comuna: string;
  phone: string;
}): Promise<void> {
  await api.post("/auth/registro", datos);
}

export function cerrarSesionApi(): void {
  localStorage.removeItem("token");
}