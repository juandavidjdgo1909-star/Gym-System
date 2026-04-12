import User from "../models/user.js";

export const getAllUsers = async () => {
  return await User.find().select("-password");
};

export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};

export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};

export const updateUser = async (id, userData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  Object.assign(user, userData);
  return await user.save();
};

export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};
