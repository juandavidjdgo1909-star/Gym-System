import { Router } from "express";
import * as userService from "../services/userService.js";

const router = Router();
const duplicatedUserMessage =
  "Estos datos ya estan en el sistema. Revisa correo, telefono o documento.";

// Traduce errores de duplicados a un mensaje entendible.
const userErrorResponse = (err, fallbackMessage) => {
  const isDuplicate = err?.code === 11000 || err?.statusCode === 409;
  const message = isDuplicate ? duplicatedUserMessage : fallbackMessage;
  return {
    statusCode: isDuplicate ? 409 : err?.statusCode || 400,
    body: {
      message,
      error: isDuplicate ? duplicatedUserMessage : err.message,
    },
  };
};

// Ruta para listar todos los usuarios.
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

// Ruta para iniciar sesion.
router.post("/login", async (req, res) => {
  try {
    const user = await userService.loginUser(req.body);
    res.status(200).json(user);
  } catch (err) {
    res
      .status(401)
      .json({ message: "Error al iniciar sesión", error: err.message });
  }
});

// Ruta para consultar un usuario por id.
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

// Ruta para crear un usuario.
router.post("/", async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    const response = userErrorResponse(err, "Error al crear usuario");
    res.status(response.statusCode).json(response.body);
  }
});

// Ruta para actualizar un usuario.
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (err) {
    const response = userErrorResponse(err, "Error al actualizar usuario");
    res.status(response.statusCode).json(response.body);
  }
});

// Ruta para eliminar un usuario.
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
