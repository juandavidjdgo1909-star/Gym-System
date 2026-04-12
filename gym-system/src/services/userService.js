import User from "../models/user.js";

// Obtener todos los usuarios
export const getAllUsers = async () => {
  return await User.find().select("-password");
};

// Obtener un usuario por ID
export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

// Actualizar un usuario
export const updateUser = async (id, userData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  Object.assign(user, userData);
  return await user.save();
};

// Eliminar un usuario
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};
