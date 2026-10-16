// Información institucional que se muestra en el pie de página y en
// Términos y condiciones. Se recorre con map() para no repetir marcado.

export interface RedSocial {
  nombre: string;
  url: string;
  // Clase del ícono de Bootstrap Icons (por ejemplo "bi-instagram").
  icono: string;
}

export interface MedioPago {
  nombre: string;
  detalle: string;
  icono: string;
}

export interface SeccionTerminos {
  id: string;
  titulo: string;
  parrafos: string[];
}

export const REDES_SOCIALES: RedSocial[] = [
  {
    nombre: "Instagram",
    url: "https://www.instagram.com/",
    icono: "bi-instagram",
  },
  {
    nombre: "Facebook",
    url: "https://www.facebook.com/",
    icono: "bi-facebook",
  },
  { nombre: "TikTok", url: "https://www.tiktok.com/", icono: "bi-tiktok" },
  {
    nombre: "WhatsApp",
    url: "https://www.whatsapp.com/",
    icono: "bi-whatsapp",
  },
];

export const MEDIOS_PAGO: MedioPago[] = [
  { nombre: "Débito", detalle: "Tarjetas de débito", icono: "bi-credit-card" },
  {
    nombre: "Crédito",
    detalle: "Tarjetas de crédito",
    icono: "bi-credit-card-2-front",
  },
  {
    nombre: "Transferencia",
    detalle: "Transferencia bancaria",
    icono: "bi-bank",
  },
  {
    nombre: "Efectivo",
    detalle: "Solo al retirar en la clínica",
    icono: "bi-cash-coin",
  },
];

// Horario de atención: la clínica funciona las 24 horas, todos los días.
export interface BloqueHorario {
  icono: string;
  titulo: string;
  dias: string;
  detalle: string;
}

// Datos de contacto de la clínica: se escriben una sola vez y los usan el
// pie de página, Contacto, Quiénes somos, la agenda y los textos legales.
export const CLINICA = {
  nombre: "Clínica NutriDifs",
  direccion: "Av. San Marcos 123, Rancagua",
  telefono: "+56 9 4567 8910",
  correo: "contacto@nutridifs.cl",
  mapa: "https://www.google.com/maps?q=Clinica+NutriDifs+Chile&output=embed",
} as const;

export const TELEFONO_URGENCIAS = CLINICA.telefono;
export const HORARIO_RESUMEN = "Abierto 24 horas, todos los días";

export const HORARIOS: BloqueHorario[] = [
  {
    icono: "bi-calendar2-check-fill",
    titulo: "Consultas agendadas",
    dias: "Lunes a domingo · 24 horas",
    detalle: "Reserva tu hora en el formulario de esta página.",
  },
  {
    icono: "bi-heart-pulse-fill",
    titulo: "Urgencias",
    dias: "24/7 · sin hora previa",
    detalle: "Atención inmediata, también en feriados.",
  },
  {
    icono: "bi-hospital",
    titulo: "Hospitalización",
    dias: "Monitoreo continuo",
    detalle: "Equipo veterinario de turno día y noche.",
  },
];

export const FECHA_TERMINOS = "13 de octubre de 2026";

export const SECCIONES_TERMINOS: SeccionTerminos[] = [
  {
    id: "aceptacion",
    titulo: "1. Aceptación",
    parrafos: [
      "Al navegar, registrarse o comprar en el sitio de Clínica NutriDifs aceptas estos términos y condiciones. Si no estás de acuerdo con ellos, te pedimos no utilizar el sitio.",
    ],
  },
  {
    id: "cuentas",
    titulo: "2. Registro y cuentas",
    parrafos: [
      "Para comprar o agendar debes crear una cuenta con datos verdaderos y mantenerlos actualizados desde la sección Mi perfil. El registro público crea cuentas de cliente.",
      "Eres responsable de resguardar tu contraseña. Por seguridad, la cuenta se bloquea después de tres intentos fallidos de inicio de sesión; para restablecerla debes contactar a la clínica.",
    ],
  },
  {
    id: "compras",
    titulo: "3. Compras, precios y stock",
    parrafos: [
      "Los precios se informan en pesos chilenos e incluyen IVA. Solo puedes agregar al carrito unidades disponibles en stock, y el stock se descuenta al confirmar el pago.",
      "Los cupones de descuento se aplican sobre el subtotal, no son acumulables y pueden tener vigencia limitada.",
    ],
  },
  {
    id: "pagos",
    titulo: "4. Medios de pago",
    parrafos: [
      "Aceptamos tarjetas de débito y crédito, transferencia bancaria y efectivo al retirar en la clínica. El pedido se prepara una vez confirmado el pago.",
    ],
  },
  {
    id: "medicamentos",
    titulo: "5. Medicamentos veterinarios",
    parrafos: [
      "Los medicamentos son de uso exclusivo veterinario. Algunos requieren receta de un médico veterinario, que podremos solicitar antes de entregar el producto.",
      "La información publicada es referencial y no reemplaza la evaluación profesional de tu mascota.",
    ],
  },
  {
    id: "devoluciones",
    titulo: "6. Cambios y devoluciones",
    parrafos: [
      "Puedes solicitar cambios o devoluciones desde Contáctanos, eligiendo el motivo «Reclamo / Devolución». Por razones sanitarias, los medicamentos y vacunas abiertos o mal conservados no admiten devolución.",
      "Lo anterior no limita los derechos que te otorga la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.",
    ],
  },
  {
    id: "privacidad",
    titulo: "7. Datos personales",
    parrafos: [
      "Usamos tus datos solo para gestionar tu cuenta, tus compras y tus citas, conforme a la Ley N° 19.628 sobre Protección de la Vida Privada. No los compartimos con terceros sin tu autorización. El detalle está en nuestra Política de privacidad.",
    ],
  },
  {
    id: "contacto",
    titulo: "8. Contacto",
    parrafos: [
      `Para consultas sobre estos términos escríbenos a ${CLINICA.correo} o llámanos al ${CLINICA.telefono}.`,
    ],
  },
];

export const SECCIONES_PRIVACIDAD: SeccionTerminos[] = [
  {
    id: "responsable",
    titulo: "1. Responsable de los datos",
    parrafos: [
      `${CLINICA.nombre}, con domicilio en ${CLINICA.direccion}, es responsable del tratamiento de los datos personales que entregas en este sitio. Puedes escribirnos a ${CLINICA.correo}.`,
    ],
  },
  {
    id: "datos",
    titulo: "2. Datos que recopilamos",
    parrafos: [
      "Al registrarte: RUN, nombre, apellidos, correo, fecha de nacimiento, teléfono, región, comuna y dirección.",
      "Al agendar una consulta: tus datos de contacto y los de tu mascota (nombre, especie y motivo de la consulta). Al comprar: el detalle de tus órdenes.",
    ],
  },
  {
    id: "uso",
    titulo: "3. Para qué los usamos",
    parrafos: [
      "Para gestionar tu cuenta, procesar tus compras, confirmar tus citas y responder tus mensajes. No usamos tus datos para fines distintos sin tu autorización.",
    ],
  },
  {
    id: "almacenamiento",
    titulo: "4. Dónde se guardan",
    parrafos: [
      "En esta versión del sitio, la información se guarda en el almacenamiento local (LocalStorage) de tu propio navegador. Si borras los datos de navegación, esa información se elimina.",
      "Tu contraseña nunca se muestra en pantalla ni se incluye en los datos de tu sesión.",
    ],
  },
  {
    id: "terceros",
    titulo: "5. Con quién los compartimos",
    parrafos: [
      "No vendemos ni compartimos tus datos con terceros, salvo cuando la ley lo exija o sea necesario para prestar el servicio que solicitaste (por ejemplo, el envío de una muestra a un laboratorio).",
    ],
  },
  {
    id: "derechos",
    titulo: "6. Tus derechos",
    parrafos: [
      "Conforme a la Ley N° 19.628 sobre Protección de la Vida Privada, puedes solicitar el acceso, la rectificación, la cancelación o el bloqueo de tus datos personales.",
      `Puedes actualizar gran parte de tu información desde Mi perfil. Para otras solicitudes, escríbenos a ${CLINICA.correo}.`,
    ],
  },
  {
    id: "seguridad",
    titulo: "7. Seguridad",
    parrafos: [
      "Bloqueamos la cuenta después de tres intentos fallidos de inicio de sesión para protegerla de accesos no autorizados. Te recomendamos usar una contraseña que no utilices en otros sitios.",
    ],
  },
  {
    id: "cambios",
    titulo: "8. Cambios a esta política",
    parrafos: [
      "Podemos actualizar esta política. Publicaremos aquí la versión vigente con su fecha de actualización.",
    ],
  },
];
