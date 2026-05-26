import RoutineExercise from "../models/routineExercise.js";

const defaultExercises = [
  ["Flexiones controladas", "Todos", "Pecho", "Inicial", "Fuerza", 3, "10-12", "60 segundos", "Mantén el abdomen firme y baja el pecho con control.", "https://www.youtube.com/embed/IODxDxX7oi4", 1],
  ["Remo con mancuerna", "Todos", "Espalda", "Inicial", "Fuerza", 3, "12 por lado", "60 segundos", "Lleva el codo hacia la cadera sin girar el torso.", "https://www.youtube.com/embed/pYcpY20QaE8", 2],
  ["Curl de bíceps", "Todos", "Brazo", "Inicial", "Fuerza", 3, "12-15", "45 segundos", "Sube sin balancear el cuerpo y baja lento.", "https://www.youtube.com/embed/ykJmrZ5v0Oo", 3],
  ["Sentadilla goblet", "Todos", "Pierna", "Inicial", "Fuerza", 4, "10-12", "75 segundos", "Rodillas alineadas, pecho arriba y talones firmes.", "https://www.youtube.com/embed/MeIiIdhvXT4", 4],
  ["Hip thrust", "Mujer", "Glúteo", "Inicial", "Tonificar", 4, "12-15", "75 segundos", "Empuja desde los talones y contrae glúteos arriba.", "https://www.youtube.com/embed/LM8XHLYJoYs", 5],
  ["Plancha frontal", "Todos", "Abdomen", "Inicial", "Resistencia", 3, "30-45 segundos", "45 segundos", "Cadera estable, cuello neutro y respiración constante.", "https://www.youtube.com/embed/pSHjTRCQxIw", 6],
  ["Press militar", "Hombre", "Hombro", "Intermedio", "Fuerza", 4, "8-10", "90 segundos", "Aprieta abdomen y empuja en línea vertical.", "https://www.youtube.com/embed/qEwKCR5JCog", 7],
  ["Peso muerto rumano", "Todos", "Pierna", "Intermedio", "Fuerza", 4, "10", "90 segundos", "Cadera atrás, espalda neutra y barra cerca del cuerpo.", "https://www.youtube.com/embed/2SHsk9AzdjA", 8],
  ["Jalón al pecho", "Todos", "Espalda", "Intermedio", "Fuerza", 4, "10-12", "75 segundos", "Lleva la barra al pecho sin encoger hombros.", "https://www.youtube.com/embed/CAwf7n6Luuc", 9],
  ["Mountain climbers", "Todos", "Full body", "Inicial", "Bajar grasa", 4, "30 segundos", "45 segundos", "Alterna rodillas rápido sin levantar la cadera.", "https://www.youtube.com/embed/nmwgirgXLYM", 10],
];

export const ensureDefaultRoutineExercises = async () => {
  const count = await RoutineExercise.countDocuments();
  if (count > 0) return;

  await RoutineExercise.insertMany(
    defaultExercises.map(
      ([name, gender, focus, level, goal, sets, reps, rest, technique, videoUrl, order]) => ({
        name,
        gender,
        focus,
        level,
        goal,
        sets,
        reps,
        rest,
        technique,
        videoUrl,
        order,
        isActive: true,
      }),
    ),
  );
};

export const getRoutineExercises = async () => {
  await ensureDefaultRoutineExercises();
  return RoutineExercise.find().sort({ order: 1, createdAt: -1 });
};
