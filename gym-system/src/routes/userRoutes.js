import { Router } from "express";
import * as userService from "../services/userService.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({
      message: "Usuario no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear usuario", error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al actualizar usuario", error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res
      .status(200)
      .json({ message: "Usuario eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(404).json({
      message: "Usuario no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
