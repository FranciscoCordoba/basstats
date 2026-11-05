import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { estadisticasTable, type Estadistica, type NewEstadistica } from "../db/schema/estadisticas.js";
import { AppError } from "../middlewares/errorHandler.js";

export const createEstadisticaSchema = z.object({
  accion: z.string().min(1, "El nombre de la acción es requerido"),
});

export const updateEstadisticaSchema = createEstadisticaSchema.partial();

export const estadisticaIdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "El ID debe ser un número entero").transform(Number),
});

export type CreateEstadisticaInput = z.infer<typeof createEstadisticaSchema>;
export type UpdateEstadisticaInput = z.infer<typeof updateEstadisticaSchema>;

export class EstadisticaModel {
  static async getAll(): Promise<Estadistica[]> {
    return db.select().from(estadisticasTable);
  }

  static async getById(id: number): Promise<Estadistica> {
    const [stat] = await db.select().from(estadisticasTable).where(eq(estadisticasTable.id, id)).limit(1);
    if (!stat) {
      throw new AppError(`Estadística con ID ${id} no encontrada`, 404);
    }
    return stat;
  }

  static async create(data: CreateEstadisticaInput): Promise<Estadistica> {
    const [existing] = await db
      .select()
      .from(estadisticasTable)
      .where(eq(estadisticasTable.accion, data.accion))
      .limit(1);

    if (existing) {
      throw new AppError(`La acción estadística '${data.accion}' ya existe`, 409);
    }

    const [newStat] = await db.insert(estadisticasTable).values(data).returning();
    if (!newStat) {
      throw new AppError("No se pudo crear la estadística", 500);
    }
    return newStat;
  }

  static async update(id: number, data: UpdateEstadisticaInput): Promise<Estadistica> {
    await this.getById(id);

    if (data.accion) {
      const [existing] = await db
        .select()
        .from(estadisticasTable)
        .where(eq(estadisticasTable.accion, data.accion))
        .limit(1);

      if (existing && existing.id !== id) {
        throw new AppError(`La acción estadística '${data.accion}' ya existe`, 409);
      }
    }

    const [updated] = await db
      .update(estadisticasTable)
      .set(data)
      .where(eq(estadisticasTable.id, id))
      .returning();

    if (!updated) {
      throw new AppError("No se pudo actualizar la estadística", 500);
    }
    return updated;
  }

  static async delete(id: number): Promise<void> {
    await this.getById(id);
    await db.delete(estadisticasTable).where(eq(estadisticasTable.id, id));
  }
}

export { estadisticasTable, type Estadistica, type NewEstadistica };
