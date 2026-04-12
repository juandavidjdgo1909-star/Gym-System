import { Router } from "express";
import * as trainerProfileService from "../services/trainerProfileService.js";

const router = Router();

// GET - Obtener todos los perfiles de entrenador
router.get("/", async (req, res) => {
  try {
    const profiles = await trainerProfileService.getAllTrainerProfiles();
    res.status(200).json(profiles);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener perfiles de entrenador",
      error: err.message,
    });
  }
});

// GET - Obtener un perfil por ID
router.get("/:id", async (req, res) => {
  try {
    const profile = await trainerProfileService.getTrainerProfileById(
      req.params.id,
    );
    res.status(200).json(profile);
  } catch (err) {
    res.status(404).json({
      message: "Perfil no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

// GET - Obtener perfil por ID de usuario
router.get("/user/:userId", async (req, res) => {
  try {
    const profile = await trainerProfileService.getTrainerProfileByUserId(
      req.params.userId,
    );
    res.status(200).json(profile);
  } catch (err) {
    res.status(404).json({
      message: "Perfil no encontrado",
      userId: req.params.userId,
      error: err.message,
    });
  }
});

// POST - Crear un nuevo perfil de entrenador
router.post("/", async (req, res) => {
  try {
    const newProfile = await trainerProfileService.createTrainerProfile(
      req.body,
    );
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(400).json({
      message: "Error al crear perfil de entrenador",
      error: err.message,
    });
  }
});

// PUT - Actualizar un perfil
router.put("/:id", async (req, res) => {
  try {
    const updatedProfile = await trainerProfileService.updateTrainerProfile(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedProfile);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar perfil", error: err.message });
  }
});

// DELETE - Eliminar un perfil
router.delete("/:id", async (req, res) => {
  try {
    await trainerProfileService.deleteTrainerProfile(req.params.id);
    res
      .status(200)
      .json({ message: "Perfil eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(404).json({
      message: "Perfil no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
