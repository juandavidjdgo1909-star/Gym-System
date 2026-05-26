import { Schema, model } from "mongoose";

const routineExerciseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Todos", "Hombre", "Mujer"],
      default: "Todos",
    },
    focus: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Inicial", "Intermedio", "Avanzado"],
      default: "Inicial",
    },
    goal: {
      type: String,
      trim: true,
      default: "Fuerza",
    },
    sets: {
      type: Number,
      default: 3,
      min: 1,
    },
    reps: {
      type: String,
      trim: true,
      default: "10-12",
    },
    rest: {
      type: String,
      trim: true,
      default: "60 segundos",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    technique: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 1,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default model("RoutineExercise", routineExerciseSchema);
