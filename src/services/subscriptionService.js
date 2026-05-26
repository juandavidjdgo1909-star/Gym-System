import Subscription from "../models/subscription.js";

// Obtiene todas las suscripciones con usuario y membresia.
export const getAllSubscriptions = async () => {
  return await Subscription.find()
    .populate("user", "name email")
    .populate("membership", "name durationInDays price");
};

// Busca una suscripcion por su id.
export const getSubscriptionById = async (id) => {
  const subscription = await Subscription.findById(id)
    .populate("user", "name email")
    .populate("membership", "name durationInDays price");
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }
  return subscription;
};

// Obtiene las suscripciones de un usuario.
export const getSubscriptionsByUser = async (userId) => {
  return await Subscription.find({ user: userId }).populate(
    "membership",
    "name durationInDays price",
  );
};

// Crea una nueva suscripcion de membresia.
export const createSubscription = async (subscriptionData) => {
  const activeSubscription = await Subscription.findOne({
    user: subscriptionData.user,
    status: "Activa",
    endDate: { $gte: new Date() },
  });
  if (activeSubscription) {
    throw new Error(
      "Ya tienes una membresia activa. Para comprar otra, primero cancela la membresia actual.",
    );
  }

  const subscription = new Subscription(subscriptionData);
  const newSubscription = await subscription.save();
  await newSubscription.populate("user", "name email");
  await newSubscription.populate("membership", "name durationInDays price");
  return newSubscription;
};

// Actualiza una suscripcion existente.
export const updateSubscription = async (id, subscriptionData) => {
  const subscription = await Subscription.findById(id);
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }
  Object.assign(subscription, subscriptionData);
  const updatedSubscription = await subscription.save();
  await updatedSubscription.populate("user", "name email");
  await updatedSubscription.populate("membership", "name durationInDays price");
  return updatedSubscription;
};

// Elimina una suscripcion por su id.
export const deleteSubscription = async (id) => {
  const subscription = await Subscription.findByIdAndDelete(id);
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }
  return subscription;
};
