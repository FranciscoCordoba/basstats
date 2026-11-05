import { Request, Response, NextFunction } from "express";
import {
  UsuarioModel,
  createUsuarioSchema,
  loginUsuarioSchema,
  updateUsuarioSchema,
} from "../models/usuario.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createUsuarioSchema.parse(req.body);
      const result = await UsuarioModel.register(validated);
      res.status(201).json({
        success: true,
        message: "Usuario registrado con éxito",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginUsuarioSchema.parse(req.body);
      const result = await UsuarioModel.login(validated);
      res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "No autenticado" });
        return;
      }
      const user = await UsuarioModel.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "No autenticado" });
        return;
      }
      const validated = updateUsuarioSchema.parse(req.body);
      const user = await UsuarioModel.updateProfile(req.user.id, validated);
      res.status(200).json({
        success: true,
        message: "Perfil actualizado con éxito",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "No autenticado" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ success: false, error: "No se proporcionó ningún archivo de imagen" });
        return;
      }

      const imageUrl = await uploadToCloudinary(req.file, "avatars");
      const user = await UsuarioModel.updateProfile(req.user.id, { logo: imageUrl });

      res.status(200).json({
        success: true,
        message: "Avatar actualizado con éxito",
        data: {
          url: imageUrl,
          user,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
