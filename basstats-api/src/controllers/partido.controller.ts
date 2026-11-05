import { Request, Response, NextFunction } from "express";
import {
  PartidoModel,
  createPartidoSchema,
  updatePartidoSchema,
  partidoIdParamSchema,
} from "../models/partido.model.js";

export class PartidoController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const idEquipo = req.query.idEquipo ? parseInt(req.query.idEquipo as string, 10) : undefined;
      const search = req.query.search as string | undefined;

      const result = await PartidoModel.getAllPaginated(page, limit, idEquipo, search);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = partidoIdParamSchema.parse(req.params);
      const partido = await PartidoModel.getById(id);
      res.status(200).json({
        success: true,
        data: partido,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFullDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = partidoIdParamSchema.parse(req.params);
      const details = await PartidoModel.getFullGameDetails(id);
      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createPartidoSchema.parse(req.body);
      const newPartido = await PartidoModel.create(validated);
      res.status(201).json({
        success: true,
        message: "Partido registrado con éxito",
        data: newPartido,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = partidoIdParamSchema.parse(req.params);
      const validated = updatePartidoSchema.parse(req.body);
      const updated = await PartidoModel.update(id, validated);
      res.status(200).json({
        success: true,
        message: "Partido actualizado con éxito",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = partidoIdParamSchema.parse(req.params);
      await PartidoModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Partido eliminado con éxito",
      });
    } catch (error) {
      next(error);
    }
  }
}
