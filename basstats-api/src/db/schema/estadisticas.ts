import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { eventosTable } from "./eventos.js";

export const estadisticasTable = pgTable("estadisticas", {
  id: serial("id").primaryKey(),
  accion: varchar("accion", { length: 100 }).notNull().unique(),
});

export const estadisticasRelations = relations(estadisticasTable, ({ many }) => ({
  eventos: many(eventosTable),
}));

export type Estadistica = typeof estadisticasTable.$inferSelect;
export type NewEstadistica = typeof estadisticasTable.$inferInsert;
