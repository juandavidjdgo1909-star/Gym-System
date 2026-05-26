import { Schema, model } from "mongoose";

const siteContentSchema = new Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
    },
    eyebrow: {
      type: String,
      trim: true,
      default: "Oferta web",
    },
    heroTitle: {
      type: String,
      trim: true,
      default: "Entrena hoy y administra tu gym en una sola plataforma",
    },
    heroDescription: {
      type: String,
      trim: true,
      default:
        "Afiliate, compra tu membresia y entra a una experiencia conectada con planes, pagos, entrenadores y seguimiento.",
    },
    experienceEyebrow: {
      type: String,
      trim: true,
      default: "Como es entrenar aqui",
    },
    experienceTitle: {
      type: String,
      trim: true,
      default: "Un espacio claro, intenso y facil de usar desde el primer dia",
    },
    plansEyebrow: {
      type: String,
      trim: true,
      default: "Precios y membresias",
    },
    plansTitle: {
      type: String,
      trim: true,
      default: "Escoge tu plan",
    },
    fullInfoTitle: {
      type: String,
      trim: true,
      default: "Entrena cuando tu dia te deje",
    },
    fullInfoDescription: {
      type: String,
      trim: true,
      default:
        "Abrimos temprano, cerramos tarde y organizamos clases por franjas para que puedas combinar fuerza, cardio y acompanamiento.",
    },
    scheduleEyebrow: {
      type: String,
      trim: true,
      default: "Horarios y clases",
    },
    schedule: {
      type: String,
      trim: true,
      default: "Lunes a sabado de 5:00 a.m. a 10:00 p.m.",
    },
    contactEyebrow: {
      type: String,
      trim: true,
      default: "Visitanos",
    },
    contactTitle: {
      type: String,
      trim: true,
      default: "Ven, conoce el espacio y empieza con el plan correcto",
    },
    location: {
      type: String,
      trim: true,
      default: "Sede principal del gimnasio",
    },
    contact: {
      type: String,
      trim: true,
      default: "contacto@gym-system.com",
    },
    howItWorks: {
      type: String,
      trim: true,
      default:
        "Te afilias, eliges una membresia, registras tu pago y entras a tu panel de miembro. Desde ahi puedes revisar vigencia, historial y sesiones asignadas por entrenadores.",
    },
    authBadge: {
      type: String,
      trim: true,
      default: "Gym-System",
    },
    authTitle: {
      type: String,
      trim: true,
      default:
        "El centro de mando para membresias, agenda y caja en vivo, todo en una sola plataforma.",
    },
    authDescription: {
      type: String,
      trim: true,
      default:
        "Una experiencia visual elegante para administrar el gym, dar seguimiento a entrenadores y ofrecer a los miembros una vista clara de sus planes.",
    },
    authLoginEyebrow: {
      type: String,
      trim: true,
      default: "Acceso seguro",
    },
    authLoginTitle: {
      type: String,
      trim: true,
      default: "Bienvenido de vuelta",
    },
    authLoginDescription: {
      type: String,
      trim: true,
      default:
        "Ingresa con tus credenciales para disfrutar de una gran experiencia.",
    },
    authStats: [
      {
        value: { type: String, trim: true },
        label: { type: String, trim: true },
      },
    ],
    authCards: [
      {
        label: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    scheduleCards: [
      {
        label: { type: String, trim: true },
        title: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    highlights: [
      {
        label: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default model("SiteContent", siteContentSchema);
