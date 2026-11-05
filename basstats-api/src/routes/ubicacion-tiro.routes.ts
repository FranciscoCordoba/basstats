import { Router } from "express";
import { UbicacionTiroController } from "../controllers/ubicacion-tiro.controller.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
  createUbicacionTiroSchema,
  updateUbicacionTiroSchema,
  ubicacionTiroIdParamSchema,
} from "../models/ubicacion-tiro.model.js";

const router = Router();

router.get("/", UbicacionTiroController.getAll);

router.get(
  "/:id",
  validateRequest({ params: ubicacionTiroIdParamSchema }),
  UbicacionTiroController.getById
);

router.post(
  "/",
  validateRequest({ body: createUbicacionTiroSchema }),
  UbicacionTiroController.create
);

router.patch(
  "/:id",
  validateRequest({
    params: ubicacionTiroIdParamSchema,
    body: updateUbicacionTiroSchema,
  }),
  UbicacionTiroController.update
);

router.delete(
  "/:id",
  validateRequest({ params: ubicacionTiroIdParamSchema }),
  UbicacionTiroController.delete
);

export const ubicacionTiroRoutes = router;
export default router;
