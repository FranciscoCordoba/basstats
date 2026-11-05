import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import usuarioRoutes from "./usuario.routes.js";
import jugadorRoutes from "./jugador.routes.js";
import partidoRoutes from "./partido.routes.js";
import estadisticaRoutes from "./estadistica.routes.js";
import eventoRoutes from "./evento.routes.js";
import ubicacionTiroRoutes from "./ubicacion-tiro.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/usuarios", usuarioRoutes);
router.use("/jugadores", jugadorRoutes);
router.use("/partidos", partidoRoutes);
router.use("/estadisticas", estadisticaRoutes);
router.use("/eventos", eventoRoutes);
router.use("/ubicacion-tiros", ubicacionTiroRoutes);

export default router;
