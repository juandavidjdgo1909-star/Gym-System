import Membership from "../models/membership.js";

export const getAllMemberships = async () => {
  return await Membership.find();
};

export const getMembershipById = async (id) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};

export const createMembership = async (membershipData) => {
  const membership = new Membership(membershipData);
  return await membership.save();
};

export const updateMembership = async (id, membershipData) => {
  const membership = await Membership.findById(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  Object.assign(membership, membershipData);
  return await membership.save();
};

export const deleteMembership = async (id) => {
  const membership = await Membership.findByIdAndDelete(id);
  if (!membership) {
    throw new Error("Membresía no encontrada");
  }
  return membership;
};
