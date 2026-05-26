import { Schema, model } from "mongoose";

const trainerMessageSchema = new Schema(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Nota", "Ajuste", "Pregunta"],
      default: "Nota",
    },
  },
  { timestamps: true },
);

export default model("TrainerMessage", trainerMessageSchema);
