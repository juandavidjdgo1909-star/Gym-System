import TrainingSession from "../models/trainingSession.js";
import { sendTrainingSessionEmail } from "./emailService.js";

const dateKey = (value) => (value ? new Date(value).toISOString() : "");

const notifySessionByEmail = async (type, session) => {
  try {
    await sendTrainingSessionEmail({ type, session });
  } catch (error) {
    console.warn(`No se pudo enviar correo de cita (${type}): ${error.message}`);
  }
};

// Obtiene todas las sesiones de entrenamiento.
export const getAllTrainingSessions = async () => {
  return await TrainingSession.find()
    .populate("trainer", "name email")
    .populate("member", "name email phone document trainerSheet");
};

// Busca una sesion de entrenamiento por su id.
export const getTrainingSessionById = async (id) => {
  const session = await TrainingSession.findById(id)
    .populate("trainer", "name email")
    .populate("member", "name email phone document trainerSheet");
  if (!session) {
    throw new Error("Sesión no encontrada");
  }
  return session;
};

// Obtiene las sesiones asignadas a un entrenador.
export const getSessionsByTrainer = async (trainerId) => {
  return await TrainingSession.find({ trainer: trainerId }).populate(
    "member",
    "name email phone document trainerSheet",
  );
};

// Obtiene las sesiones reservadas por un miembro.
export const getSessionsByMember = async (memberId) => {
  return await TrainingSession.find({ member: memberId }).populate(
    "trainer",
    "name email",
  );
};

// Crea una nueva solicitud o cita de entrenamiento.
export const createTrainingSession = async (sessionData) => {
  const session = new TrainingSession(sessionData);
  const newSession = await session.save();
  await newSession.populate("trainer", "name email");
  await newSession.populate("member", "name email");
  await notifySessionByEmail("created", newSession);
  return newSession;
};

// Actualiza estado, fecha o datos de una sesion.
export const updateTrainingSession = async (id, sessionData) => {
  const session = await TrainingSession.findById(id);
  if (!session) {
    throw new Error("Sesion no encontrada");
  }

  const previousStatus = session.status;
  const previousDate = dateKey(session.date);
  const previousHour = session.hour || "";

  Object.assign(session, sessionData);
  const updatedSession = await session.save();
  await updatedSession.populate("trainer", "name email");
  await updatedSession.populate("member", "name email");

  const statusChanged =
    sessionData.status && previousStatus !== updatedSession.status;
  const scheduleChanged =
    (sessionData.date && previousDate !== dateKey(updatedSession.date)) ||
    (Object.hasOwn(sessionData, "hour") &&
      previousHour !== (updatedSession.hour || ""));

  if (statusChanged && updatedSession.status === "Confirmada") {
    await notifySessionByEmail("confirmed", updatedSession);
  } else if (statusChanged && updatedSession.status === "Cancelada") {
    await notifySessionByEmail("cancelled", updatedSession);
  } else if (scheduleChanged) {
    await notifySessionByEmail("rescheduled", updatedSession);
  }

  return updatedSession;
};

// Elimina una sesion de entrenamiento.
export const deleteTrainingSession = async (id) => {
  const session = await TrainingSession.findByIdAndDelete(id);
  if (!session) {
    throw new Error("Sesión no encontrada");
  }
  return session;
};
