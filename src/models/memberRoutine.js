import { Schema, model } from "mongoose";

const memberRoutineSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: {
      gender: { type: String, trim: true },
      level: { type: String, trim: true },
      goal: { type: String, trim: true },
      focuses: [{ type: String, trim: true }],
      daysPerWeek: { type: Number, min: 1, max: 7 },
    },
    exercises: [
      {
        exercise: { type: Schema.Types.ObjectId, ref: "RoutineExercise" },
        name: { type: String, trim: true },
        focus: { type: String, trim: true },
        sets: Number,
        reps: { type: String, trim: true },
        rest: { type: String, trim: true },
        videoUrl: { type: String, trim: true },
        technique: { type: String, trim: true },
        order: Number,
      },
    ],
    status: {
      type: String,
      enum: ["Activa", "Archivada"],
      default: "Activa",
    },
  },
  { timestamps: true },
);

export default model("MemberRoutine", memberRoutineSchema);
