import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { partidosTable } from "./partidos.js";
import { jugadoresTable } from "./jugadores.js";
import { estadisticasTable } from "./estadisticas.js";
import { ubicacionTirosTable } from "./ubicacion-tiros.js";

export const eventosTable = pgTable("eventos", {
  id: serial("id").primaryKey(),
  idPartido: integer("id_partido")
    .notNull()
    .references(() => partidosTable.id, { onDelete: "cascade" }),
  idJugador: integer("id_jugador")
    .notNull()
    .references(() => jugadoresTable.id, { onDelete: "cascade" }),
  idEstadistica: integer("id_estadistica")
    .notNull()
    .references(() => estadisticasTable.id, { onDelete: "cascade" }),
  cuarto: integer("cuarto").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventosRelations = relations(eventosTable, ({ one, many }) => ({
  partido: one(partidosTable, {
    fields: [eventosTable.idPartido],
    references: [partidosTable.id],
  }),
  jugador: one(jugadoresTable, {
    fields: [eventosTable.idJugador],
    references: [jugadoresTable.id],
  }),
  estadistica: one(estadisticasTable, {
    fields: [eventosTable.idEstadistica],
    references: [estadisticasTable.id],
  }),
  ubicacionesTiros: many(ubicacionTirosTable),
}));

export type Evento = typeof eventosTable.$inferSelect;
export type NewEvento = typeof eventosTable.$inferInsert;
