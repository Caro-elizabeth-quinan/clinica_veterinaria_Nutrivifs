// Tipos compartidos por toda la aplicación.

export type Rol = "Administrador" | "Vendedor" | "Cliente";

export interface Producto {
  id: string;
  name: string;
  description: string;
  species: string;
  price: number;
  stock: number;
  stockCritico: number | "";
  category: string;
  image: string;
}

// Categoría de productos, administrada desde el panel. Los productos guardan
// el nombre de su categoría en "category".
export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
}

// Reseña de un producto escrita por un usuario con sesión iniciada.
export interface Resena {
  id: string;
  productoId: string;
  email: string;
  autor: string;
  puntuacion: number; // 1 a 5 estrellas
  comentario: string;
  fecha: string; // ISO
}

export interface ItemCarrito {
  code: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Perfil {
  run: string;
  name: string;
  apellido: string;
  email: string;
  password: string;
  role: Rol;
  birthDate: string;
  direccion: string;
  region: string;
  comuna: string;
  genero: string;
  phone: string;
  failedAttempts: number;
  locked: boolean;
}

// Datos de la sesión activa (nunca incluye la contraseña).
export interface Sesion {
  name: string;
  apellido: string;
  email: string;
  role: Rol;
  birthDate: string;
  phone: string;
}

export interface IntegranteEquipo {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  // Ruta de la foto en public/img; sin foto se muestran las iniciales.
  foto?: string;
}

export interface Servicio {
  codigo: string;
  nombre: string;
  descripcion: string;
  especie: string;
  duracion: string;
  precio: string;
  observacion: string;
  imagen: string;
  alt: string;
  // Valor que se envía a "Agenda tu consulta" para preseleccionar el tipo.
  consulta: string;
  // En el sitio original algunas tarjetas usaban un enlace y otras un botón.
  enlace: boolean;
}

export interface CategoriaServicio {
  id: string;
  titulo: string;
  clase: string;
  servicios: Servicio[];
}

export type EstadoOrden = "Entrega pendiente" | "Listo" | "Enviado";

export interface Orden {
  id: string;
  date: string;
  customer: { name: string; email: string };
  items: ItemCarrito[];
  subtotal: number;
  discount: number;
  total: number;
  status: EstadoOrden | "Pendiente";
}

export type EstadoCita = "Pendiente" | "Confirmada" | "Rechazada";

export interface Cita {
  id: string;
  fechaSolicitud: string;
  nombre: string;
  rut: string;
  correo: string;
  telefono: string;
  mascota: string;
  especie: string;
  tipoConsulta: string;
  fecha: string;
  motivo: string;
  estado: EstadoCita;
}

export interface Mensaje {
  fecha: string;
  nombre: string;
  correo: string;
  motivo: string;
  comentario: string;
}
