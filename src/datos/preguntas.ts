// Preguntas frecuentes del Inicio, agrupadas por tema.

export type TemaPregunta = "Consultas" | "Compras" | "Mi cuenta";

export interface PreguntaFrecuente {
  id: string;
  tema: TemaPregunta;
  pregunta: string;
  respuesta: string;
  // Enlace opcional a la página donde se resuelve la duda.
  enlace?: { texto: string; ruta: string };
}

export const TEMAS_PREGUNTAS: TemaPregunta[] = [
  "Consultas",
  "Compras",
  "Mi cuenta",
];

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    id: "urgencias",
    tema: "Consultas",
    pregunta: "¿Atienden urgencias de noche o en feriados?",
    respuesta:
      "Sí. La clínica funciona las 24 horas, todos los días del año. Las urgencias se atienden sin hora previa; si puedes, llámanos al +56 9 4567 8910 mientras vienes en camino.",
  },
  {
    id: "agendar",
    tema: "Consultas",
    pregunta: "¿Cómo agendo una hora?",
    respuesta:
      "Completa el formulario de Agenda tu consulta con tus datos, los de tu mascota y el motivo. Te contactaremos por correo o teléfono para confirmar el día y la hora.",
    enlace: { texto: "Ir a Agenda tu consulta", ruta: "/agendar" },
  },
  {
    id: "especies",
    tema: "Consultas",
    pregunta: "¿Qué animales atienden?",
    respuesta:
      "Atendemos perros y gatos, y también aves y conejos con una consulta especializada para ellos.",
    enlace: { texto: "Ver todas las consultas", ruta: "/consultas" },
  },
  {
    id: "llevar",
    tema: "Consultas",
    pregunta: "¿Qué debo llevar a la consulta?",
    respuesta:
      "Trae el carnet de vacunas y, si los tienes, exámenes o recetas anteriores. Los perros deben venir con correa y los gatos en transportadora.",
  },
  {
    id: "pagos",
    tema: "Compras",
    pregunta: "¿Qué medios de pago aceptan?",
    respuesta:
      "Tarjetas de débito y crédito, transferencia bancaria y efectivo. El efectivo solo se acepta al retirar el pedido en la clínica.",
  },
  {
    id: "cupon",
    tema: "Compras",
    pregunta: "¿Tienen descuentos?",
    respuesta:
      "Sí. Usa el cupón NUTRI10 en el carrito para obtener un 10% de descuento sobre el subtotal de tu compra.",
    enlace: { texto: "Ir al carrito", ruta: "/carrito" },
  },
  {
    id: "receta",
    tema: "Compras",
    pregunta: "¿Necesito receta para comprar medicamentos?",
    respuesta:
      "Algunos medicamentos, como los analgésicos opioides, requieren receta de un médico veterinario. Te la podemos solicitar antes de entregar el producto.",
  },
  {
    id: "devoluciones",
    tema: "Compras",
    pregunta: "¿Puedo devolver un producto?",
    respuesta:
      "Escríbenos desde Contáctanos eligiendo el motivo «Reclamo / Devolución». Por razones sanitarias, los medicamentos y vacunas abiertos no admiten devolución.",
    enlace: { texto: "Ir a Contáctanos", ruta: "/contacto" },
  },
  {
    id: "bloqueo",
    tema: "Mi cuenta",
    pregunta: "¿Por qué se bloqueó mi cuenta?",
    respuesta:
      "Por seguridad, la cuenta se bloquea después de tres intentos fallidos de inicio de sesión. Contáctanos para restablecerla.",
  },
  {
    id: "datos",
    tema: "Mi cuenta",
    pregunta: "¿Cómo cambio mis datos personales?",
    respuesta:
      "Inicia sesión y entra a Mi perfil. Ahí puedes editar tu nombre, fecha de nacimiento, correo, dirección y región. El rol de la cuenta no se puede cambiar.",
    enlace: { texto: "Ir a Mi perfil", ruta: "/perfil" },
  },
];
