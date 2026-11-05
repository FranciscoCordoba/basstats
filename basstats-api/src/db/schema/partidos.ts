import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usuariosTable } from "./usuarios.js";
import { eventosTable } from "./eventos.js";

export const partidosTable = pgTable("partidos", {
  id: serial("id").primaryKey(),
  idEquipo: integer("id_equipo")
    .notNull()
    .references(() => usuariosTable.id, { onDelete: "cascade" }),
  equipoRival: varchar("equipo_rival", { length: 255 }).notNull(),
  fecha: timestamp("fecha").notNull(),
  resultado: varchar("resultado", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const partidosRelations = relations(partidosTable, ({ one, many }) => ({
  equipo: one(usuariosTable, {
    fields: [partidosTable.idEquipo],
    references: [usuariosTable.id],
  }),
  eventos: many(eventosTable),
}));

export type Partido = typeof partidosTable.$inferSelect;
export type NewPartido = typeof partidosTable.$inferInsert;
