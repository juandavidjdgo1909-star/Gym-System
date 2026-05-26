import TrainerProfile from "../models/trainerProfile.js";

// Obtiene todos los perfiles de entrenadores.
export const getAllTrainerProfiles = async () => {
  return await TrainerProfile.find().populate("user", "name email phone");
};

// Busca un perfil de entrenador por su id.
export const getTrainerProfileById = async (id) => {
  const profile = await TrainerProfile.findById(id).populate(
    "user",
    "name email phone",
  );
  if (!profile) {
    throw new Error("Perfil no encontrado");
  }
  return profile;
};

// Busca el perfil usando el id del usuario entrenador.
export const getTrainerProfileByUserId = async (userId) => {
  const profile = await TrainerProfile.findOne({ user: userId }).populate(
    "user",
    "name email phone",
  );
  if (!profile) {
    throw new Error("Perfil no encontrado");
  }
  return profile;
};

// Crea el perfil profesional de un entrenador.
export const createTrainerProfile = async (profileData) => {
  const profile = new TrainerProfile(profileData);
  const newProfile = await profile.save();
  await newProfile.populate("user", "name email phone");
  return newProfile;
};

// Actualiza el perfil de un entrenador.
export const updateTrainerProfile = async (id, profileData) => {
  const profile = await TrainerProfile.findById(id);
  if (!profile) {
    throw new Error("Perfil no encontrado");
  }
  Object.assign(profile, profileData);
  const updatedProfile = await profile.save();
  await updatedProfile.populate("user", "name email phone");
  return updatedProfile;
};

// Elimina el perfil de un entrenador.
export const deleteTrainerProfile = async (id) => {
  const profile = await TrainerProfile.findByIdAndDelete(id);
  if (!profile) {
    throw new Error("Perfil no encontrado");
  }
  return profile;
};
