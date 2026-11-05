import { pgTable, serial, integer, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { eventosTable } from "./eventos.js";

export const ubicacionTirosTable = pgTable("ubicacion_tiros", {
  id: serial("id").primaryKey(),
  idEvento: integer("id_evento")
    .notNull()
    .references(() => eventosTable.id, { onDelete: "cascade" }),
  x: doublePrecision("x").notNull(),
  y: doublePrecision("y").notNull(),
});

export const ubicacionTirosRelations = relations(ubicacionTirosTable, ({ one }) => ({
  evento: one(eventosTable, {
    fields: [ubicacionTirosTable.idEvento],
    references: [eventosTable.id],
  }),
}));

export type UbicacionTiro = typeof ubicacionTirosTable.$inferSelect;
export type NewUbicacionTiro = typeof ubicacionTirosTable.$inferInsert;
