import Subscription from "../models/subscription.js";

export const getAllSubscriptions = async () => {
  return await Subscription.find()
    .populate("user", "name email")
    .populate("membership", "name durationInDays price");
};

export const getSubscriptionById = async (id) => {
  const subscription = await Subscription.findById(id)
    .populate("user", "name email")
    .populate("membership", "name durationInDays price");
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }
  return subscription;
};

export const getSubscriptionsByUser = async (userId) => {
  return await Subscription.find({ user: userId }).populate(
    "membership",
    "name durationInDays price",
  );
};

export const createSubscription = async (subscriptionData) => {
  const subscription = new Subscription(subscriptionData);
  const newSubscription = await subscription.save();
  await newSubscription.populate("user", "name email");
  await newSubscription.populate("membership", "name durationInDays price");
  return newSubscription;
};

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

export const deleteSubscription = async (id) => {
  const subscription = await Subscription.findByIdAndDelete(id);
  if (!subscription) {
    throw new Error("Suscripción no encontrada");
  }
  return subscription;
};
