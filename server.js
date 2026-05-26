import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

// Inicia la base de datos y luego levanta el servidor Express.
const startServer = async () => {
  if (process.env.MONGO_URI) {
    try {
      await connectDB();
    } catch (error) {
      console.warn(
        `Servidor iniciado sin MongoDB. Las rutas /api devolveran error hasta corregir la conexion: ${error.message}`,
      );
    }
  } else {
    console.warn("Servidor iniciado sin MongoDB. Falta MONGO_URI en el archivo .env.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
  });
};

startServer();
