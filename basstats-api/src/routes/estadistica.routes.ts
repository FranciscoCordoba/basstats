import { Router } from "express";
import { EstadisticaController } from "../controllers/estadistica.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", EstadisticaController.getAll);
router.get("/:id", EstadisticaController.getById);
router.post("/", authenticate, requireRole(["Administrador"]), EstadisticaController.create);
router.put("/:id", authenticate, requireRole(["Administrador"]), EstadisticaController.update);
router.delete("/:id", authenticate, requireRole(["Administrador"]), EstadisticaController.delete);

export default router;
