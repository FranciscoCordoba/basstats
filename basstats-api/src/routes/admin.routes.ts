import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticate, requireRole } from "../middlewares/auth.middleware.js";

const router = Router();

// Todas las rutas de administración requieren autenticación y rol de Administrador
router.use(authenticate, requireRole(["Administrador"]));

router.get("/usuarios", AdminController.getUsers);
router.patch("/usuarios/:id/rol", AdminController.changeUserRole);
router.delete("/usuarios/:id", AdminController.deleteUser);
router.get("/audit", AdminController.getAuditStats);

export default router;
