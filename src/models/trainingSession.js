import { Schema, model } from "mongoose";

const trainingSessionSchema = new Schema(
  {
    trainer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    date: {
      type: Date,
      required: true,
    },
    hour: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pendiente", "Confirmada", "Cancelada"],
      default: "Pendiente",
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default model("TrainingSession", trainingSessionSchema);
