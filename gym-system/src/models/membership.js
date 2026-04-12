import { Schema, model } from "mongoose";

const membershipSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    durationInDays: {
      type: Number,
      required: true,
      min: 1,
    },

    category: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    benefits: [
      {
        type: String,
        trim: true,
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);
export default model("Membership", membershipSchema);
