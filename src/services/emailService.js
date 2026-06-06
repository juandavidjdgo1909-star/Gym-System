import nodemailer from "nodemailer";

const requiredMailVars = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];

const isMailConfigured = () =>
  requiredMailVars.every((key) => Boolean(process.env[key]));

const fmtDate = (value) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "Sin fecha";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sessionText = (session) => {
  const trainer = session.trainer?.name || "Entrenador";
  return [
    `Fecha: ${fmtDate(session.date)}`,
    `Hora: ${session.hour || "--:--"}`,
    `Entrenador: ${trainer}`,
    session.cancelReason ? `Motivo: ${session.cancelReason}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

const sessionHtml = ({ title, intro, session, accent = "#22d3ee" }) => `
  <div style="margin:0;background:#020617;padding:28px;font-family:Arial,sans-serif;color:#e2e8f0">
    <div style="max-width:620px;margin:0 auto;border:1px solid rgba(148,163,184,.22);border-radius:24px;background:#0f172a;overflow:hidden">
      <div style="padding:24px 28px;background:linear-gradient(135deg, rgba(34,211,238,.18), rgba(16,185,129,.12));border-bottom:1px solid rgba(148,163,184,.18)">
        <p style="margin:0 0 8px;text-transform:uppercase;letter-spacing:.18em;font-size:12px;color:${accent};font-weight:700">Gym-System</p>
        <h1 style="margin:0;color:#fff;font-size:26px;line-height:1.2">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 20px;line-height:1.65;color:#cbd5e1">${escapeHtml(intro)}</p>
        <div style="border:1px solid rgba(148,163,184,.2);border-radius:18px;background:rgba(15,23,42,.72);padding:18px">
          <p style="margin:0 0 10px;color:#94a3b8;font-size:13px">Miembro</p>
          <p style="margin:0 0 18px;color:#fff;font-size:18px;font-weight:700">${escapeHtml(session.member?.name || "Miembro")}</p>
          <p style="margin:0 0 10px;color:#94a3b8;font-size:13px">Entrenador</p>
          <p style="margin:0 0 18px;color:#fff;font-size:18px;font-weight:700">${escapeHtml(session.trainer?.name || "Entrenador")}</p>
          <p style="margin:0 0 10px;color:#94a3b8;font-size:13px">Fecha y hora</p>
          <p style="margin:0;color:#fff;font-size:18px;font-weight:700">${escapeHtml(fmtDate(session.date))} · ${escapeHtml(session.hour || "--:--")}</p>
          ${
            session.cancelReason
              ? `<p style="margin:18px 0 10px;color:#94a3b8;font-size:13px">Motivo</p><p style="margin:0;color:#fecdd3">${escapeHtml(session.cancelReason)}</p>`
              : ""
          }
        </div>
        <p style="margin:22px 0 0;color:#94a3b8;font-size:13px;line-height:1.6">Este correo fue generado automaticamente por Gym-System.</p>
      </div>
    </div>
  </div>`;

export const sendMail = async ({ to, subject, text, html }) => {
  if (!to) return;
  if (!isMailConfigured()) {
    console.warn(
      "Correo no enviado: faltan SMTP_HOST, SMTP_USER o SMTP_PASS en .env.",
    );
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

export const sendTrainingSessionEmail = async ({ type, session }) => {
  const memberEmail = session.member?.email;
  const memberName = session.member?.name || "Hola";
  const copyTrainer = process.env.SEND_TRAINER_SESSION_EMAIL === "true";
  const trainerEmail = session.trainer?.email;
  const config = {
    created: {
      title: "Solicitud de cita recibida",
      subject: "Tu solicitud de cita fue recibida",
      intro: `${memberName}, recibimos tu solicitud de entrenamiento. Tu entrenador la revisara y te avisaremos cuando cambie de estado.`,
      accent: "#22d3ee",
    },
    confirmed: {
      title: "Tu cita fue confirmada",
      subject: "Tu cita de entrenamiento fue confirmada",
      intro: `${memberName}, tu entrenador confirmo la cita. Te esperamos en la fecha programada.`,
      accent: "#34d399",
    },
    cancelled: {
      title: session.cancelReason ? "Tu cita fue rechazada" : "Tu cita fue cancelada",
      subject: session.cancelReason
        ? "Tu cita de entrenamiento fue rechazada"
        : "Tu cita de entrenamiento fue cancelada",
      intro: `${memberName}, la cita cambio a estado cancelada. Revisa los detalles y el motivo si fue registrado.`,
      accent: "#fb7185",
    },
    rescheduled: {
      title: "Tu cita fue reprogramada",
      subject: "Tu cita de entrenamiento fue reprogramada",
      intro: `${memberName}, la fecha u hora de tu cita fue actualizada. Estos son los nuevos datos.`,
      accent: "#fbbf24",
    },
  }[type];

  if (!config) return;

  const html = sessionHtml({ ...config, session });
  const text = `${config.intro}\n\n${sessionText(session)}`;

  await sendMail({
    to: memberEmail,
    subject: config.subject,
    text,
    html,
  });

  if (copyTrainer && trainerEmail) {
    await sendMail({
      to: trainerEmail,
      subject: `[Entrenador] ${config.subject}`,
      text,
      html,
    });
  }
};
