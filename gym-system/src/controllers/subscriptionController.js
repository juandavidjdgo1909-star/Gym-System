import Subscription from "../models/subscription.js";
import Membership from "../models/membership.js";

export const getSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const subscriptions = await Subscription.find(query)
      .populate("user", "name email")
      .populate("membership", "name durationInDays price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: subscriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findById(id)
      .populate("user", "name email")
      .populate("membership", "name durationInDays");

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "Suscripción no encontrada" });
    }
    res.status(200).json({
      status: "success",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const { user, membership, startDate } = req.body;

    const membershipData = await Membership.findById(membership);

    if (!membershipData) {
      return res
        .status(404)
        .json({ status: "error", message: "Membresía no encontrada" });
    }

    const start = new Date(start);
    const end = new Date(start);

    end.setDate(end.getDate() + membershipData.durationInDays);

    const subscription = await Subscription.create({
      user,
      membership,
      startDate: start,
      endDate: end,
      status: "Activa",
    });

    res.status(201).json({
      status: "success",
      data: subscription,
      message: "Suscripción creada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "Suscripción no encontrada" });
    }
    res.status(200).json({
      status: "success",
      data: subscription,
      message: "Suscripción actualizada con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res
        .status(404)
        .json({ status: "error", message: "Suscripción no encontrada" });
    }
    res.status(200).json({
      status: "success",
      message: "Suscripción eliminada con éxito",
    });
  } catch (error) {
    next(error);
  }
};
