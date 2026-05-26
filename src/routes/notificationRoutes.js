import { Router } from "express";
import Notification from "../models/notification.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { user, role } = req.query;
    const query = {};
    if (user || role) {
      query.$or = [
        { role: "Todos" },
        ...(role ? [{ role }] : []),
        ...(user ? [{ user }] : []),
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
