import Membership from "../models/membership.js";

// Obtener todas las membresías
export const getAllMemberships = async () => {
  return await Membership.find();
};

// Obtener una membresía por ID
export const getMembershipById = async (id) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};

// Crear una nueva membresía
export const createMembership = async (membershipData) => {
  const membership = new Membership(membershipData);
  return await membership.save();
};

// Actualizar una membresía
export const updateMembership = async (id, membershipData) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  Object.assign(membership, membershipData);
  return await membership.save();
};

// Eliminar una membresía
export const deleteMembership = async (id) => {
  const membership = await Membership.findByIdAndDelete(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};
