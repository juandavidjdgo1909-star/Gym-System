import { Router } from "express";
import MemberRoutine from "../models/memberRoutine.js";
import RoutineExercise from "../models/routineExercise.js";
import Subscription from "../models/subscription.js";
import { ensureDefaultRoutineExercises } from "../services/routineExerciseService.js";

const router = Router();

const hasActiveSubscription = async (userId) => {
  return Subscription.exists({
    user: userId,
    status: "Activa",
    endDate: { $gte: new Date() },
  });
};

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

router.get("/", async (req, res) => {
  try {
    const routines = await MemberRoutine.find()
      .populate("user", "name email phone document trainerSheet")
      .sort({ createdAt: -1 });
    res.status(200).json(routines);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener rutinas", error: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const routine = await MemberRoutine.findOne({
      user: req.params.userId,
      status: "Activa",
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(routine);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener rutina del usuario", error: err.message });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { user, gender, level, goal, focuses = [], daysPerWeek = 3 } = req.body;
    if (!(await hasActiveSubscription(user))) {
      return res.status(403).json({
        message: "Necesitas una membresia activa para crear tu rutina.",
      });
    }

    await ensureDefaultRoutineExercises();
    const selectedFocuses = focuses.length ? focuses : ["Full body"];
    const activeExercises = await RoutineExercise.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    const exact = activeExercises.filter((exercise) => {
      const genderOk = exercise.gender === "Todos" || exercise.gender === gender;
      const focusOk =
        selectedFocuses.map(normalize).includes(normalize(exercise.focus)) ||
        normalize(exercise.focus) === "full body";
      const levelOk = normalize(exercise.level) === normalize(level);
      const goalOk = normalize(exercise.goal).includes(normalize(goal));
      return genderOk && focusOk && (levelOk || goalOk);
    });
    const fallback = activeExercises.filter((exercise) => {
      const genderOk = exercise.gender === "Todos" || exercise.gender === gender;
      const focusOk =
        selectedFocuses.map(normalize).includes(normalize(exercise.focus)) ||
        normalize(exercise.focus) === "full body";
      return genderOk && focusOk;
    });
    const pool = exact.length >= 4 ? exact : fallback;
    const exercises = pool.slice(0, Math.max(4, Math.min(8, Number(daysPerWeek) + 3)));

    if (!exercises.length) {
      return res.status(409).json({
        message: "No hay ejercicios activos para generar esta rutina. Agrega ejercicios desde el admin.",
      });
    }

    await MemberRoutine.updateMany({ user, status: "Activa" }, { status: "Archivada" });
    const routine = await MemberRoutine.create({
      user,
      answers: { gender, level, goal, focuses: selectedFocuses, daysPerWeek },
      exercises: exercises.map((exercise, index) => ({
        exercise: exercise._id,
        name: exercise.name,
        focus: exercise.focus,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        videoUrl: exercise.videoUrl,
        technique: exercise.technique,
        order: index + 1,
      })),
    });
    await routine.populate("user", "name email");
    res.status(201).json(routine);
  } catch (err) {
    res.status(400).json({ message: "Error al generar rutina", error: err.message });
  }
});

export default router;
