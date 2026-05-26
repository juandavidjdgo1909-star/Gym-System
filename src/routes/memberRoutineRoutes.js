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

const rotateList = (items, offset) => {
  if (!items.length) return [];
  const start = Math.abs(offset) % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
};

const uniqueById = (items) => {
  const used = new Set();
  return items.filter((item) => {
    const id = String(item._id);
    if (used.has(id)) return false;
    used.add(id);
    return true;
  });
};

const videoKey = (url) => {
  const value = String(url || "").trim();
  if (!value) return "";
  const match = value.match(/(?:embed\/|v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match ? match[1] : value;
};

const uniqueByVideo = (items) => {
  const usedVideos = new Set();
  return items.filter((item) => {
    const key = videoKey(item.videoUrl) || String(item._id);
    if (usedVideos.has(key)) return false;
    usedVideos.add(key);
    return true;
  });
};

const exerciseScore = (exercise, { gender, level, goal }) => {
  let score = 0;
  if (exercise.gender === gender) score += 8;
  if (exercise.gender === "Todos") score += 4;
  if (normalize(exercise.level) === normalize(level)) score += 3;
  if (normalize(exercise.goal).includes(normalize(goal))) score += 2;
  return score;
};

const sortedRotatingPool = (exercises, answers, seed, recentVideoKeys = new Set()) => {
  return rotateList(
    [...exercises].sort((a, b) => {
      const recentDiff =
        Number(recentVideoKeys.has(videoKey(a.videoUrl))) -
        Number(recentVideoKeys.has(videoKey(b.videoUrl)));
      if (recentDiff) return recentDiff;
      const scoreDiff = exerciseScore(b, answers) - exerciseScore(a, answers);
      if (scoreDiff) return scoreDiff;
      return Number(a.order || 0) - Number(b.order || 0);
    }),
    seed,
  );
};

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
    const selectedFocuses = (focuses.length ? focuses : ["Full body"]).map((focus) =>
      normalize(focus) === "gluteo" ? "Gluteo" : focus,
    );
    const activeExercises = await RoutineExercise.find({ isActive: true }).sort({
      order: 1,
      createdAt: -1,
    });
    const previousRoutineCount = await MemberRoutine.countDocuments({ user });
    const recentRoutines = await MemberRoutine.find({ user })
      .sort({ createdAt: -1 })
      .limit(3);
    const recentVideoKeys = new Set(
      recentRoutines.flatMap((routine) =>
        (routine.exercises || []).map((exercise) => videoKey(exercise.videoUrl)).filter(Boolean),
      ),
    );
    const targetCount = Math.max(4, Math.min(8, Number(daysPerWeek) + selectedFocuses.length));
    const answers = { gender, level, goal };
    const chosen = [];

    selectedFocuses.forEach((focus, focusIndex) => {
      const focusPool = activeExercises.filter((exercise) => {
        const genderOk = exercise.gender === "Todos" || exercise.gender === gender;
        return genderOk && normalize(exercise.focus) === normalize(focus);
      });
      const rotated = sortedRotatingPool(
        focusPool,
        answers,
        previousRoutineCount + focusIndex,
        recentVideoKeys,
      );
      const amountForFocus = Math.max(1, Math.floor(targetCount / selectedFocuses.length));
      chosen.push(...rotated.slice(0, amountForFocus));
    });

    const broadPool = activeExercises.filter((exercise) => {
      const genderOk = exercise.gender === "Todos" || exercise.gender === gender;
      const focusOk =
        selectedFocuses.map(normalize).includes(normalize(exercise.focus)) ||
        normalize(exercise.focus) === "full body";
      return genderOk && focusOk;
    });
    const rotatedBroadPool = sortedRotatingPool(
      broadPool,
      answers,
      previousRoutineCount + selectedFocuses.length,
      recentVideoKeys,
    );
    const exercises = uniqueByVideo(uniqueById([...chosen, ...rotatedBroadPool])).slice(
      0,
      targetCount,
    );

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

router.put("/:routineId/exercises/:exerciseIndex", async (req, res) => {
  try {
    const routine = await MemberRoutine.findById(req.params.routineId);
    if (!routine) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    const index = Number(req.params.exerciseIndex);
    if (!Number.isInteger(index) || !routine.exercises[index]) {
      return res.status(404).json({ message: "Ejercicio no encontrado en la rutina" });
    }

    const exercise = routine.exercises[index];
    exercise.completed = Boolean(req.body.completed);
    exercise.completedAt = exercise.completed ? new Date() : undefined;
    exercise.weightUsed = req.body.weightUsed === "" ? undefined : Number(req.body.weightUsed || 0);
    exercise.rpe = req.body.rpe === "" ? undefined : Number(req.body.rpe || 0);
    exercise.notes = req.body.notes || "";
    await routine.save();
    res.status(200).json(routine);
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar ejercicio", error: err.message });
  }
});

export default router;
