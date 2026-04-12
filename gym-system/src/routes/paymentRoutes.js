import { Router } from "express";
import * as paymentService from "../services/paymentService.js";

const router = Router();

// GET - Obtener todos los pagos
router.get("/", async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json(payments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener los pagos", error: err.message });
  }
});

// GET - Obtener un pago por ID
router.get("/:id", async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    res.status(200).json(payment);
  } catch (err) {
    res.status(404).json({
      message: "Pago no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

// GET - Obtener pagos por usuario
router.get("/user/:userId", async (req, res) => {
  try {
    const payments = await paymentService.getPaymentsByUser(req.params.userId);
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener pagos del usuario",
      userId: req.params.userId,
      error: err.message,
    });
  }
});

// POST - Crear un nuevo pago
router.post("/", async (req, res) => {
  try {
    const newPayment = await paymentService.createPayment(req.body);
    res.status(201).json(newPayment);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear el pago", error: err.message });
  }
});

// PUT - Actualizar un pago
router.put("/:id", async (req, res) => {
  try {
    const updatedPayment = await paymentService.updatePayment(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedPayment);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar el pago", error: err.message });
  }
});

// DELETE - Eliminar un pago
router.delete("/:id", async (req, res) => {
  try {
    await paymentService.deletePayment(req.params.id);
    res
      .status(200)
      .json({ message: "Pago eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(404).json({
      message: "Pago no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
