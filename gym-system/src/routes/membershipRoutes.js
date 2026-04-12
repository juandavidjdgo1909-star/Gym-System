import { Router } from "express";
import * as membershipService from "../services/membershipService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const memberships = await membershipService.getAllMemberships();
    res.status(200).json(memberships);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener membresías", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const membership = await membershipService.getMembershipById(req.params.id);
    res.status(200).json(membership);
  } catch (err) {
    res.status(404).json({
      message: "Membresía no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newMembership = await membershipService.createMembership(req.body);
    res.status(201).json(newMembership);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear membresía", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedMembership = await membershipService.updateMembership(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedMembership);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar membresía", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await membershipService.deleteMembership(req.params.id);
    res.status(200).json({
      message: "Membresía eliminada correctamente",
      id: req.params.id,
    });
  } catch (err) {
    res.status(404).json({
      message: "Membresía no encontrada",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
