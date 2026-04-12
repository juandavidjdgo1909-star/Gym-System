export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permisos.",
      });
    }
    next();
  };
};
