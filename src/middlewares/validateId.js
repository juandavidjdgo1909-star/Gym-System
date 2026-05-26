import mongoose from "mongoose";

// Valida que el parametro id tenga formato correcto de MongoDB.
export const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      status: "error",
      message: "ID inválido",
    });
  }
  next();
};
