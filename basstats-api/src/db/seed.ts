import { db, queryClient } from "../config/database.js";
import {
  usuariosTable,
  jugadoresTable,
  partidosTable,
  estadisticasTable,
  eventosTable,
  ubicacionTirosTable,
} from "./schema/index.js";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando carga de datos iniciales (Seed) de BasStats...");

  // 1. Asegurar que las 6 tablas existan (soporta bases de datos nuevas sin requerir migraciones manuales)
  await queryClient.unsafe(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      correo VARCHAR(255) NOT NULL UNIQUE,
      nick VARCHAR(100) NOT NULL,
      contrasena TEXT NOT NULL,
      rol VARCHAR(50) NOT NULL DEFAULT 'Equipo',
      logo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS jugadores (
      id SERIAL PRIMARY KEY,
      id_equipo INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      nombre_completo VARCHAR(255) NOT NULL,
      numero INTEGER NOT NULL,
      posicion_principal VARCHAR(100) NOT NULL,
      foto TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS partidos (
      id SERIAL PRIMARY KEY,
      id_equipo INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      equipo_rival VARCHAR(255) NOT NULL,
      fecha TIMESTAMP NOT NULL,
      resultado VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS estadisticas (
      id SERIAL PRIMARY KEY,
      accion VARCHAR(100) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id SERIAL PRIMARY KEY,
      id_partido INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
      id_jugador INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
      id_estadistica INTEGER NOT NULL REFERENCES estadisticas(id) ON DELETE CASCADE,
      cuarto INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ubicacion_tiros (
      id SERIAL PRIMARY KEY,
      id_evento INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
      x DOUBLE PRECISION NOT NULL,
      y DOUBLE PRECISION NOT NULL
    );
  `);

  console.log("📋 Tablas de la base de datos verificadas.");

  // 2. Limpiar datos existentes (en orden inverso de dependencia de claves foráneas)
  await db.delete(ubicacionTirosTable);
  await db.delete(eventosTable);
  await db.delete(estadisticasTable);
  await db.delete(partidosTable);
  await db.delete(jugadoresTable);
  await db.delete(usuariosTable);

  console.log("🧹 Datos previos eliminados.");

  // 3. Usuarios (Administrador y Equipos)
  const passwordAdmin = await bcrypt.hash("Admin123!", 10);
  const passwordEquipo = await bcrypt.hash("Equipo123!", 10);

  const [admin] = await db
    .insert(usuariosTable)
    .values({
      nombre: "Administrador de Liga",
      correo: "admin@basstats.com",
      nick: "Admin",
      contrasena: passwordAdmin,
      rol: "Administrador",
      logo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    })
    .returning();

  const [condores] = await db
    .insert(usuariosTable)
    .values({
      nombre: "Los Cóndores",
      correo: "condores@basstats.com",
      nick: "CND",
      contrasena: passwordEquipo,
      rol: "Equipo",
      logo: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80",
    })
    .returning();

  const [vikingos] = await db
    .insert(usuariosTable)
    .values({
      nombre: "Vikingos BC",
      correo: "vikingos@basstats.com",
      nick: "VIK",
      contrasena: passwordEquipo,
      rol: "Equipo",
      logo: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80",
    })
    .returning();

  console.log("✅ Usuarios iniciales creados:", admin.correo, condores.correo, vikingos.correo);

  // 4. Estadísticas (Catálogo maestro de acciones globales)
  const statsList = [
    { accion: "Triple Anotado" },
    { accion: "Triple Fallado" },
    { accion: "Doble Anotado" },
    { accion: "Doble Fallado" },
    { accion: "Tiro Libre Anotado" },
    { accion: "Tiro Libre Fallado" },
    { accion: "Rebote Ofensivo" },
    { accion: "Rebote Defensivo" },
    { accion: "Asistencia" },
    { accion: "Robo de Balón" },
    { accion: "Bloqueo / Tapa" },
    { accion: "Falta Personal" },
    { accion: "Pérdida de Balón" },
  ];

  const createdStats = await db.insert(estadisticasTable).values(statsList).returning();
  console.log(`✅ ${createdStats.length} Estadísticas catalogadas.`);

  // 5. Jugadores
  const condoresPlayers = await db
    .insert(jugadoresTable)
    .values([
      {
        idEquipo: condores.id,
        nombreCompleto: "Matías Gómez",
        numero: 7,
        posicionPrincipal: "Base (PG)",
        foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Lucas Rodríguez",
        numero: 23,
        posicionPrincipal: "Escolta (SG)",
        foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Agustín Silva",
        numero: 15,
        posicionPrincipal: "Alero (SF)",
        foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Facundo Benítez",
        numero: 34,
        posicionPrincipal: "Ala-Pívot (PF)",
        foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Joaquín Romero",
        numero: 11,
        posicionPrincipal: "Pívot (C)",
        foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Tomás Herrera",
        numero: 3,
        posicionPrincipal: "Base (PG)",
        foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: condores.id,
        nombreCompleto: "Bautista López",
        numero: 21,
        posicionPrincipal: "Alero (SF)",
        foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
      },
    ])
    .returning();

  const vikingosPlayers = await db
    .insert(jugadoresTable)
    .values([
      {
        idEquipo: vikingos.id,
        nombreCompleto: "Martín Peralta",
        numero: 4,
        posicionPrincipal: "Base (PG)",
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: vikingos.id,
        nombreCompleto: "Gonzalo Sosa",
        numero: 12,
        posicionPrincipal: "Escolta (SG)",
        foto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      },
      {
        idEquipo: vikingos.id,
        nombreCompleto: "Santiago Ortiz",
        numero: 24,
        posicionPrincipal: "Ala-Pívot (PF)",
        foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
      },
    ])
    .returning();

  console.log(`✅ ${condoresPlayers.length + vikingosPlayers.length} Jugadores creados.`);

  // 6. Partidos
  const [partido1] = await db
    .insert(partidosTable)
    .values({
      idEquipo: condores.id,
      equipoRival: "Vikingos BC",
      fecha: new Date("2026-10-25T20:00:00Z"),
      resultado: "84 - 78",
    })
    .returning();

  const [partido2] = await db
    .insert(partidosTable)
    .values({
      idEquipo: condores.id,
      equipoRival: "Águilas Negras",
      fecha: new Date("2026-11-01T21:30:00Z"),
      resultado: "72 - 68",
    })
    .returning();

  const [partido3] = await db
    .insert(partidosTable)
    .values({
      idEquipo: condores.id,
      equipoRival: "Tiburones Basket",
      fecha: new Date(),
      resultado: null,
    })
    .returning();

  console.log(`✅ ${[partido1, partido2, partido3].length} Partidos creados.`);

  // 7. Eventos y Tiros para el Partido 1
  const tripleStat = createdStats.find((s) => s.accion === "Triple Anotado") || createdStats[0];
  const dobleStat = createdStats.find((s) => s.accion === "Doble Anotado") || createdStats[2];
  const asistStat = createdStats.find((s) => s.accion === "Asistencia") || createdStats[8];
  const reboteStat = createdStats.find((s) => s.accion === "Rebote Defensivo") || createdStats[7];

  // Evento 1: Triple de Matías Gómez
  const [ev1] = await db
    .insert(eventosTable)
    .values({
      idPartido: partido1.id,
      idJugador: condoresPlayers[0].id,
      idEstadistica: tripleStat.id,
      cuarto: 1,
    })
    .returning();

  await db.insert(ubicacionTirosTable).values({
    idEvento: ev1.id,
    x: 24.5,
    y: 82.0,
  });

  // Evento 2: Asistencia de Lucas Rodríguez
  await db.insert(eventosTable).values({
    idPartido: partido1.id,
    idJugador: condoresPlayers[1].id,
    idEstadistica: asistStat.id,
    cuarto: 1,
  });

  // Evento 3: Doble de Facundo Benítez
  const [ev3] = await db
    .insert(eventosTable)
    .values({
      idPartido: partido1.id,
      idJugador: condoresPlayers[3].id,
      idEstadistica: dobleStat.id,
      cuarto: 2,
    })
    .returning();

  await db.insert(ubicacionTirosTable).values({
    idEvento: ev3.id,
    x: 51.0,
    y: 35.0,
  });

  // Evento 4: Rebote de Joaquín Romero
  await db.insert(eventosTable).values({
    idPartido: partido1.id,
    idJugador: condoresPlayers[4].id,
    idEstadistica: reboteStat.id,
    cuarto: 2,
  });

  console.log("✅ Eventos y coordenadas de tiro iniciales generados.");
  console.log("🎉 Seed finalizado exitosamente.");

  await queryClient.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
