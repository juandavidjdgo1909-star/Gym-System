import { Schema, model } from "mongoose";

const progressEntrySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    waist: {
      type: Number,
      min: 0,
    },
    bodyFat: {
      type: Number,
      min: 0,
      max: 100,
    },
    energy: {
      type: Number,
      min: 1,
      max: 10,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default model("ProgressEntry", progressEntrySchema);
