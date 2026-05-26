import { Membership } from "../models/membership.js";

// Lista membresias desde el controlador.
export const getMemberships = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { price: { $regex: search, $options: "i" } },
        ],
      };
    }

    const memberships = await Membership.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
};

// Consulta una membresia por id desde el controlador.
export const getMembershipById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findById(id);

    if (!membership) {
      return res
        .status(404)
        .json({ status: "error", message: "Membresia no encontrada" });
    }
    res.status(200).json({
      status: "success",
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// Crea una membresia desde el controlador.
export const createMembership = async (req, res, next) => {
  try {
    const { name, durationInDays, category, price, benefits, description } =
      req.body;

    const membership = await Membership.create({
      name,
      durationInDays,
      category,
      price,
      benefits,
      description,
    });

    res.status(201).json({
      status: "success",
      data: membership,
      message: "Membresia creada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

// Actualiza una membresia desde el controlador.
export const updateMembership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!membership) {
      return res
        .status(404)
        .json({ status: "error", message: "Membresia no encontrada" });
    }
    res.status(200).json({
      status: "success",
      data: membership,
      message: "Membresia actualizada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

// Elimina una membresia desde el controlador.
export const deleteMembership = async (req, res, next) => {
  try {
    const { id } = req.params;

    const membership = await Membership.findByIdAndDelete(id);

    if (!membership) {
      return res
        .status(404)
        .json({ status: "error", message: "Membresia no encontrada" });
    }
    res.status(200).json({
      status: "success",
      message: "Membresia eliminada con éxito",
    });
  } catch (error) {
    next(error);
  }
};
