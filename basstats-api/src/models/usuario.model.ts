import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq, ilike, or, count } from "drizzle-orm";
import { db } from "../config/database.js";
import { usuariosTable, type Usuario, type NewUsuario } from "../db/schema/usuarios.js";
import { jugadoresTable } from "../db/schema/jugadores.js";
import { partidosTable } from "../db/schema/partidos.js";
import { AppError } from "../middlewares/errorHandler.js";
import type { AuthUserPayload } from "../middlewares/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET || "basstats_super_secret_jwt_token_2026_key";

export const createUsuarioSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  correo: z.string().email("Formato de correo electrónico inválido"),
  nick: z.string().min(2, "El nick debe tener al menos 2 caracteres"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  rol: z.enum(["Administrador", "Equipo"]).default("Equipo"),
  logo: z.string().optional().nullable(),
});

export const loginUsuarioSchema = z.object({
  correo: z.string().email("Formato de correo electrónico inválido"),
  contrasena: z.string().min(1, "La contraseña es requerida"),
});

export const updateUsuarioSchema = z.object({
  nombre: z.string().min(2).optional(),
  nick: z.string().min(2).optional(),
  logo: z.string().optional().nullable(),
});

export const updateRolSchema = z.object({
  rol: z.enum(["Administrador", "Equipo"]),
});

export const usuarioIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreateUsuarioInput = z.infer<typeof createUsuarioSchema>;
export type LoginUsuarioInput = z.infer<typeof loginUsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof updateUsuarioSchema>;
export type UsuarioResponse = Omit<Usuario, "contrasena">;

const toUsuarioResponse = (user: Usuario): UsuarioResponse => {
  const { contrasena: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export class UsuarioModel {
  static generateToken(user: Usuario): string {
    const payload: AuthUserPayload = {
      id: user.id,
      correo: user.correo,
      nick: user.nick,
      rol: user.rol as "Administrador" | "Equipo",
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  }

  static async register(data: CreateUsuarioInput): Promise<{ token: string; user: UsuarioResponse }> {
    const [existing] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.correo, data.correo))
      .limit(1);

    if (existing) {
      throw new AppError("El correo electrónico ya está registrado", 409);
    }

    const hashedPassword = await bcrypt.hash(data.contrasena, 10);

    const [newUser] = await db
      .insert(usuariosTable)
      .values({
        ...data,
        contrasena: hashedPassword,
        rol: data.rol || "Equipo",
      })
      .returning();

    if (!newUser) {
      throw new AppError("No se pudo registrar el usuario", 500);
    }

    const token = this.generateToken(newUser);
    return { token, user: toUsuarioResponse(newUser) };
  }

  static async login(data: LoginUsuarioInput): Promise<{ token: string; user: UsuarioResponse }> {
    const [user] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.correo, data.correo))
      .limit(1);

    if (!user) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const isMatch = await bcrypt.compare(data.contrasena, user.contrasena);
    if (!isMatch) {
      throw new AppError("Credenciales incorrectas", 401);
    }

    const token = this.generateToken(user);
    return { token, user: toUsuarioResponse(user) };
  }

  static async getProfile(userId: number): Promise<UsuarioResponse> {
    const [user] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return toUsuarioResponse(user);
  }

  static async updateProfile(
    userId: number,
    data: { nombre?: string; nick?: string; logo?: string | null }
  ): Promise<UsuarioResponse> {
    const [updated] = await db
      .update(usuariosTable)
      .set(data)
      .where(eq(usuariosTable.id, userId))
      .returning();

    if (!updated) {
      throw new AppError("Usuario no encontrado", 404);
    }

    return toUsuarioResponse(updated);
  }

  static async getAllPaginated(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;

    const whereClause = search
      ? or(
          ilike(usuariosTable.nombre, `%${search}%`),
          ilike(usuariosTable.correo, `%${search}%`),
          ilike(usuariosTable.nick, `%${search}%`)
        )
      : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(usuariosTable)
      .where(whereClause);

    const total = Number(totalResult?.count || 0);

    const users = await db
      .select()
      .from(usuariosTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return {
      items: users.map(toUsuarioResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async search(q: string) {
    if (!q || q.trim().length === 0) {
      return [];
    }

    const term = `%${q.trim()}%`;
    const users = await db
      .select({
        id: usuariosTable.id,
        nombre: usuariosTable.nombre,
        nick: usuariosTable.nick,
        correo: usuariosTable.correo,
        rol: usuariosTable.rol,
        logo: usuariosTable.logo,
      })
      .from(usuariosTable)
      .where(
        or(
          ilike(usuariosTable.nombre, term),
          ilike(usuariosTable.correo, term),
          ilike(usuariosTable.nick, term)
        )
      )
      .limit(10);

    return users;
  }

  static async getById(id: number): Promise<UsuarioResponse> {
    const [user] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.id, id))
      .limit(1);

    if (!user) {
      throw new AppError(`Usuario con ID ${id} no encontrado`, 404);
    }
    return toUsuarioResponse(user);
  }

  static async updateRol(id: number, rol: "Administrador" | "Equipo"): Promise<UsuarioResponse> {
    const [updated] = await db
      .update(usuariosTable)
      .set({ rol })
      .where(eq(usuariosTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError(`Usuario con ID ${id} no encontrado`, 404);
    }

    return toUsuarioResponse(updated);
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(usuariosTable).where(eq(usuariosTable.id, id));
  }

  static async getAuditStats() {
    const [usersCount] = await db.select({ count: count() }).from(usuariosTable);
    const [playersCount] = await db.select({ count: count() }).from(jugadoresTable);
    const [matchesCount] = await db.select({ count: count() }).from(partidosTable);

    return {
      totalUsuarios: Number(usersCount?.count || 0),
      totalJugadores: Number(playersCount?.count || 0),
      totalPartidos: Number(matchesCount?.count || 0),
    };
  }
}

export { usuariosTable, type Usuario, type NewUsuario };
