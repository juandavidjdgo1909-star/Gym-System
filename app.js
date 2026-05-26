import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "./src/middlewares/errorHandler.js";

// Importar todas las rutas

import userRoutes from "./src/routes/userRoutes.js";
import membershipRoutes from "./src/routes/membershipRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import subscriptionRoutes from "./src/routes/subscriptionRoutes.js";
import trainingSessionRoutes from "./src/routes/trainingSessionRoutes.js";
import trainerProfileRoutes from "./src/routes/trainerProfileRoutes.js";
import siteContentRoutes from "./src/routes/siteContentRoutes.js";
import routineExerciseRoutes from "./src/routes/routineExerciseRoutes.js";
import memberRoutineRoutes from "./src/routes/memberRoutineRoutes.js";
import attendanceRoutes from "./src/routes/attendanceRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import progressEntryRoutes from "./src/routes/progressEntryRoutes.js";
import trainerMessageRoutes from "./src/routes/trainerMessageRoutes.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

// Verifica que el backend este activo.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "offline",
    service: "gym-system",
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use("/api", (req, res, next) => {
  if (req.path === "/health" || mongoose.connection.readyState === 1) {
    return next();
  }

  return res.status(503).json({
    status: "error",
    message: "Base de datos no configurada. Agrega MONGO_URI en el archivo .env.",
  });
});

app.use("/api/users", userRoutes);
app.use("/api/memberships", membershipRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/training-sessions", trainingSessionRoutes);
app.use("/api/trainer-profiles", trainerProfileRoutes);
app.use("/api/site-content", siteContentRoutes);
app.use("/api/routine-exercises", routineExerciseRoutes);
app.use("/api/member-routines", memberRoutineRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/progress", progressEntryRoutes);
app.use("/api/trainer-messages", trainerMessageRoutes);

app.use(errorHandler);

// Maneja errores finales que no fueron respondidos antes.
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
