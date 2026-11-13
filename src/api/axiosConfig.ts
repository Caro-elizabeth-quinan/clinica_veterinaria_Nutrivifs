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