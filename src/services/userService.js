import User from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "node:crypto";

// Quita la contrasena antes de enviar el usuario al frontend.
const toPublicUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  const { password, ...publicUser } = userObject;
  return publicUser;
};

// Encripta la contrasena si todavia no esta encriptada.
const maybeHashPassword = async (password) => {
  if (!password) return password;
  if (password.startsWith("$2a$") || password.startsWith("$2b$")) {
    return password;
  }
  return bcrypt.hash(password, 10);
};

// Evita correos, telefonos o documentos repetidos.
const assertUniqueUserFields = async (userData, ignoredUserId = null) => {
  const filters = ["email", "phone", "document"]
    .filter((field) => userData[field])
    .map((field) => ({ [field]: userData[field] }));

  if (!filters.length) return;

  const query = { $or: filters };
  if (ignoredUserId) {
    query._id = { $ne: ignoredUserId };
  }

  const existingUser = await User.findOne(query).select("email phone document");
  if (!existingUser) return;

  const error = new Error(
    "Estos datos ya estan en el sistema. Revisa correo, telefono o documento.",
  );
  error.statusCode = 409;
  throw error;
};

// Obtiene todos los usuarios sin mostrar contrasenas.
export const getAllUsers = async () => {
  return await User.find().select("-password");
};

// Busca un usuario por su id.
export const getUserById = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};

// Crea un usuario nuevo y protege su contrasena.
export const createUser = async (userData) => {
  await assertUniqueUserFields(userData);
  const user = new User({
    ...userData,
    password: await maybeHashPassword(userData.password),
  });
  const savedUser = await user.save();
  return toPublicUser(savedUser);
};

// Actualiza los datos de un usuario existente.
export const updateUser = async (id, userData) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  await assertUniqueUserFields(userData, id);
  Object.assign(user, {
    ...userData,
    password: userData.password
      ? await maybeHashPassword(userData.password)
      : user.password,
  });
  const savedUser = await user.save();
  return toPublicUser(savedUser);
};

// Elimina un usuario por su id.
export const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }
  return user;
};

// Valida email y contrasena para iniciar sesion.
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Email o contraseña incorrectos");
  }

  const hashedPassword =
    user.password.startsWith("$2a$") || user.password.startsWith("$2b$");
  const passwordMatches = hashedPassword
    ? await bcrypt.compare(password, user.password)
    : user.password === password;

  if (!passwordMatches) {
    throw new Error("Email o contraseña incorrectos");
  }

  if (!hashedPassword) {
    user.password = await maybeHashPassword(password);
    await user.save();
  }

  return toPublicUser(user);
};

// Crea o vincula un usuario que inicio sesion con Google.
export const loginWithGoogle = async (profile) => {
  const googleId = profile.sub;
  const email = String(profile.email || "").toLowerCase();
  const name = profile.name || profile.given_name || email.split("@")[0];

  if (!googleId || !email) {
    throw new Error("Google no envio los datos necesarios para iniciar sesion.");
  }

  let user =
    (await User.findOne({ googleId })) || (await User.findOne({ email }));

  if (user) {
    user.googleId = user.googleId || googleId;
    user.authProvider = user.authProvider === "local" ? "local" : "google";
    user.avatarUrl = profile.picture || user.avatarUrl;
    if (!user.name && name) user.name = name;
    const savedUser = await user.save();
    return toPublicUser(savedUser);
  }

  user = new User({
    name,
    email,
    phone: `google-${googleId}`,
    document: `google-${googleId}`,
    password: await maybeHashPassword(crypto.randomBytes(24).toString("hex")),
    googleId,
    authProvider: "google",
    avatarUrl: profile.picture || "",
    rol: "Miembro",
  });

  const savedUser = await user.save();
  return toPublicUser(savedUser);
};
