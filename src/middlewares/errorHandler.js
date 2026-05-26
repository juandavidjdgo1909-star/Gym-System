// Responde errores generales del servidor en formato JSON.
export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const isDuplicate = err?.code === 11000 || err?.statusCode === 409;
  const message = isDuplicate
    ? "Estos datos ya estan en el sistema. Revisa correo, telefono o documento."
    : err.message || "Error interno del servidor";

  res.status(isDuplicate ? 409 : err.statusCode || 500).json({
    status: "error",
    message,
    error: message,
  });
};
