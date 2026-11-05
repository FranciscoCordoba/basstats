import { Request, Response, NextFunction } from "express";
import {
  JugadorModel,
  createJugadorSchema,
  updateJugadorSchema,
  jugadorIdParamSchema,
} from "../models/jugador.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export class JugadorController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const idEquipo = req.query.idEquipo ? parseInt(req.query.idEquipo as string, 10) : undefined;
      const search = req.query.search as string | undefined;

      const result = await JugadorModel.getAllPaginated(page, limit, idEquipo, search);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || "";
      const idEquipo = req.query.idEquipo ? parseInt(req.query.idEquipo as string, 10) : undefined;
      const results = await JugadorModel.search(q, idEquipo);
      res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = jugadorIdParamSchema.parse(req.params);
      const jugador = await JugadorModel.getById(id);
      res.status(200).json({
        success: true,
        data: jugador,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = jugadorIdParamSchema.parse(req.params);
      const stats = await JugadorModel.getPlayerStats(id);
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createJugadorSchema.parse(req.body);
      const newJugador = await JugadorModel.create(validated);
      res.status(201).json({
        success: true,
        message: "Jugador creado con éxito",
        data: newJugador,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadFoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = jugadorIdParamSchema.parse(req.params);
      if (!req.file) {
        res.status(400).json({ success: false, error: "No se proporcionó ningún archivo de imagen" });
        return;
      }

      const imageUrl = await uploadToCloudinary(req.file, "jugadores");
      const updated = await JugadorModel.update(id, { foto: imageUrl });

      res.status(200).json({
        success: true,
        message: "Foto de jugador actualizada con éxito",
        data: {
          url: imageUrl,
          jugador: updated,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = jugadorIdParamSchema.parse(req.params);
      const validated = updateJugadorSchema.parse(req.body);
      const updated = await JugadorModel.update(id, validated);
      res.status(200).json({
        success: true,
        message: "Jugador actualizado con éxito",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = jugadorIdParamSchema.parse(req.params);
      await JugadorModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Jugador eliminado con éxito",
      });
    } catch (error) {
      next(error);
    }
  }
}
