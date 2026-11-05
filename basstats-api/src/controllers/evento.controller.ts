import { Request, Response, NextFunction } from "express";
import {
  EventoModel,
  createEventoSchema,
  updateEventoSchema,
  eventoIdParamSchema,
} from "../models/evento.model.js";

export class EventoController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idPartido = req.query.idPartido ? parseInt(req.query.idPartido as string, 10) : undefined;
      const idJugador = req.query.idJugador ? parseInt(req.query.idJugador as string, 10) : undefined;

      const eventos = await EventoModel.getAll(idPartido, idJugador);
      res.status(200).json({
        success: true,
        data: eventos,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      const evento = await EventoModel.getById(id);
      res.status(200).json({
        success: true,
        data: evento,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createEventoSchema.parse(req.body);
      const tiro = req.body.tiro as { x: number; y: number } | undefined;

      const newEvento = await EventoModel.createWithShot(validated, tiro);
      res.status(201).json({
        success: true,
        message: "Evento de juego registrado con éxito",
        data: newEvento,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      const validated = updateEventoSchema.parse(req.body);
      const updated = await EventoModel.update(id, validated);
      res.status(200).json({
        success: true,
        message: "Evento actualizado con éxito",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = eventoIdParamSchema.parse(req.params);
      await EventoModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Evento eliminado con éxito",
      });
    } catch (error) {
      next(error);
    }
  }
}
