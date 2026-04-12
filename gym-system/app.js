import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { errorHandler } from "./src/middlewares/errorHandler.js";

// Importar todas las rutas

import userRoutes from "./src/routes/userRoutes.js";
import membershipRoutes from "./src/routes/membershipRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import trainingSessionRoutes from "./src/routes/trainingSessionRoutes.js";
import trainerProfileRoutes from "./src/routes/trainerProfileRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use("/api/users", userRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/trainer-profiles", trainerProfileRoutes);

app.use(errorHandler);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message || "Error interno del servidor",
  });
});

export default app;
