import { Router } from "express";
import { EventoController } from "../controllers/evento.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", EventoController.getAll);
router.get("/:id", EventoController.getById);
router.post("/", authenticate, EventoController.create);
router.put("/:id", authenticate, EventoController.update);
router.delete("/:id", authenticate, EventoController.delete);

export default router;
