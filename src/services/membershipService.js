import Membership from "../models/membership.js";

// Obtiene todos los planes de membresia.
export const getAllMemberships = async () => {
  return await Membership.find();
};

// Busca una membresia por su id.
export const getMembershipById = async (id) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};

// Crea un nuevo plan de membresia.
export const createMembership = async (membershipData) => {
  const membership = new Membership(membershipData);
  return await membership.save();
};

// Actualiza un plan de membresia existente.
export const updateMembership = async (id, membershipData) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  Object.assign(membership, membershipData);
  return await membership.save();
};

// Elimina una membresia por su id.
export const deleteMembership = async (id) => {
  const membership = await Membership.findByIdAndDelete(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};
