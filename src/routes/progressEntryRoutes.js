import { Router } from "express";
import ProgressEntry from "../models/progressEntry.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const records = await ProgressEntry.find()
      .populate("user", "name email document")
      .sort({ entryDate: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener progreso", error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const records = await ProgressEntry.find({ user: req.params.userId }).sort({
      entryDate: -1,
    });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener progreso del usuario", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const record = await ProgressEntry.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: "Error al guardar progreso", error: err.message });
  }
});

export default router;
