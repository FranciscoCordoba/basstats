import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { ubicacionTirosTable, type UbicacionTiro, type NewUbicacionTiro } from "../db/schema/ubicacion-tiros.js";
import { eventosTable } from "../db/schema/eventos.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createUbicacionTiroSchema = z.object({
  idEvento: z.number().int().positive("El ID del evento debe ser un entero positivo"),
  x: z.number().describe("Coordenada X del tiro en la cancha"),
  y: z.number().describe("Coordenada Y del tiro en la cancha"),
});

export const updateUbicacionTiroSchema = createUbicacionTiroSchema.partial();

export const ubicacionTiroIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreateUbicacionTiroInput = z.infer<typeof createUbicacionTiroSchema>;
export type UpdateUbicacionTiroInput = z.infer<typeof updateUbicacionTiroSchema>;

export class UbicacionTiroModel {
  static async getAll(idEvento?: number): Promise<UbicacionTiro[]> {
    if (idEvento) {
      return db
        .select()
        .from(ubicacionTirosTable)
        .where(eq(ubicacionTirosTable.idEvento, idEvento));
    }
    return db.select().from(ubicacionTirosTable);
  }

  static async getById(id: number): Promise<UbicacionTiro> {
    const [ubicacion] = await db
      .select()
      .from(ubicacionTirosTable)
      .where(eq(ubicacionTirosTable.id, id))
      .limit(1);

    if (!ubicacion) {
      throw new AppError(`Ubicación de tiro con ID ${id} no encontrada`, 404);
    }
    return ubicacion;
  }

  static async create(data: CreateUbicacionTiroInput): Promise<UbicacionTiro> {
    const [evento] = await db
      .select()
      .from(eventosTable)
      .where(eq(eventosTable.id, data.idEvento))
      .limit(1);

    if (!evento) {
      throw new AppError(`Evento con ID ${data.idEvento} no existe`, 404);
    }

    const [newUbicacion] = await db.insert(ubicacionTirosTable).values(data).returning();
    if (!newUbicacion) {
      throw new AppError("No se pudo registrar la ubicación del tiro", 500);
    }
    return newUbicacion;
  }

  static async update(id: number, data: UpdateUbicacionTiroInput): Promise<UbicacionTiro> {
    await this.getById(id);

    if (data.idEvento) {
      const [evento] = await db
        .select()
        .from(eventosTable)
        .where(eq(eventosTable.id, data.idEvento))
        .limit(1);

      if (!evento) {
        throw new AppError(`Evento con ID ${data.idEvento} no existe`, 404);
      }
    }

    const [updated] = await db
      .update(ubicacionTirosTable)
      .set(data)
      .where(eq(ubicacionTirosTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError("No se pudo actualizar la ubicación del tiro", 500);
    }
    return updated;
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(ubicacionTirosTable).where(eq(ubicacionTirosTable.id, id));
  }
}

export { ubicacionTirosTable, type UbicacionTiro, type NewUbicacionTiro };
