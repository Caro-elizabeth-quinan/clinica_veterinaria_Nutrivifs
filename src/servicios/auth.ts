import { api } from "../api/axiosConfig";
import type { Perfil } from "../tipos";

// POST /api/v1/auth/login → { token, usuario }
export async function loginApi(email: string, password: string): Promise<Perfil> {
  const respuesta = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", respuesta.data.token); // el interceptor lo envía solo
  return respuesta.data.usuario as Perfil;
}

export function cerrarSesionApi(): void {
  localStorage.removeItem("token");
}