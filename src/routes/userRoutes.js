import { Router } from "express";
import crypto from "node:crypto";
import * as userService from "../services/userService.js";

const router = Router();
const duplicatedUserMessage =
  "Estos datos ya estan en el sistema. Revisa correo, telefono o documento.";
const googleStateCookie = "gym_google_oauth_state";
const googleScopes = ["openid", "email", "profile"];

const getBaseUrl = (req) =>
  process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;

const getGoogleCallbackUrl = (req) =>
  process.env.GOOGLE_CALLBACK_URL ||
  `${req.protocol}://${req.get("host")}/api/users/auth/google/callback`;

const getCookie = (req, name) => {
  const cookies = req.headers.cookie || "";
  return cookies
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
};

const redirectWithAuthError = (req, res, message) => {
  res.redirect(`${getBaseUrl(req)}/?authError=${encodeURIComponent(message)}`);
};

const dashboardRouteFor = (user) => {
  if (user?.rol === "Admin") return "/dashboardAdmin.html";
  if (user?.rol === "Entrenador") return "/dashboardTrainer.html";
  return "/dashboardMember.html";
};

const sendGoogleLoginPage = (req, res, user) => {
  const baseUrl = getBaseUrl(req);
  const route = `${baseUrl}${dashboardRouteFor(user)}`;
  const safeUser = JSON.stringify(user).replace(/</g, "\\u003c");
  const safeRoute = JSON.stringify(route);

  res.type("html").send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Acceso con Google | Gym-System</title>
  </head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#020617;color:white;font-family:Arial,sans-serif">
    <p>Iniciando sesion con Google...</p>
    <script>
      const user = ${safeUser};
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      window.location.replace(${safeRoute});
    </script>
  </body>
</html>`);
};

const exchangeGoogleCode = async (req, code) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: getGoogleCallbackUrl(req),
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await response.json();
  if (!response.ok) {
    throw new Error(tokenData.error_description || "Google no autorizo el acceso.");
  }

  return tokenData;
};

const getGoogleProfile = async (accessToken) => {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const profile = await response.json();
  if (!response.ok) {
    throw new Error(profile.error_description || "No se pudo leer el perfil de Google.");
  }

  if (!profile.email_verified) {
    throw new Error("Tu correo de Google no esta verificado.");
  }

  return profile;
};

// Traduce errores de duplicados a un mensaje entendible.
const userErrorResponse = (err, fallbackMessage) => {
  const isDuplicate = err?.code === 11000 || err?.statusCode === 409;
  const message = isDuplicate ? duplicatedUserMessage : fallbackMessage;
  return {
    statusCode: isDuplicate ? 409 : err?.statusCode || 400,
    body: {
      message,
      error: isDuplicate ? duplicatedUserMessage : err.message,
    },
  };
};

// Ruta para listar todos los usuarios.
router.get("/", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener usuarios", error: err.message });
  }
});

// Ruta para iniciar sesion.
router.post("/login", async (req, res) => {
  try {
    const user = await userService.loginUser(req.body);
    res.status(200).json(user);
  } catch (err) {
    res
      .status(401)
      .json({ message: "Error al iniciar sesión", error: err.message });
  }
});

// Redirige al consentimiento de Google.
router.get("/auth/google", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return redirectWithAuthError(
      req,
      res,
      "Faltan GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el archivo .env.",
    );
  }

  const state = crypto.randomBytes(24).toString("hex");
  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.search = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleCallbackUrl(req),
    response_type: "code",
    scope: googleScopes.join(" "),
    state,
    prompt: "select_account",
  }).toString();

  res.cookie(googleStateCookie, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60 * 1000,
  });

  res.redirect(authUrl.toString());
});

// Recibe el callback de Google y crea o vincula el usuario.
router.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    const storedState = getCookie(req, googleStateCookie);
    res.clearCookie(googleStateCookie);

    if (!code || !state || !storedState || state !== storedState) {
      return redirectWithAuthError(req, res, "No se pudo validar la sesion de Google.");
    }

    const tokens = await exchangeGoogleCode(req, code);
    const profile = await getGoogleProfile(tokens.access_token);
    const user = await userService.loginWithGoogle(profile);
    sendGoogleLoginPage(req, res, user);
  } catch (err) {
    redirectWithAuthError(req, res, err.message || "Error al iniciar sesion con Google.");
  }
});

// Ruta para consultar un usuario por id.
router.get("/:id", async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({
      message: "Usuario no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

// Ruta para crear un usuario.
router.post("/", async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    const response = userErrorResponse(err, "Error al crear usuario");
    res.status(response.statusCode).json(response.body);
  }
});

// Ruta para actualizar un usuario.
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(200).json(updatedUser);
  } catch (err) {
    const response = userErrorResponse(err, "Error al actualizar usuario");
    res.status(response.statusCode).json(response.body);
  }
});

// Ruta para eliminar un usuario.
router.delete("/:id", async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res
      .status(200)
      .json({ message: "Usuario eliminado correctamente", id: req.params.id });
  } catch (err) {
    res.status(404).json({
      message: "Usuario no encontrado",
      id: req.params.id,
      error: err.message,
    });
  }
});

export default router;
