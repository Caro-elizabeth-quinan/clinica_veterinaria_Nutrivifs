// Resúmenes informativos de productos y servicios. Son referenciales: la
// dosis y la frecuencia siempre las indica el médico veterinario.

export interface ResumenProducto {
  resumen: string;
  indicaciones: string[];
}

export interface ResumenServicio {
  resumen: string;
  incluye: string[];
}

export const RESUMEN_PRODUCTOS: Record<string, ResumenProducto> = {
  ME001: {
    resumen:
      "Antibiótico de amplio espectro a base de amoxicilina, de uso frecuente en perros y gatos.",
    indicaciones: [
      "Infecciones bacterianas de piel y tejidos blandos",
      "Infecciones respiratorias y urinarias",
      "Infecciones dentales",
    ],
  },
  ME002: {
    resumen:
      "Antibiótico del grupo de las fluoroquinolonas (enrofloxacino) para infecciones bacterianas.",
    indicaciones: [
      "Infecciones urinarias y respiratorias",
      "Infecciones de piel y heridas",
      "No recomendado en cachorros en crecimiento",
    ],
  },
  ME003: {
    resumen:
      "Antibiótico y antiprotozoario (metronidazol) usado en cuadros digestivos.",
    indicaciones: [
      "Diarreas por Giardia",
      "Infecciones por bacterias anaerobias",
      "Algunas infecciones bucales",
    ],
  },
  ME004: {
    resumen:
      "Antiparasitario externo masticable (afoxolaner) con sabor agradable para perros.",
    indicaciones: [
      "Elimina pulgas y garrapatas",
      "Protección durante un mes",
      "Se administra según el peso del perro",
    ],
  },
  ME005: {
    resumen:
      "Antiparasitario externo masticable (fluralaner) de acción prolongada para perros.",
    indicaciones: [
      "Elimina pulgas y garrapatas",
      "Protección de hasta 12 semanas",
      "Se elige la presentación según el peso",
    ],
  },
  ME006: {
    resumen:
      "Pipeta para gatos (selamectina + sarolaner) que cubre parásitos externos e internos.",
    indicaciones: [
      "Pulgas, garrapatas y ácaros del oído",
      "Parásitos intestinales (gusanos redondos y anquilostomas)",
      "Aplicación mensual sobre la piel de la nuca",
    ],
  },
  ME007: {
    resumen:
      "Antiparasitario interno de amplio espectro para perros (praziquantel + pirantel + febantel).",
    indicaciones: [
      "Gusanos redondos y planos (tenias)",
      "Desparasitación de rutina",
      "Dosis según el peso del perro",
    ],
  },
  ME008: {
    resumen:
      "Antiparasitario interno para gatos (milbemicina oxima + praziquantel).",
    indicaciones: [
      "Gusanos redondos y tenias",
      "Desparasitación periódica",
      "Apto desde gatitos con el peso mínimo indicado",
    ],
  },
  ME009: {
    resumen:
      "Antiinflamatorio no esteroidal (meloxicam) para controlar dolor e inflamación.",
    indicaciones: [
      "Artrosis y dolor articular",
      "Dolor postoperatorio",
      "No combinar con otros antiinflamatorios ni corticoides",
    ],
  },
  ME010: {
    resumen:
      "Antiinflamatorio no esteroidal (carprofeno) de uso exclusivo en perros.",
    indicaciones: [
      "Artrosis y displasia de cadera",
      "Dolor e inflamación después de cirugías",
      "Administrar con comida",
    ],
  },
  ME011: {
    resumen:
      "Shampoo antiséptico con clorhexidina al 2% para el cuidado de la piel.",
    indicaciones: [
      "Dermatitis bacterianas",
      "Limpieza de piel irritada",
      "Dejar actuar unos minutos antes de enjuagar",
    ],
  },
  ME012: {
    resumen:
      "Shampoo medicado (miconazol + clorhexidina) contra hongos y bacterias de la piel.",
    indicaciones: [
      "Dermatitis por levaduras (Malassezia)",
      "Piel grasa con mal olor",
      "Uso de apoyo en tratamientos dermatológicos",
    ],
  },
  ME013: {
    resumen:
      "Antipruriginoso (oclacitinib) que alivia rápidamente la picazón en perros.",
    indicaciones: [
      "Picazón por dermatitis alérgica",
      "Dermatitis atópica",
      "Para perros mayores de 12 meses",
    ],
  },
  ME014: {
    resumen:
      "Probiótico (Bacillus clausii) que ayuda a equilibrar la flora intestinal.",
    indicaciones: [
      "Diarreas leves",
      "Apoyo durante tratamientos con antibióticos",
      "Cambios de alimentación",
    ],
  },
  ME015: {
    resumen:
      "Protector gástrico (omeprazol) que disminuye la producción de ácido en el estómago.",
    indicaciones: [
      "Gastritis y úlceras",
      "Vómitos asociados a acidez",
      "Protección gástrica durante otros tratamientos",
    ],
  },
  ME016: {
    resumen:
      "Medicamento cardíaco (pimobendan) que mejora la fuerza de contracción del corazón.",
    indicaciones: [
      "Insuficiencia cardíaca en perros",
      "Enfermedad de la válvula mitral",
      "Requiere control veterinario periódico",
    ],
  },
  ME017: {
    resumen:
      "Analgésico (tramadol) para el manejo del dolor moderado a intenso.",
    indicaciones: [
      "Dolor postoperatorio",
      "Dolor crónico",
      "Venta solo con receta veterinaria",
    ],
  },
  ME018: {
    resumen:
      "Vacuna polivalente para perros que protege contra cuatro enfermedades virales.",
    indicaciones: [
      "Distemper (moquillo) y hepatitis infecciosa",
      "Parvovirus y parainfluenza",
      "Parte del calendario de cachorros y refuerzo anual",
    ],
  },
  ME019: {
    resumen: "Vacuna antirrábica para perros y gatos, exigida en Chile.",
    indicaciones: [
      "Prevención de la rabia",
      "Desde los 3 meses de edad",
      "Refuerzo según el calendario indicado",
    ],
  },
  ME020: {
    resumen:
      "Vacuna triple felina contra las principales enfermedades virales del gato.",
    indicaciones: [
      "Rinotraqueítis viral felina",
      "Calicivirus felino",
      "Panleucopenia felina",
    ],
  },
  ME021: {
    resumen:
      "Suplemento de ácidos grasos omega 3, 6 y 9 para la salud de piel y pelaje.",
    indicaciones: [
      "Pelaje opaco o caída de pelo",
      "Piel seca",
      "Apoyo articular y cardiovascular",
    ],
  },
  ME022: {
    resumen:
      "Condroprotector (condroitina + glucosamina) para el cuidado de las articulaciones.",
    indicaciones: [
      "Artrosis y desgaste articular",
      "Perros mayores o de razas grandes",
      "Apoyo después de lesiones articulares",
    ],
  },
};

// Recomendaciones generales por categoría. También sirven para productos
// nuevos creados desde el panel, que no tienen resumen propio.
export const RECOMENDACIONES_CATEGORIA: Record<string, string[]> = {
  Antibióticos: [
    "Completa el tratamiento aunque tu mascota mejore antes.",
    "No uses antibióticos sin indicación veterinaria.",
  ],
  Antiparasitarios: [
    "Pesa a tu mascota antes de elegir la presentación.",
    "Mantén un calendario de desparasitación.",
  ],
  Antiinflamatorios: [
    "Adminístralo con comida para proteger el estómago.",
    "Suspende y consulta si aparecen vómitos o decaimiento.",
  ],
  Dermatología: [
    "Usa agua tibia y seca bien el pelaje.",
    "Si la picazón persiste, agenda un control.",
  ],
  Digestivo: [
    "Ofrece agua fresca en todo momento.",
    "Si hay sangre en las heces, consulta de urgencia.",
  ],
  Cardíaco: [
    "No suspendas el tratamiento sin indicación.",
    "Controla la respiración de tu mascota en reposo.",
  ],
  Analgésicos: [
    "Respeta los horarios indicados.",
    "Guárdalo fuera del alcance de niños.",
  ],
  Vacunas: [
    "Se aplica en la clínica, previa evaluación.",
    "Tu mascota debe estar sana y desparasitada.",
  ],
  Suplementos: [
    "Los resultados se notan después de algunas semanas.",
    "Complementa, no reemplaza, una dieta equilibrada.",
  ],
};

export const RECOMENDACIONES_GENERALES = [
  "Sigue siempre la indicación de tu médico veterinario.",
  "Guárdalo en un lugar fresco y seco.",
];

export const RESUMEN_SERVICIOS: Record<string, ResumenServicio> = {
  SV001: {
    resumen: "Chequeo completo para prevenir y detectar problemas a tiempo.",
    incluye: [
      "Examen físico completo",
      "Control de peso y temperatura",
      "Plan de vacunas y desparasitación",
    ],
  },
  SV002: {
    resumen: "Atención inmediata las 24 horas, sin necesidad de hora previa.",
    incluye: [
      "Evaluación y estabilización",
      "Manejo del dolor",
      "Derivación a exámenes si se requiere",
    ],
  },
  SV003: {
    resumen: "Revisamos que la recuperación después de la cirugía vaya bien.",
    incluye: [
      "Revisión de la herida",
      "Retiro de puntos si corresponde",
      "Ajuste de medicamentos",
    ],
  },
  SV004: {
    resumen: "Atención adaptada a las necesidades de aves y conejos.",
    incluye: [
      "Examen físico especializado",
      "Revisión de dientes y pico",
      "Consejos de alimentación",
    ],
  },
  SV005: {
    resumen: "Revisamos un diagnóstico o tratamiento indicado en otra clínica.",
    incluye: [
      "Revisión de la ficha y exámenes",
      "Evaluación clínica",
      "Recomendación por escrito",
    ],
  },
  VA001: {
    resumen: "Vacuna antirrábica para perros, exigida en Chile.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Registro en carnet de vacunas",
    ],
  },
  VA002: {
    resumen:
      "Protege contra seis enfermedades virales y bacterianas del perro.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Fecha del próximo refuerzo",
    ],
  },
  VA003: {
    resumen: "Vacuna felina de dos componentes para gatos.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Registro en carnet",
    ],
  },
  VA004: {
    resumen: "Protege contra rinotraqueítis, calicivirus y panleucopenia.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Fecha del próximo refuerzo",
    ],
  },
  VA005: {
    resumen:
      "Previene la tos de las perreras, ideal antes de guarderías o paseos grupales.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Registro en carnet",
    ],
  },
  VA006: {
    resumen: "Vacuna antirrábica para gatos.",
    incluye: [
      "Evaluación previa",
      "Aplicación de la vacuna",
      "Registro en carnet",
    ],
  },
  CI001: {
    resumen:
      "Cirugía de esterilización para perras, con anestesia y hospitalización.",
    incluye: [
      "Exámenes prequirúrgicos",
      "Anestesia y monitoreo",
      "Hospitalización 24 h y control posterior",
    ],
  },
  CI002: {
    resumen: "Castración de perros con anestesia y control posterior.",
    incluye: [
      "Evaluación prequirúrgica",
      "Anestesia y monitoreo",
      "Control postoperatorio",
    ],
  },
  CI003: {
    resumen: "Esterilización de gatas con anestesia y hospitalización corta.",
    incluye: [
      "Evaluación prequirúrgica",
      "Anestesia y monitoreo",
      "Hospitalización 12 h",
    ],
  },
  CI004: {
    resumen:
      "Castración de gatos, procedimiento breve y de rápida recuperación.",
    incluye: [
      "Evaluación prequirúrgica",
      "Anestesia y monitoreo",
      "Indicaciones de cuidado en casa",
    ],
  },
  CI005: {
    resumen: "Extracción de tumores de piel con análisis posterior.",
    incluye: [
      "Evaluación del tumor",
      "Cirugía con anestesia",
      "Envío de muestra a biopsia",
    ],
  },
  CI006: {
    resumen: "Cirugía de urgencia cuando el parto natural no es posible.",
    incluye: [
      "Atención inmediata 24/7",
      "Cirugía y monitoreo",
      "Cuidado de la madre y crías",
    ],
  },
  DE001: {
    resumen: "Desparasitación interna para mascotas de menos de 10 kg.",
    incluye: [
      "Control de peso",
      "Aplicación del antiparasitario",
      "Fecha de la próxima dosis",
    ],
  },
  DE002: {
    resumen: "Desparasitación interna para mascotas de 10 a 25 kg.",
    incluye: [
      "Control de peso",
      "Aplicación del antiparasitario",
      "Fecha de la próxima dosis",
    ],
  },
  DE003: {
    resumen: "Desparasitación interna para mascotas de más de 25 kg.",
    incluye: [
      "Control de peso",
      "Aplicación del antiparasitario",
      "Fecha de la próxima dosis",
    ],
  },
  DE004: {
    resumen: "Desparasitación interna para gatos, según su peso.",
    incluye: [
      "Control de peso",
      "Aplicación del antiparasitario",
      "Fecha de la próxima dosis",
    ],
  },
  DE005: {
    resumen: "Protección contra pulgas y garrapatas.",
    incluye: [
      "Revisión del pelaje",
      "Aplicación del producto",
      "Consejos de prevención en casa",
    ],
  },
  EX001: {
    resumen:
      "Análisis de sangre para evaluar glóbulos rojos, blancos y plaquetas.",
    incluye: [
      "Toma de muestra",
      "Análisis en laboratorio",
      "Entrega de resultados",
    ],
  },
  EX002: {
    resumen: "Evalúa el funcionamiento de órganos como hígado y riñones.",
    incluye: [
      "Toma de muestra",
      "Análisis en laboratorio",
      "Entrega de resultados",
    ],
  },
  EX003: {
    resumen: "Imagen para evaluar huesos, tórax y abdomen.",
    incluye: [
      "Toma de la radiografía",
      "Informe del veterinario",
      "1 proyección",
    ],
  },
  EX004: {
    resumen: "Examen por imagen de los órganos del abdomen, sin dolor.",
    incluye: [
      "Preparación de la zona",
      "Ecografía completa",
      "Informe del veterinario",
    ],
  },
  EX005: {
    resumen: "Prueba rápida para detectar leishmaniasis.",
    incluye: [
      "Toma de muestra",
      "Resultado en minutos",
      "Orientación según el resultado",
    ],
  },
};
