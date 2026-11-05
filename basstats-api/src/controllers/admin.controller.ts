import { Request, Response, NextFunction } from "express";
import { UsuarioModel, updateRolSchema, usuarioIdParamSchema } from "../models/usuario.model.js";

export class AdminController {
  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string | undefined;

      const result = await UsuarioModel.getAllPaginated(page, limit, search);
      res.status(200).json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changeUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = usuarioIdParamSchema.parse(req.params);
      const { rol } = updateRolSchema.parse(req.body);

      const updated = await UsuarioModel.updateRol(id, rol);
      res.status(200).json({
        success: true,
        message: `Rol actualizado a ${rol}`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = usuarioIdParamSchema.parse(req.params);
      await UsuarioModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Usuario y sus registros asociados eliminados con éxito",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await UsuarioModel.getAuditStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
