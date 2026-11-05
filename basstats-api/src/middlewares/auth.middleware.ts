import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "basstats_super_secret_jwt_token_2026_key";

export interface AuthUserPayload {
  id: number;
  correo: string;
  nick: string;
  rol: "Administrador" | "Equipo";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "No se proporcionó un token de autenticación válido",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "Token inválido o expirado",
    });
  }
};

export const requireRole = (allowedRoles: ("Administrador" | "Equipo")[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Usuario no autenticado",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.rol)) {
      res.status(403).json({
        success: false,
        error: `Acceso denegado: se requiere uno de los siguientes roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
