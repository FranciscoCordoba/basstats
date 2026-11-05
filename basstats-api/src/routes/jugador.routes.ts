import { Router } from "express";
import { JugadorController } from "../controllers/jugador.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", JugadorController.getAll);
router.get("/search", JugadorController.search);
router.get("/:id", JugadorController.getById);
router.get("/:id/stats", JugadorController.getStats);
router.post("/", authenticate, JugadorController.create);
router.post("/:id/foto", authenticate, upload.single("foto"), JugadorController.uploadFoto);
router.put("/:id", authenticate, JugadorController.update);
router.delete("/:id", authenticate, JugadorController.delete);

export default router;
