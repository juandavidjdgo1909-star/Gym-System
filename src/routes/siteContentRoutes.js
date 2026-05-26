import { Router } from "express";
import * as siteContentService from "../services/siteContentService.js";

const router = Router();

// Ruta publica para mostrar la informacion editable de la portada.
router.get("/", async (req, res) => {
  try {
    const content = await siteContentService.getSiteContent();
    res.status(200).json(content);
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener contenido publico",
      error: err.message,
    });
  }
});

// Ruta para actualizar la informacion visible en el inicio.
router.put("/", async (req, res) => {
  try {
    const content = await siteContentService.updateSiteContent(req.body);
    res.status(200).json(content);
  } catch (err) {
    res.status(400).json({
      message: "Error al actualizar contenido publico",
      error: err.message,
    });
  }
});

export default router;
