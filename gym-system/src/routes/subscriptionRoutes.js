import { Router } from "express";
import * as subscriptionService from "../services/subscriptionService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.status(200).json(subscriptions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener suscripciones", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(
      req.params.id,
    );
    res.status(200).json(subscription);
  } catch (err) {
    res.status(404).json({
      message: "Suscripción no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByUser(
      req.params.userId,
    );
    res.status(200).json(subscriptions);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener suscripciones del usuario",
      userId: req.params.userId,
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newSubscription = await subscriptionService.createSubscription(
      req.body,
    );
    res.status(201).json(newSubscription);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear suscripción", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedSubscription = await subscriptionService.updateSubscription(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedSubscription);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar suscripción", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await subscriptionService.deleteSubscription(req.params.id);
    res.status(200).json({
      message: "Suscripción eliminada correctamente",
      id: req.params.id,
    });
  } catch (err) {
    res.status(404).json({
      message: "Suscripción no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
