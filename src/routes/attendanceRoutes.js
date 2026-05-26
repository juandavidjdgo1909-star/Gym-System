import { Router } from "express";
import Attendance from "../models/attendance.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name email document")
      .sort({ checkInAt: -1 });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener asistencias", error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.params.userId }).sort({
      checkInAt: -1,
    });
    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener asistencias del usuario", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existing = await Attendance.findOne({
      user: req.body.user,
      checkInAt: { $gte: start, $lt: end },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const record = await Attendance.create(req.body);
    await record.populate("user", "name email document");
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: "Error al registrar asistencia", error: err.message });
  }
});

export default router;
