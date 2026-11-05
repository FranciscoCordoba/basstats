import { Request, Response, NextFunction } from "express";
import { UsuarioModel, usuarioIdParamSchema } from "../models/usuario.model.js";

export class UsuarioController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q as string) || "";
      const results = await UsuarioModel.search(q);
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
      const { id } = usuarioIdParamSchema.parse(req.params);
      const user = await UsuarioModel.getById(id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
