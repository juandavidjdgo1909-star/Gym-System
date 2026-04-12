import { Schema, model } from "mongoose";

const trainerProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialty: {
    type: String,
    trim: true,
  },
});
export default model("TrainerProfile", trainerProfileSchema);
