import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import User from "./src/models/user.js";

const adminSeed = {
  name: "Juan David",
  email: "admin@prueba.com",
  phone: "3000000000",
  document: "1111111111",
  password: "123456",
  rol: "Admin",
  isActive: true,
};

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta la variable MONGO_URI en el archivo .env");
    }

    await connectDB();

    const hashedPassword = await bcrypt.hash(adminSeed.password, 10);

    const existingAdmin = await User.findOne({ email: adminSeed.email });

    if (existingAdmin) {
      existingAdmin.name = adminSeed.name;
      existingAdmin.phone = adminSeed.phone;
      existingAdmin.document = adminSeed.document;
      existingAdmin.password = hashedPassword;
      existingAdmin.rol = adminSeed.rol;
      existingAdmin.isActive = adminSeed.isActive;

      await existingAdmin.save();

      console.log("Admin actualizado correctamente.");
      return;
    }

    await User.create({
      ...adminSeed,
      password: hashedPassword,
    });

    console.log("Admin creado correctamente.");
  } catch (error) {
    console.error("Error ejecutando seed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
