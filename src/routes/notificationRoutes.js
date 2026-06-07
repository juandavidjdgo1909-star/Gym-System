import { Router } from "express";
import Notification from "../models/notification.js";
import { getMailStatus, sendMail } from "../services/emailService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { user, role } = req.query;
    const query = {};
    if (user) {
      query.$or = [
        { user },
        { role: "Todos", user: null },
        ...(role ? [{ role, user: null }] : []),
      ];
    } else if (role) {
      query.$or = [
        { role: "Todos" },
        { role },
      ];
    }
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(80);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener notificaciones", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (err) {
    res.status(400).json({ message: "Error al crear notificacion", error: err.message });
  }
});

router.get("/email-status", (req, res) => {
  const status = getMailStatus();
  res.status(200).json({
    ...status,
    user: status.user ? status.user.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "",
    from: status.from ? status.from.replace(/^(.{2}).*(@.*)$/, "$1***$2") : "",
  });
});

router.post("/test-email", async (req, res) => {
  try {
    const to = req.body.to || process.env.SMTP_USER;
    const info = await sendMail({
      to,
      subject: "Prueba de correo Gym-System",
      text: "Si recibes este mensaje, el SMTP de Gym-System esta funcionando.",
      html: `
        <div style="font-family:Arial,sans-serif;background:#020617;color:#e2e8f0;padding:24px">
          <h1 style="color:#fff">Prueba de correo Gym-System</h1>
          <p>Si recibes este mensaje, el SMTP esta funcionando correctamente.</p>
        </div>`,
    });
    res.status(200).json({
      message: "Correo de prueba enviado",
      to,
      messageId: info?.messageId,
    });
  } catch (err) {
    res.status(500).json({
      message: "No se pudo enviar el correo de prueba",
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
    });
  }
});

router.get("/test-email", async (req, res) => {
  try {
    const to = req.query.to || process.env.SMTP_USER;
    const info = await sendMail({
      to,
      subject: "Prueba de correo Gym-System",
      text: "Si recibes este mensaje, el SMTP de Gym-System esta funcionando.",
      html: `
        <div style="font-family:Arial,sans-serif;background:#020617;color:#e2e8f0;padding:24px">
          <h1 style="color:#fff">Prueba de correo Gym-System</h1>
          <p>Si recibes este mensaje, el SMTP esta funcionando correctamente.</p>
        </div>`,
    });
    res.status(200).json({
      message: "Correo de prueba enviado",
      to,
      messageId: info?.messageId,
    });
  } catch (err) {
    res.status(500).json({
      message: "No se pudo enviar el correo de prueba",
      error: err.message,
      code: err.code,
      command: err.command,
      response: err.response,
      responseCode: err.responseCode,
    });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.body.user } },
      { new: true },
    );
    res.status(200).json(notification);
  } catch (err) {
    res.status(400).json({ message: "Error al marcar notificacion", error: err.message });
  }
});

export default router;
