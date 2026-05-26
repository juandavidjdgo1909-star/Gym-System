import { Router } from "express";
import RoutineExercise from "../models/routineExercise.js";
import { getRoutineExercises } from "../services/routineExerciseService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    res.status(200).json(await getRoutineExercises());
  } catch (err) {
    res.status(500).json({ message: "Error al obtener ejercicios", error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const exercise = await RoutineExercise.create(req.body);
    res.status(201).json(exercise);
  } catch (err) {
    res.status(400).json({ message: "Error al crear ejercicio", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const exercise = await RoutineExercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }
    res.status(200).json(exercise);
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar ejercicio", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const exercise = await RoutineExercise.findByIdAndDelete(req.params.id);
    if (!exercise) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }
    res.status(200).json({ message: "Ejercicio eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: "Error al eliminar ejercicio", error: err.message });
  }
});

export default router;
