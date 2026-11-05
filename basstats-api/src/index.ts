import "dotenv/config";
import { app } from "./app.js";
import { queryClient } from "./config/database.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Cierre controlado del servidor (Graceful shutdown)
const gracefulShutdown = async (signal: string) => {
  console.log(`\nSeñal ${signal} recibida. Cerrando el servidor de forma controlada...`);

  server.close(async () => {
    console.log("Servidor HTTP cerrado.");
    try {
      await queryClient.end();
      console.log("Conexión con la base de datos cerrada.");
    } catch (err) {
      console.error("Error al cerrar la conexión con la base de datos:", err);
    } finally {
      process.exit(0);
    }
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
