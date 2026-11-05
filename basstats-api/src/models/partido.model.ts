import { z } from "zod";
import { eq, and, ilike, count, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { partidosTable, type Partido, type NewPartido } from "../db/schema/partidos.js";
import { usuariosTable } from "../db/schema/usuarios.js";
import { eventosTable } from "../db/schema/eventos.js";
import { jugadoresTable } from "../db/schema/jugadores.js";
import { estadisticasTable } from "../db/schema/estadisticas.js";
import { ubicacionTirosTable } from "../db/schema/ubicacion-tiros.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createPartidoSchema = z.object({
  idEquipo: z.number().int().positive("El ID del equipo debe ser un entero positivo"),
  equipoRival: z.string().min(2, "El nombre del equipo rival debe tener al menos 2 caracteres"),
  fecha: z.string().or(z.date()).transform((val) => (typeof val === "string" ? new Date(val) : val)),
  resultado: z.string().optional().nullable(),
});

export const updatePartidoSchema = z.object({
  idEquipo: z.number().int().positive().optional(),
  equipoRival: z.string().min(2).optional(),
  fecha: z.string().or(z.date()).transform((val) => (typeof val === "string" ? new Date(val) : val)).optional(),
  resultado: z.string().optional().nullable(),
});

export const partidoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreatePartidoInput = z.infer<typeof createPartidoSchema>;
export type UpdatePartidoInput = z.infer<typeof updatePartidoSchema>;

export class PartidoModel {
  static async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    idEquipo?: number,
    search?: string
  ) {
    const offset = (page - 1) * limit;

    const conditions = [];
    if (idEquipo) {
      conditions.push(eq(partidosTable.idEquipo, idEquipo));
    }
    if (search && search.trim().length > 0) {
      conditions.push(ilike(partidosTable.equipoRival, `%${search.trim()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(partidosTable)
      .where(whereClause);

    const total = Number(totalResult?.count || 0);

    const partidos = await db
      .select({
        id: partidosTable.id,
        idEquipo: partidosTable.idEquipo,
        equipoRival: partidosTable.equipoRival,
        fecha: partidosTable.fecha,
        resultado: partidosTable.resultado,
        createdAt: partidosTable.createdAt,
        updatedAt: partidosTable.updatedAt,
        equipoNombre: usuariosTable.nombre,
      })
      .from(partidosTable)
      .leftJoin(usuariosTable, eq(partidosTable.idEquipo, usuariosTable.id))
      .where(whereClause)
      .orderBy(desc(partidosTable.fecha))
      .limit(limit)
      .offset(offset);

    return {
      items: partidos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getById(id: number): Promise<Partido> {
    const [partido] = await db
      .select()
      .from(partidosTable)
      .where(eq(partidosTable.id, id))
      .limit(1);

    if (!partido) {
      throw new AppError(`Partido con ID ${id} no encontrado`, 404);
    }
    return partido;
  }

  static async getFullGameDetails(id: number) {
    const [partido] = await db
      .select()
      .from(partidosTable)
      .where(eq(partidosTable.id, id))
      .limit(1);

    if (!partido) {
      throw new AppError(`Partido con ID ${id} no encontrado`, 404);
    }

    const [equipo] = await db
      .select({
        id: usuariosTable.id,
        nombre: usuariosTable.nombre,
        nick: usuariosTable.nick,
        logo: usuariosTable.logo,
      })
      .from(usuariosTable)
      .where(eq(usuariosTable.id, partido.idEquipo))
      .limit(1);

    const rawEventos = await db
      .select({
        id: eventosTable.id,
        idPartido: eventosTable.idPartido,
        idJugador: eventosTable.idJugador,
        idEstadistica: eventosTable.idEstadistica,
        cuarto: eventosTable.cuarto,
        createdAt: eventosTable.createdAt,
        jugadorNombre: jugadoresTable.nombreCompleto,
        jugadorNumero: jugadoresTable.numero,
        accionNombre: estadisticasTable.accion,
        tiroId: ubicacionTirosTable.id,
        tiroX: ubicacionTirosTable.x,
        tiroY: ubicacionTirosTable.y,
      })
      .from(eventosTable)
      .innerJoin(jugadoresTable, eq(eventosTable.idJugador, jugadoresTable.id))
      .innerJoin(estadisticasTable, eq(eventosTable.idEstadistica, estadisticasTable.id))
      .leftJoin(ubicacionTirosTable, eq(eventosTable.id, ubicacionTirosTable.idEvento))
      .where(eq(eventosTable.idPartido, id));

    const eventos = rawEventos.map((ev) => ({
      id: ev.id,
      idPartido: ev.idPartido,
      idJugador: ev.idJugador,
      idEstadistica: ev.idEstadistica,
      cuarto: ev.cuarto,
      createdAt: ev.createdAt,
      jugadorNombre: ev.jugadorNombre,
      jugadorNumero: ev.jugadorNumero,
      accionNombre: ev.accionNombre,
      ubicacion:
        ev.tiroId !== null
          ? {
              id: ev.tiroId,
              idEvento: ev.id,
              x: ev.tiroX,
              y: ev.tiroY,
            }
          : undefined,
    }));

    return {
      partido,
      equipo,
      eventos,
      tiros: eventos.filter((e) => e.ubicacion).map((e) => e.ubicacion!),
    };
  }

  static async create(data: CreatePartidoInput): Promise<Partido> {
    const [equipo] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.id, data.idEquipo))
      .limit(1);

    if (!equipo) {
      throw new AppError(`Equipo con ID ${data.idEquipo} no existe`, 404);
    }

    const [newPartido] = await db.insert(partidosTable).values(data).returning();
    if (!newPartido) {
      throw new AppError("No se pudo crear el partido", 500);
    }
    return newPartido;
  }

  static async update(id: number, data: UpdatePartidoInput): Promise<Partido> {
    await this.getById(id);

    if (data.idEquipo) {
      const [equipo] = await db
        .select()
        .from(usuariosTable)
        .where(eq(usuariosTable.id, data.idEquipo))
        .limit(1);

      if (!equipo) {
        throw new AppError(`Equipo con ID ${data.idEquipo} no existe`, 404);
      }
    }

    const [updated] = await db
      .update(partidosTable)
      .set(data)
      .where(eq(partidosTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError("No se pudo actualizar el partido", 500);
    }
    return updated;
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(partidosTable).where(eq(partidosTable.id, id));
  }
}

export { partidosTable, type Partido, type NewPartido };
