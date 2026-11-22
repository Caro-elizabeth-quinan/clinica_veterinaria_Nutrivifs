import { api } from "../api/axiosConfig";
import type { CategoriaServicio, Servicio } from "../tipos";

// Servicio tal como lo devuelve GET /api/v1/servicios (ServicioDTO del backend)
type ServicioApi = {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  especie: string | null;
  duracion: number; // minutos
  precio: number;
  observacion: string | null;
  imagen: string | null;
  alt: string | null;
  consulta: string | null;
  enlace: boolean;
  categoria: string;
};

// Presentación de cada categoría (emoji, ancla y clase CSS de la página)
const PRESENTACION: Record<
  string,
  { id: string; titulo: string; clase: string }
> = {
  Consultas: {
    id: "categoria-consultas",
    titulo: "🩺 Consultas",
    clase: "categoria-servicios-1",
  },
  Vacunación: {
    id: "categoria-vacunacion",
    titulo: "💉 Vacunación",
    clase: "categoria-servicios",
  },
  Cirugías: {
    id: "categoria-cirugia",
    titulo: "🏥 Cirugías",
    clase: "categoria-servicios",
  },
  Desparasitación: {
    id: "categoria-desparasitacion",
    titulo: "🪱 Desparasitación",
    clase: "categoria-servicios",
  },
  Exámenes: {
    id: "categoria-examenes",
    titulo: "🔬 Exámenes",
    clase: "categoria-servicios",
  },
};

function presentacion(nombre: string) {
  if (PRESENTACION[nombre]) return PRESENTACION[nombre];
  // Categoría creada después: se arma el ancla a partir del nombre
  const slug = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  return { id: `categoria-${slug}`, titulo: nombre, clase: "categoria-servicios" };
}

function emojiEspecie(especie: string): string {
  const e = especie.toLowerCase();
  if (e.includes("todas")) return "🐾";
  if (/\bave\b|conejo/.test(e)) return "🐦🐰";
  const perro = /perr/.test(e);
  const gato = /gat/.test(e);
  if (perro && gato) return "🐶🐱";
  if (perro) return "🐶";
  if (gato) return "🐱";
  return "🐾";
}

function aServicio(s: ServicioApi): Servicio {
  const especie = s.especie ?? "";
  return {
    codigo: s.codigo,
    nombre: s.nombre,
    descripcion: s.descripcion ?? "",
    especie: especie ? `${emojiEspecie(especie)} ${especie}` : "",
    duracion: `⏱️ ${s.duracion} min`,
    precio: `$${s.precio.toLocaleString("es-CL")}`,
    observacion: s.observacion ?? "",
    imagen: s.imagen || "/img/consulta-general.jpg",
    alt: s.alt ?? s.nombre,
    consulta: s.consulta || s.nombre,
    enlace: s.enlace,
  };
}

// GET /api/v1/servicios (público): se agrupan por categoría, en el orden en que llegan
export async function obtenerCategoriasServicioApi(): Promise<
  CategoriaServicio[]
> {
  const respuesta = await api.get<ServicioApi[]>("/servicios");
  const grupos = new Map<string, CategoriaServicio>();
  for (const s of respuesta.data) {
    const nombre = s.categoria || "Otros";
    if (!grupos.has(nombre)) {
      grupos.set(nombre, { ...presentacion(nombre), servicios: [] });
    }
    grupos.get(nombre)!.servicios.push(aServicio(s));
  }
  return [...grupos.values()];
}