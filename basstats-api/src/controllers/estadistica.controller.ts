import type { Request, Response, NextFunction } from "express";
import { EstadisticaModel } from "../models/estadistica.model.js";

export class EstadisticaController {
  static async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await EstadisticaModel.getAll();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const stat = await EstadisticaModel.getById(id);
      res.status(200).json({ success: true, data: stat });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stat = await EstadisticaModel.create(req.body);
      res.status(201).json({
        success: true,
        message: "Estadística creada exitosamente",
        data: stat,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      const stat = await EstadisticaModel.update(id, req.body);
      res.status(200).json({
        success: true,
        message: "Estadística actualizada exitosamente",
        data: stat,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      await EstadisticaModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Estadística eliminada exitosamente",
      });
    } catch (error) {
      next(error);
    }
  }
}
