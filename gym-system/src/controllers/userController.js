import User from "../models/user";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { document: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { nombre, email, phone, document, password, rol } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ status: "error", message: "Email ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone,
      document,
      password: hashedPassword,
      rol,
    });

    const { password: _, ...userData } = user._toObject();
    res.status(201).json({
      status: "success",
      data: userData,
      message: "Usuario creado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, document, password } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (document) updateData.document = document;
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Usuario no encontrado" });
    }
    res.status(200).json({
      status: "success",
      data: userData,
      message: "Usuario actualizado con éxito",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        status: "error",
        message: "No puedes eliminar tu propio usuario",
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Usuario no encontrado" });
    }

    res
      .status(200)
      .json({ status: "success", message: "Usuario eliminado con éxito" });
  } catch (error) {
    next(error);
  }
};
