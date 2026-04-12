import TrainingSession from "../models/trainingSession.js";

export const getSessions = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const sessions = await TrainingSession.find(query)
      .populate("trainer", "name email")
      .populate("member", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      status: "success",
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await TrainingSession.findById(id)
      .populate("trainer", "name email")
      .populate("member", "name email");

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Sesión no encontrada",
      });
    }

    res.status(200).json({
      status: "success",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { trainer, member, date, hour } = req.body;

    const session = await TrainingSession.create({
      trainer,
      member,
      date,
      hour,
      status: "Pendiente",
    });

    res.status(201).json({
      status: "success",
      data: session,
      message: "Sesión creada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await TrainingSession.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Sesión no encontrada",
      });
    }

    res.status(200).json({
      status: "success",
      data: session,
      message: "Sesión actualizada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await TrainingSession.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Sesión no encontrada",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Sesión eliminada con éxito",
    });
  } catch (error) {
    next(error);
  }
};
