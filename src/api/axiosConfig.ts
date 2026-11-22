import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 5000,
});

// Si hay sesión, cada petición lleva el JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401 con una sesión abierta (token vencido o inválido),
// se limpia la sesión y se envía al usuario a /login.
// El 401 del propio login (credenciales incorrectas) no cuenta.
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const url: string = error.config?.url ?? "";
    const teniaSesion = !!localStorage.getItem("token");
    if (
      error.response?.status === 401 &&
      teniaSesion &&
      !url.includes("/auth/login")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("clinica-nutridifs-session");
      window.location.assign("/login?expirada=1");
    }
    return Promise.reject(error);
  },
);