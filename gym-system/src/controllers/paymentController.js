import Payment from "../models/payment";

export const getPayments = async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate("user", "name email")
      .populate("membership", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("user", "name email")
      .populate("membership", "name price");

    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Pago no encontrado" });
    }

    res.status(200).json({
      status: "success",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = async (req, res, next) => {
  try {
    const { user, membership, amount, method, paymentDate } = req.body;

    const payment = await Payment.create({
      user,
      membership,
      amount,
      method,
      paymentDate,
      status: "Pago registrado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Pago no encontrado" });
    }
    res.status(200).json({
      status: "success",
      data: payment,
      message: "Pago actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res
        .status(404)
        .json({ status: "error", message: "Pago no encontrado" });
    }

    res.status(200).json({
      status: "success",
      message: "Pago eliminado con éxito",
    });
  } catch (error) {
    next(error);
  }
};
