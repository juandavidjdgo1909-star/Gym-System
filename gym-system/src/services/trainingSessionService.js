import TrainingSession from "../models/trainingSession.js";

export const getAllTrainingSessions = async () => {
  return await TrainingSession.find()
    .populate("trainer", "name email")
    .populate("member", "name email");
};

export const getTrainingSessionById = async (id) => {
  const session = await TrainingSession.findById(id)
    .populate("trainer", "name email")
    .populate("member", "name email");
  if (!session) {
    throw new Error("Sesión no encontrada");
  }
  return session;
};

export const getSessionsByTrainer = async (trainerId) => {
  return await TrainingSession.find({ trainer: trainerId }).populate(
    "member",
    "name email",
  );
};

export const getSessionsByMember = async (memberId) => {
  return await TrainingSession.find({ member: memberId }).populate(
    "trainer",
    "name email",
  );
};

export const createTrainingSession = async (sessionData) => {
  const session = new TrainingSession(sessionData);
  const newSession = await session.save();
  await newSession.populate("trainer", "name email");
  await newSession.populate("member", "name email");
  return newSession;
};

export const updateTrainingSession = async (id, sessionData) => {
  const session = await TrainingSession.findById(id);
  if (!session) {
    throw new Error("Sesión no encontrada");
  }
  Object.assign(session, sessionData);
  const updatedSession = await session.save();
  await updatedSession.populate("trainer", "name email");
  await updatedSession.populate("member", "name email");
  return updatedSession;
};

export const deleteTrainingSession = async (id) => {
  const session = await TrainingSession.findByIdAndDelete(id);
  if (!session) {
    throw new Error("Sesión no encontrada");
  }
  return session;
};
