import TrainerProfile from "../models/trainerProfile.js";

export const getTrainers = async (req, res, next) => {
  try {
    const trainers = await TrainerProfile.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: trainers,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trainer = await TrainerProfile.findById(id).populate(
      "user",
      "name email",
    );

    if (!trainer) {
      return res
        .status(404)
        .json({ status: "error", message: "Entrenador no encontrado" });
    }
    res.status(200).json({
      status: "success",
      data: trainer,
    });
  } catch (error) {
    next(error);
  }
};

export const createTrainer = async (req, res, next) => {
  try {
    const { user, specialty } = req.body;

    const trainer = await TrainerProfile.create({
      user,
      specialty,
    });

    res.status(201).json({
      status: "success",
      data: trainer,
      message: "Entrenador creado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trainer = await TrainerProfile.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!trainer) {
      return res
        .status(404)
        .json({ status: "error", message: "Entrenador no encontrado" });
    }

    res.status(200).json({
      status: "success",
      data: trainer,
      message: "Entrenador actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trainer = await TrainerProfile.findByIdAndDelete(id);

    if (!trainer) {
      return res
        .status(404)
        .json({ status: "error", message: "Entrenador no encontrado" });
    }

    res
      .status(200)
      .json({
        status: "success",
        data: trainer,
        message: "Entrenador eliminado con éxito",
      });
  } catch (error) {
    next(error);
  }
};
