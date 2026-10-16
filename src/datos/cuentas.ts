import type { IntegranteEquipo, Rol } from "../tipos";

// Cuentas de demostración, una por cada rol del sistema.
export const CUENTAS_INICIALES: {
  run: string;
  name: string;
  apellido: string;
  email: string;
  password: string;
  role: Rol;
}[] = [
  {
    run: "111111111",
    name: "Admin",
    apellido: "NutriDifs",
    email: "admin@duoc.cl",
    password: "Admin123",
    role: "Administrador",
  },
  {
    run: "222222222",
    name: "Vendedor",
    apellido: "NutriDifs",
    email: "vendedor@duoc.cl",
    password: "Vende123",
    role: "Vendedor",
  },
  {
    run: "333333333",
    name: "Cliente",
    apellido: "Demo",
    email: "cliente@gmail.com",
    password: "Cliente1",
    role: "Cliente",
  },
];

// Integrantes que aparecen en la sección "El equipo" del inicio.
export const EQUIPO_INICIAL: IntegranteEquipo[] = [
  {
    id: "USR001",
    name: "Carolina Quinan",
    email: "carolina@gmail.com",
    foto: "/img/equipo-carolina.jpg",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: "USR002",
    name: "Liza Micele",
    email: "liza@gmail.com",
    foto: "/img/equipo-liza.jpg",
    role: "Administrador",
    status: "Activo",
  },
  {
    id: "USR003",
    name: "Benatha Louime",
    email: "benatha@gmail.com",
    foto: "/img/equipo-benatha.jpg",
    role: "Administrador",
    status: "Activo",
  },
];
