import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["Tarjeta", "Transferencia", "Efectivo", "Wompi", "Mercado Pago"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pendiente", "Pagado", "Cancelado"],
      default: "Pendiente",
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    providerReference: {
      type: String,
      trim: true,
    },
    checkoutUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

export default model("Payment", paymentSchema);
