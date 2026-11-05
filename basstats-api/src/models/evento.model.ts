import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { eventosTable, type Evento, type NewEvento } from "../db/schema/eventos.js";
import { partidosTable } from "../db/schema/partidos.js";
import { jugadoresTable } from "../db/schema/jugadores.js";
import { estadisticasTable } from "../db/schema/estadisticas.js";
import { ubicacionTirosTable } from "../db/schema/ubicacion-tiros.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createEventoSchema = z.object({
  idPartido: z.number().int().positive("El ID del partido debe ser un entero positivo"),
  idJugador: z.number().int().positive("El ID del jugador debe ser un entero positivo"),
  idEstadistica: z.number().int().positive("El ID de la estadística debe ser un entero positivo"),
  cuarto: z.number().int().min(1, "El cuarto debe ser al menos 1"),
});

export const updateEventoSchema = createEventoSchema.partial();

export const eventoIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreateEventoInput = z.infer<typeof createEventoSchema>;
export type UpdateEventoInput = z.infer<typeof updateEventoSchema>;

export class EventoModel {
  static async getAll(idPartido?: number, idJugador?: number) {
    const conditions = [];
    if (idPartido) conditions.push(eq(eventosTable.idPartido, idPartido));
    if (idJugador) conditions.push(eq(eventosTable.idJugador, idJugador));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const eventos = await db
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
      .where(whereClause)
      .orderBy(desc(eventosTable.createdAt));

    return eventos.map((ev) => ({
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
  }

  static async getById(id: number): Promise<Evento> {
    const [evento] = await db
      .select()
      .from(eventosTable)
      .where(eq(eventosTable.id, id))
      .limit(1);

    if (!evento) {
      throw new AppError(`Evento con ID ${id} no encontrado`, 404);
    }
    return evento;
  }

  static async createWithShot(
    data: CreateEventoInput,
    tiro?: { x: number; y: number }
  ) {
    const [partido] = await db
      .select()
      .from(partidosTable)
      .where(eq(partidosTable.id, data.idPartido))
      .limit(1);
    if (!partido) throw new AppError(`Partido con ID ${data.idPartido} no existe`, 404);

    const [jugador] = await db
      .select()
      .from(jugadoresTable)
      .where(eq(jugadoresTable.id, data.idJugador))
      .limit(1);
    if (!jugador) throw new AppError(`Jugador con ID ${data.idJugador} no existe`, 404);

    const [stat] = await db
      .select()
      .from(estadisticasTable)
      .where(eq(estadisticasTable.id, data.idEstadistica))
      .limit(1);
    if (!stat) throw new AppError(`Estadística con ID ${data.idEstadistica} no existe`, 404);

    const [newEvento] = await db.insert(eventosTable).values(data).returning();
    if (!newEvento) {
      throw new AppError("No se pudo registrar el evento", 500);
    }

    let createdTiro = null;
    if (tiro && typeof tiro.x === "number" && typeof tiro.y === "number") {
      const [t] = await db
        .insert(ubicacionTirosTable)
        .values({
          idEvento: newEvento.id,
          x: tiro.x,
          y: tiro.y,
        })
        .returning();
      createdTiro = t;
    }

    return {
      ...newEvento,
      jugadorNombre: jugador.nombreCompleto,
      jugadorNumero: jugador.numero,
      accionNombre: stat.accion,
      ubicacion: createdTiro || undefined,
    };
  }

  static async update(id: number, data: UpdateEventoInput): Promise<Evento> {
    await this.getById(id);

    const [updated] = await db
      .update(eventosTable)
      .set(data)
      .where(eq(eventosTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError("No se pudo actualizar el evento", 500);
    }
    return updated;
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(eventosTable).where(eq(eventosTable.id, id));
  }
}

export { eventosTable, type Evento, type NewEvento };
