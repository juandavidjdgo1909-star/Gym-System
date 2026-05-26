import { Router } from "express";
import TrainerMessage from "../models/trainerMessage.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { member, trainer } = req.query;
    const query = {};
    if (member) query.member = member;
    if (trainer) query.trainer = trainer;
    const messages = await TrainerMessage.find(query)
      .populate("trainer", "name email")
      .populate("member", "name email")
      .populate("author", "name rol")
      .sort({ createdAt: -1 })
      .limit(120);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener mensajes", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const message = await TrainerMessage.create(req.body);
    await message.populate("author", "name rol");
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: "Error al crear mensaje", error: err.message });
  }
});

export default router;
