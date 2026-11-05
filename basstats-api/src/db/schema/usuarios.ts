import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { jugadoresTable } from "./jugadores.js";
import { partidosTable } from "./partidos.js";

export const usuariosTable = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  correo: varchar("correo", { length: 255 }).notNull().unique(),
  nick: varchar("nick", { length: 100 }).notNull(),
  contrasena: text("contrasena").notNull(),
  rol: varchar("rol", { length: 50 }).notNull().default("Equipo"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const usuariosRelations = relations(usuariosTable, ({ many }) => ({
  jugadores: many(jugadoresTable),
  partidos: many(partidosTable),
}));

export type Usuario = typeof usuariosTable.$inferSelect;
export type NewUsuario = typeof usuariosTable.$inferInsert;
