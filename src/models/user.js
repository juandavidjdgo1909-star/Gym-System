import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    document: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      min: 6,
      required: true,
      trim: true,
    },
    rol: {
      type: String,
      enum: ["Admin", "Miembro", "Entrenador"],
      required: true,
      default: "Miembro",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    trainerSheet: {
      age: {
        type: Number,
        min: 0,
      },
      initialWeight: {
        type: Number,
        min: 0,
      },
      height: {
        type: Number,
        min: 0,
      },
      availability: {
        type: String,
        trim: true,
      },
      goal: {
        type: String,
        trim: true,
      },
      sportHistory: {
        type: String,
        trim: true,
      },
      medicalNotes: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true },
);

export default model("User", userSchema);
