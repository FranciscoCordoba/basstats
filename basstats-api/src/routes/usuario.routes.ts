import { Router } from "express";
import { UsuarioController } from "../controllers/usuario.controller.js";

const router = Router();

router.get("/search", UsuarioController.search);
router.get("/:id", UsuarioController.getById);

export default router;
