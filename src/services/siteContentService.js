import SiteContent from "../models/siteContent.js";

const defaultHighlights = [
  {
    label: "Entrenamiento",
    title: "Planes guiados",
    description: "Organiza membresias, citas y seguimiento desde tu cuenta.",
  },
  {
    label: "Control",
    title: "Pagos claros",
    description: "Consulta compras, vencimientos y actividad registrada.",
  },
  {
    label: "Equipo",
    title: "Entrenadores",
    description: "Agenda sesiones y acompana el proceso de cada miembro.",
  },
];

const defaultAuthStats = [
  { value: "3", label: "Roles" },
  { value: "1", label: "Membresias" },
  { value: "24/7", label: "Horas" },
];

const defaultAuthCards = [
  {
    label: "Perfiles",
    title: "Roles",
    description: "Admin, Miembro y Entrenador se unen en un solo flujo.",
  },
  {
    label: "Compra",
    title: "Membresias",
    description: "Planes que se ajustan a tu interes, dinero y tiempo.",
  },
  {
    label: "Cobertura",
    title: "Seguimiento continuo",
    description: "Informacion visible en cualquier momento para la operacion.",
  },
];

const defaultScheduleCards = [
  {
    label: "Lunes a viernes",
    title: "5:00 a.m. a 10:00 p.m.",
    description: "Entrenamiento libre, asesorias y clases funcionales.",
  },
  {
    label: "Sabados",
    title: "6:00 a.m. a 6:00 p.m.",
    description: "Rutinas de fuerza, cardio y sesiones de recuperacion.",
  },
  {
    label: "Clases",
    title: "Funcional, HIIT y core",
    description: "Cupos organizados por entrenador desde la plataforma.",
  },
  {
    label: "Seguimiento",
    title: "Pagos y progreso",
    description: "Cada miembro puede revisar estado de membresia y actividad.",
  },
];

const defaultContent = {
  eyebrow: "Gimnasio completo",
  heroTitle: "Entrena fuerte, paga facil y sigue tu progreso",
  heroDescription:
    "Un gimnasio pensado para entrenar sin vueltas: membresias claras, horarios amplios, entrenadores disponibles y una plataforma para consultar pagos, clases y rutinas desde tu cuenta.",
  experienceEyebrow: "Como es entrenar aqui",
  experienceTitle:
    "Un espacio claro, intenso y facil de usar desde el primer dia",
  plansEyebrow: "Precios y membresias",
  plansTitle: "Escoge tu plan",
  scheduleEyebrow: "Horarios y clases",
  fullInfoTitle: "Entrena cuando tu dia te deje",
  fullInfoDescription:
    "Abrimos temprano, cerramos tarde y organizamos clases por franjas para que puedas combinar fuerza, cardio y acompanamiento.",
  schedule: "Lunes a sabado de 5:00 a.m. a 10:00 p.m.",
  contactEyebrow: "Visitanos",
  contactTitle: "Ven, conoce el espacio y empieza con el plan correcto",
  location: "Sede principal del gimnasio",
  contact: "contacto@gym-system.com",
  howItWorks:
    "Te afilias, eliges una membresia, registras tu pago y entras a tu panel de miembro. Desde ahi puedes revisar vigencia, historial y sesiones asignadas por entrenadores.",
  authBadge: "Gym-System",
  authTitle:
    "El centro de mando para membresias, agenda y caja en vivo, todo en una sola plataforma.",
  authDescription:
    "Una experiencia visual elegante para administrar el gym, dar seguimiento a entrenadores y ofrecer a los miembros una vista clara de sus planes.",
  authLoginEyebrow: "Acceso seguro",
  authLoginTitle: "Bienvenido de vuelta",
  authLoginDescription:
    "Ingresa con tus credenciales para disfrutar de una gran experiencia.",
};

const sanitizeCards = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          label: String(item.label || "").trim(),
          title: String(item.title || "").trim(),
          description: String(item.description || "").trim(),
        }))
        .filter((item) => item.label || item.title || item.description)
    : [];

const sanitizeStats = (items = []) =>
  Array.isArray(items)
    ? items
        .map((item) => ({
          value: String(item.value || "").trim(),
          label: String(item.label || "").trim(),
        }))
        .filter((item) => item.value || item.label)
    : [];

export const getSiteContent = async () => {
  const content = await SiteContent.findOne({ key: "main" });
  if (content) {
    const patch = {};
    Object.entries(defaultContent).forEach(([key, value]) => {
      if (!content[key]) patch[key] = value;
    });
    if (!content.highlights?.length) patch.highlights = defaultHighlights;
    if (!content.authStats?.length) patch.authStats = defaultAuthStats;
    if (!content.authCards?.length) patch.authCards = defaultAuthCards;
    if (!content.scheduleCards?.length) patch.scheduleCards = defaultScheduleCards;

    if (Object.keys(patch).length) {
      return await SiteContent.findOneAndUpdate({ key: "main" }, patch, {
        new: true,
        runValidators: true,
      });
    }

    return content;
  }

  return await SiteContent.create({
    ...defaultContent,
    key: "main",
    highlights: defaultHighlights,
    authStats: defaultAuthStats,
    authCards: defaultAuthCards,
    scheduleCards: defaultScheduleCards,
  });
};

export const updateSiteContent = async (contentData) => {
  const payload = {
    ...contentData,
    key: "main",
    highlights: sanitizeCards(contentData.highlights),
    authStats: sanitizeStats(contentData.authStats),
    authCards: sanitizeCards(contentData.authCards),
    scheduleCards: sanitizeCards(contentData.scheduleCards),
  };

  return await SiteContent.findOneAndUpdate({ key: "main" }, payload, {
    new: true,
    runValidators: true,
    upsert: true,
  });
};
