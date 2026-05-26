import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkInAt: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ["Manual", "QR", "App"],
      default: "App",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default model("Attendance", attendanceSchema);
