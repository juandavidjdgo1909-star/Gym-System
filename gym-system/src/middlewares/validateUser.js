export const validateUser = (req, res, next) => {
  const { name, email, phone, document, password } = req.body;

  if (!name || !email || !phone || !document || !password) {
    return res.status(400).json({
      message: "Todos los campos son obligatorios",
    });
  }

  if (!email.includes("@")) {
    return res.status(400).json({
      message: "El correo electrónico no es válido",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 6 caracteres",
    });
  }
  next();
};
