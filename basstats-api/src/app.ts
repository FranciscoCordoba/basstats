import express, { type Application } from "express";
import cors from "cors";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";

const createApp = (): Application => {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Endpoint de bienvenida principal
  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "BasStats REST API MVC",
      version: "2.0.0",
      status: "online",
      docs: "/api/health",
    });
  });

  // Rutas de la API
  app.use("/api", apiRouter);

  // Manejador de rutas no encontradas (404)
  app.use(notFoundHandler);

  // Manejador global de errores
  app.use(errorHandler);

  return app;
};

export const app = createApp();
