import { z } from "zod";
import { eq, and, ilike, count } from "drizzle-orm";
import { db } from "../config/database.js";
import { jugadoresTable, type Jugador, type NewJugador } from "../db/schema/jugadores.js";
import { usuariosTable } from "../db/schema/usuarios.js";
import { eventosTable } from "../db/schema/eventos.js";
import { estadisticasTable } from "../db/schema/estadisticas.js";
import { ubicacionTirosTable } from "../db/schema/ubicacion-tiros.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createJugadorSchema = z.object({
  idEquipo: z.number().int().positive("El ID del equipo debe ser un entero positivo"),
  nombreCompleto: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
  numero: z.number().int().min(0, "El número de camiseta debe ser mayor o igual a 0"),
  posicionPrincipal: z.string().min(1, "La posición principal es requerida"),
  foto: z.string().optional().nullable(),
});

export const updateJugadorSchema = createJugadorSchema.partial();

export const jugadorIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreateJugadorInput = z.infer<typeof createJugadorSchema>;
export type UpdateJugadorInput = z.infer<typeof updateJugadorSchema>;

export class JugadorModel {
  static async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    idEquipo?: number,
    search?: string
  ) {
    const offset = (page - 1) * limit;

    const conditions = [];
    if (idEquipo) {
      conditions.push(eq(jugadoresTable.idEquipo, idEquipo));
    }
    if (search && search.trim().length > 0) {
      conditions.push(ilike(jugadoresTable.nombreCompleto, `%${search.trim()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(jugadoresTable)
      .where(whereClause);

    const total = Number(totalResult?.count || 0);

    const jugadores = await db
      .select()
      .from(jugadoresTable)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return {
      items: jugadores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async search(q: string, idEquipo?: number) {
    if (!q || q.trim().length === 0) {
      return [];
    }

    const conditions = [ilike(jugadoresTable.nombreCompleto, `%${q.trim()}%`)];
    if (idEquipo) {
      conditions.push(eq(jugadoresTable.idEquipo, idEquipo));
    }

    return db
      .select({
        id: jugadoresTable.id,
        nombreCompleto: jugadoresTable.nombreCompleto,
        numero: jugadoresTable.numero,
        posicionPrincipal: jugadoresTable.posicionPrincipal,
        foto: jugadoresTable.foto,
        idEquipo: jugadoresTable.idEquipo,
      })
      .from(jugadoresTable)
      .where(and(...conditions))
      .limit(10);
  }

  static async getById(id: number): Promise<Jugador> {
    const [jugador] = await db
      .select()
      .from(jugadoresTable)
      .where(eq(jugadoresTable.id, id))
      .limit(1);

    if (!jugador) {
      throw new AppError(`Jugador con ID ${id} no encontrado`, 404);
    }
    return jugador;
  }

  static async getPlayerStats(id: number) {
    const jugador = await this.getById(id);

    const events = await db
      .select({
        accion: estadisticasTable.accion,
        cuarto: eventosTable.cuarto,
        idPartido: eventosTable.idPartido,
      })
      .from(eventosTable)
      .innerJoin(estadisticasTable, eq(eventosTable.idEstadistica, estadisticasTable.id))
      .where(eq(eventosTable.idJugador, id));

    const shots = await db
      .select({
        id: ubicacionTirosTable.id,
        idEvento: ubicacionTirosTable.idEvento,
        x: ubicacionTirosTable.x,
        y: ubicacionTirosTable.y,
        accion: estadisticasTable.accion,
      })
      .from(ubicacionTirosTable)
      .innerJoin(eventosTable, eq(ubicacionTirosTable.idEvento, eventosTable.id))
      .innerJoin(estadisticasTable, eq(eventosTable.idEstadistica, estadisticasTable.id))
      .where(eq(eventosTable.idJugador, id));

    let triplesAnotados = 0;
    let doblesAnotados = 0;
    let libresAnotados = 0;
    let rebotes = 0;
    let asistencias = 0;
    let faltas = 0;
    let robos = 0;

    const matchesSet = new Set<number>();

    for (const ev of events) {
      matchesSet.add(ev.idPartido);
      const acc = ev.accion.toLowerCase();
      if (acc.includes("triple anotado")) triplesAnotados++;
      else if (acc.includes("doble anotado") || acc.includes("tiro 2 anotado")) doblesAnotados++;
      else if (acc.includes("libre anotado") || acc.includes("tiro libre anotado")) libresAnotados++;
      else if (acc.includes("rebote")) rebotes++;
      else if (acc.includes("asistencia")) asistencias++;
      else if (acc.includes("falta")) faltas++;
      else if (acc.includes("robo")) robos++;
    }

    const totalPuntos = triplesAnotados * 3 + doblesAnotados * 2 + libresAnotados;
    const partidosJugados = matchesSet.size;

    const tiros = shots.map((s) => ({
      id: s.id,
      idEvento: s.idEvento,
      idJugador: id,
      x: s.x,
      y: s.y,
      anotado: s.accion.toLowerCase().includes("anotado"),
    }));

    return {
      jugador,
      partidosJugados,
      totalPuntos,
      ppg: partidosJugados > 0 ? Number((totalPuntos / partidosJugados).toFixed(1)) : 0,
      rpg: partidosJugados > 0 ? Number((rebotes / partidosJugados).toFixed(1)) : 0,
      apg: partidosJugados > 0 ? Number((asistencias / partidosJugados).toFixed(1)) : 0,
      spg: partidosJugados > 0 ? Number((robos / partidosJugados).toFixed(1)) : 0,
      faltas,
      totalEventos: events.length,
      tiros,
    };
  }

  static async create(data: CreateJugadorInput): Promise<Jugador> {
    const [equipo] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.id, data.idEquipo))
      .limit(1);

    if (!equipo) {
      throw new AppError(`Equipo con ID ${data.idEquipo} no existe`, 404);
    }

    const [newJugador] = await db.insert(jugadoresTable).values(data).returning();
    if (!newJugador) {
      throw new AppError("No se pudo crear el jugador", 500);
    }
    return newJugador;
  }

  static async update(id: number, data: UpdateJugadorInput): Promise<Jugador> {
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
      .update(jugadoresTable)
      .set(data)
      .where(eq(jugadoresTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError("No se pudo actualizar el jugador", 500);
    }
    return updated;
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(jugadoresTable).where(eq(jugadoresTable.id, id));
  }
}

export { jugadoresTable, type Jugador, type NewJugador };
