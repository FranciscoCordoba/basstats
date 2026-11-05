import { Router } from "express";
import { PartidoController } from "../controllers/partido.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", PartidoController.getAll);
router.get("/:id", PartidoController.getById);
router.get("/:id/details", PartidoController.getFullDetails);
router.post("/", authenticate, PartidoController.create);
router.put("/:id", authenticate, PartidoController.update);
router.delete("/:id", authenticate, PartidoController.delete);

export default router;
