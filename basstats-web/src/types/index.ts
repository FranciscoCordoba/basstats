export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  nick: string;
  rol: "Administrador" | "Equipo";
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Alias de compatibilidad hacia atrás
export type Equipo = Usuario;

export interface Jugador {
  id: number;
  idEquipo: number;
  nombreCompleto: string;
  numero: number;
  posicionPrincipal: string;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Estadísticas calculadas para visualización
  ppg?: number;
  rpg?: number;
  apg?: number;
  spg?: number;
  bpg?: number;
  fgPercentage?: number;
}

export interface Partido {
  id: number;
  idEquipo: number;
  equipoRival: string;
  fecha: string;
  resultado?: string | null;
  puntosEquipo?: number;
  puntosRival?: number;
  cuartoActual?: number;
  createdAt?: string;
  updatedAt?: string;
  equipoNombre?: string;
  pin?: string;
}

export interface EstadisticaAccion {
  id: number;
  accion: string;
  categoria?: "tiro" | "falta" | "rebote" | "pase" | "otro" | string;
  puntos?: number;
}

export interface UbicacionTiro {
  id?: number;
  idEvento?: number;
  idJugador?: number;
  x: number; // porcentaje 0-100
  y: number; // porcentaje 0-100
  anotado?: boolean;
}

export interface EventoJuego {
  id: number;
  idPartido: number;
  idJugador: number;
  idEstadistica: number;
  cuarto: number;
  createdAt?: string;
  // Detalles poblados con relaciones
  jugadorNombre?: string;
  jugadorNumero?: number;
  accionNombre?: string;
  ubicacion?: UbicacionTiro;
}

export interface MatchLiveState {
  partidoId: number;
  equipoLocal: string;
  equipoRival: string;
  puntosLocal: number;
  puntosRival: number;
  cuarto: number;
  faltasLocal: number;
  faltasRival: number;
  jugadoresEnCancha: Jugador[];
  jugadoresBanca: Jugador[];
  eventos: EventoJuego[];
  tiros: UbicacionTiro[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
