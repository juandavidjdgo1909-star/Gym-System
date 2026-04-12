import { Router } from "express";
import * as trainingSessionService from "../services/trainingSessionService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const sessions = await trainingSessionService.getAllTrainingSessions();
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener sesiones de entrenamiento",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const session = await trainingSessionService.getTrainingSessionById(
      req.params.id,
    );
    res.status(200).json(session);
  } catch (err) {
    res.status(404).json({
      message: "Sesión no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

router.get("/trainer/:trainerId", async (req, res) => {
  try {
    const sessions = await trainingSessionService.getSessionsByTrainer(
      req.params.trainerId,
    );
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener sesiones del entrenador",
      trainerId: req.params.trainerId,
      error: err.message,
    });
  }
});

router.get("/member/:memberId", async (req, res) => {
  try {
    const sessions = await trainingSessionService.getSessionsByMember(
      req.params.memberId,
    );
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener sesiones del miembro",
      memberId: req.params.memberId,
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newSession = await trainingSessionService.createTrainingSession(
      req.body,
    );
    res.status(201).json(newSession);
  } catch (err) {
    res.status(400).json({
      message: "Error al crear sesión de entrenamiento",
      error: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedSession = await trainingSessionService.updateTrainingSession(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedSession);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar sesión", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await trainingSessionService.deleteTrainingSession(req.params.id);
    res
      .status(200)
      .json({ message: "Sesión eliminada correctamente", id: req.params.id });
  } catch (err) {
    res.status(404).json({
      message: "Sesión no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
