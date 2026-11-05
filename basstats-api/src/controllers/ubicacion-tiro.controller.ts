import type { Request, Response, NextFunction } from "express";
import { UbicacionTiroModel } from "../models/ubicacion-tiro.model.js";

export class UbicacionTiroController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idEvento = req.query.idEvento ? Number(req.query.idEvento) : undefined;
      const tiros = await UbicacionTiroModel.getAll(idEvento);
      res.status(200).json({ success: true, data: tiros });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const tiro = await UbicacionTiroModel.getById(id);
      res.status(200).json({ success: true, data: tiro });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tiro = await UbicacionTiroModel.create(req.body);
      res.status(201).json({
        success: true,
        message: "Ubicación de tiro registrada exitosamente",
        data: tiro,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const tiro = await UbicacionTiroModel.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "Ubicación de tiro actualizada exitosamente",
        data: tiro,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await UbicacionTiroModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Ubicación de tiro eliminada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
}
