export interface Equipo {
  id: number;
  nombre: string;
  correo: string;
  nick: string;
  logo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Jugador {
  id: number;
  idEquipo: number;
  nombreCompleto: string;
  numero: number;
  posicionPrincipal: string;
  foto?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Computed stats for display
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
  pin: string;
  puntosEquipo?: number;
  puntosRival?: number;
  cuartoActual?: number;
  createdAt?: string;
}

export interface EstadisticaAccion {
  id: number;
  accion: string;
  categoria?: "tiro" | "falta" | "rebote" | "pase" | "otro";
  puntos?: number;
}

export interface UbicacionTiro {
  id?: number;
  idEvento?: number;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  anotado?: boolean;
}

export interface EventoJuego {
  id: number;
  idPartido: number;
  idJugador: number;
  idEstadistica: number;
  cuarto: number;
  createdAt: string;
  // populated details
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
