-- ====================================================================
-- BASSTATS - SISTEMA WEB MVC PARA GESTIÓN DE ESTADÍSTICAS DE BÁSQUETBOL
-- Script de Creación de Tablas y Carga de Datos de Prueba (Seed SQL)
-- Motor: PostgreSQL 14+
-- ====================================================================

-- 1. Limpieza de Tablas (en orden inverso de claves foráneas)
DROP TABLE IF EXISTS ubicacion_tiros CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS estadisticas CASCADE;
DROP TABLE IF EXISTS partidos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. Creación de Tablas (6 Entidades Relacionadas)

-- Entidad 1: Usuario (Administrador o Equipo)
CREATE TABLE usuarios (
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

-- Entidad 2: Jugador (pertenece a Usuario/Equipo)
CREATE TABLE jugadores (
    id SERIAL PRIMARY KEY,
    id_equipo INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_completo VARCHAR(255) NOT NULL,
    numero INTEGER NOT NULL,
    posicion_principal VARCHAR(100) NOT NULL,
    foto TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Entidad 3: Partido (disputado por Usuario/Equipo)
CREATE TABLE partidos (
    id SERIAL PRIMARY KEY,
    id_equipo INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    equipo_rival VARCHAR(255) NOT NULL,
    fecha TIMESTAMP NOT NULL,
    resultado VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Entidad 4: Estadistica (Catálogo maestro de acciones del juego)
CREATE TABLE estadisticas (
    id SERIAL PRIMARY KEY,
    accion VARCHAR(100) NOT NULL UNIQUE
);

-- Entidad 5: Evento (Entidad dependiente que relaciona Partido, Jugador y Estadística)
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    id_partido INTEGER NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    id_jugador INTEGER NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
    id_estadistica INTEGER NOT NULL REFERENCES estadisticas(id) ON DELETE CASCADE,
    cuarto INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Entidad 6: Ubicacion_Tiros (Coordenadas x, y sobre la cancha para tiros registrados)
CREATE TABLE ubicacion_tiros (
    id SERIAL PRIMARY KEY,
    id_evento INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL
);

-- ====================================================================
-- 3. Inserción de Datos de Prueba (Seed Data)
-- ====================================================================

-- Usuarios
-- Contraseña admin: Admin123!
-- Contraseña equipo: Equipo123!
INSERT INTO usuarios (id, nombre, correo, nick, contrasena, rol, logo) VALUES
(1, 'Administrador de Liga', 'admin@basstats.com', 'Admin', '$2b$10$mHQr0bumxhzPSmITyVON6.zjz9PrMikE267QGR7UVKOIM/cYbxrTm', 'Administrador', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
(2, 'Los Cóndores', 'condores@basstats.com', 'CND', '$2b$10$a5ViEAK3xcJGqeY8UEK3keFKYk7V2OllVrx5U0SII6Sb/jJ0mi27.', 'Equipo', 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&auto=format&fit=crop&q=80'),
(3, 'Vikingos BC', 'vikingos@basstats.com', 'VIK', '$2b$10$a5ViEAK3xcJGqeY8UEK3keFKYk7V2OllVrx5U0SII6Sb/jJ0mi27.', 'Equipo', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&auto=format&fit=crop&q=80');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- Catálogo de Estadísticas
INSERT INTO estadisticas (id, accion) VALUES
(1, 'Triple Anotado'),
(2, 'Triple Fallado'),
(3, 'Doble Anotado'),
(4, 'Doble Fallado'),
(5, 'Tiro Libre Anotado'),
(6, 'Tiro Libre Fallado'),
(7, 'Rebote Ofensivo'),
(8, 'Rebote Defensivo'),
(9, 'Asistencia'),
(10, 'Robo de Balón'),
(11, 'Bloqueo / Tapa'),
(12, 'Falta Personal'),
(13, 'Pérdida de Balón');

SELECT setval('estadisticas_id_seq', (SELECT MAX(id) FROM estadisticas));

-- Jugadores
INSERT INTO jugadores (id, id_equipo, nombre_completo, numero, posicion_principal, foto) VALUES
(1, 2, 'Matías Gómez', 7, 'Base (PG)', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'),
(2, 2, 'Lucas Rodríguez', 23, 'Escolta (SG)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
(3, 2, 'Agustín Silva', 15, 'Alero (SF)', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'),
(4, 2, 'Facundo Benítez', 34, 'Ala-Pívot (PF)', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80'),
(5, 2, 'Joaquín Romero', 11, 'Pívot (C)', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80'),
(6, 2, 'Tomás Herrera', 3, 'Base (PG)', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'),
(7, 2, 'Bautista López', 21, 'Alero (SF)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80'),
(8, 3, 'Martín Peralta', 4, 'Base (PG)', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'),
(9, 3, 'Gonzalo Sosa', 12, 'Escolta (SG)', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'),
(10, 3, 'Santiago Ortiz', 24, 'Ala-Pívot (PF)', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80');

SELECT setval('jugadores_id_seq', (SELECT MAX(id) FROM jugadores));

-- Partidos
INSERT INTO partidos (id, id_equipo, equipo_rival, fecha, resultado) VALUES
(1, 2, 'Vikingos BC', '2026-10-25 20:00:00', '84 - 78'),
(2, 2, 'Águilas Negras', '2026-11-01 21:30:00', '72 - 68'),
(3, 2, 'Tiburones Basket', CURRENT_TIMESTAMP, NULL);

SELECT setval('partidos_id_seq', (SELECT MAX(id) FROM partidos));

-- Eventos de Juego
INSERT INTO eventos (id, id_partido, id_jugador, id_estadistica, cuarto) VALUES
(1, 1, 1, 1, 1), -- Matías Gómez: Triple Anotado
(2, 1, 2, 9, 1), -- Lucas Rodríguez: Asistencia
(3, 1, 4, 3, 2), -- Facundo Benítez: Doble Anotado
(4, 1, 5, 8, 2), -- Joaquín Romero: Rebote Defensivo
(5, 1, 1, 10, 3); -- Matías Gómez: Robo de Balón

SELECT setval('eventos_id_seq', (SELECT MAX(id) FROM eventos));

-- Ubicación de Tiros
INSERT INTO ubicacion_tiros (id, id_evento, x, y) VALUES
(1, 1, 24.5, 82.0),
(2, 3, 51.0, 35.0);

SELECT setval('ubicacion_tiros_id_seq', (SELECT MAX(id) FROM ubicacion_tiros));
