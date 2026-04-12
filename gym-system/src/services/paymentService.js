import Payment from "../models/payment.js";

// Obtener todos los pagos
export const getAllPayments = async () => {
  return await Payment.find()
    .populate("user", "name email")
    .populate("membership", "name price");
};

// Obtener un pago por ID
export const getPaymentById = async (id) => {
  const payment = await Payment.findById(id)
    .populate("user", "name email")
    .populate("membership", "name price");
  if (!payment) {
    throw new Error("Pago no encontrado");
  }
  return payment;
};

// Obtener pagos por usuario
export const getPaymentsByUser = async (userId) => {
  return await Payment.find({ user: userId }).populate(
    "membership",
    "name price",
  );
};

// Crear un nuevo pago
export const createPayment = async (paymentData) => {
  const payment = new Payment(paymentData);
  const newPayment = await payment.save();
  await newPayment.populate("user", "name email");
  await newPayment.populate("membership", "name price");
  return newPayment;
};

// Actualizar un pago
export const updatePayment = async (id, paymentData) => {
  const payment = await Payment.findById(id);
  if (!payment) {
    throw new Error("Pago no encontrado");
  }
  Object.assign(payment, paymentData);
  const updatedPayment = await payment.save();
  await updatedPayment.populate("user", "name email");
  await updatedPayment.populate("membership", "name price");
  return updatedPayment;
};

// Eliminar un pago
export const deletePayment = async (id) => {
  const payment = await Payment.findByIdAndDelete(id);
  if (!payment) {
    throw new Error("Pago no encontrado");
  }
  return payment;
};
