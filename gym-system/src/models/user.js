import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: Number,
      min: 10,
      max: 10,
      required: true,
      unique: true,
    },
    document: {
      type: Number,
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
  },
  { timestamps: true },
);

export default model("User", userSchema);
