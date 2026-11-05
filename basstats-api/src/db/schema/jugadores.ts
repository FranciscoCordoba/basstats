import { pgTable, serial, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usuariosTable } from "./usuarios.js";
import { eventosTable } from "./eventos.js";

export const jugadoresTable = pgTable("jugadores", {
  id: serial("id").primaryKey(),
  idEquipo: integer("id_equipo")
    .notNull()
    .references(() => usuariosTable.id, { onDelete: "cascade" }),
  nombreCompleto: varchar("nombre_completo", { length: 255 }).notNull(),
  numero: integer("numero").notNull(),
  posicionPrincipal: varchar("posicion_principal", { length: 100 }).notNull(),
  foto: text("foto"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const jugadoresRelations = relations(jugadoresTable, ({ one, many }) => ({
  equipo: one(usuariosTable, {
    fields: [jugadoresTable.idEquipo],
    references: [usuariosTable.id],
  }),
  eventos: many(eventosTable),
}));

export type Jugador = typeof jugadoresTable.$inferSelect;
export type NewJugador = typeof jugadoresTable.$inferInsert;
