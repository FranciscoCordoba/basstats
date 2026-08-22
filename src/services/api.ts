import type { Equipo, Jugador, Partido, EstadisticaAccion, EventoJuego, UbicacionTiro } from "../types/index.js";
import { initialEquipo, initialJugadores, initialPartidos, initialEstadisticas } from "../data/mockData.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }

      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch (err) {
      console.warn(`Fetch to ${endpoint} failed, using local state:`, err);
      throw err;
    }
  }

  // Equipos
  async getEquipos(): Promise<Equipo[]> {
    try {
      return await this.request<Equipo[]>("/equipos");
    } catch {
      return [initialEquipo];
    }
  }

  async getEquipoById(id: number): Promise<Equipo> {
    try {
      return await this.request<Equipo>(`/equipos/${id}`);
    } catch {
      return initialEquipo;
    }
  }

  async createEquipo(data: Partial<Equipo> & { contrasena: string }): Promise<Equipo> {
    try {
      return await this.request<Equipo>("/equipos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: Date.now(),
        nombre: data.nombre || "Nuevo Equipo",
        correo: data.correo || "equipo@ejemplo.com",
        nick: data.nick || "EQP",
        logo: data.logo,
      };
    }
  }

  // Jugadores
  async getJugadores(idEquipo?: number): Promise<Jugador[]> {
    try {
      const query = idEquipo ? `?idEquipo=${idEquipo}` : "";
      return await this.request<Jugador[]>(`/jugadores${query}`);
    } catch {
      return initialJugadores;
    }
  }

  async getJugadorById(id: number): Promise<Jugador | undefined> {
    try {
      return await this.request<Jugador>(`/jugadores/${id}`);
    } catch {
      return initialJugadores.find((j) => j.id === id);
    }
  }

  async createJugador(data: Partial<Jugador>): Promise<Jugador> {
    try {
      return await this.request<Jugador>("/jugadores", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      const newJ: Jugador = {
        id: Date.now(),
        idEquipo: data.idEquipo || 1,
        nombreCompleto: data.nombreCompleto || "Nuevo Jugador",
        numero: data.numero || 0,
        posicionPrincipal: data.posicionPrincipal || "Alero",
        foto: data.foto,
        ppg: 0,
        rpg: 0,
        apg: 0,
      };
      return newJ;
    }
  }

  // Partidos
  async getPartidos(idEquipo?: number): Promise<Partido[]> {
    try {
      const query = idEquipo ? `?idEquipo=${idEquipo}` : "";
      return await this.request<Partido[]>(`/partidos${query}`);
    } catch {
      return initialPartidos;
    }
  }

  async createPartido(data: Partial<Partido>): Promise<Partido> {
    try {
      return await this.request<Partido>("/partidos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: Date.now(),
        idEquipo: data.idEquipo || 1,
        equipoRival: data.equipoRival || "Rival",
        fecha: data.fecha || new Date().toISOString(),
        resultado: "En progreso",
        pin: data.pin || "1234",
      };
    }
  }

  // Estadísticas Catálogo
  async getEstadisticas(): Promise<EstadisticaAccion[]> {
    try {
      return await this.request<EstadisticaAccion[]>("/estadisticas");
    } catch {
      return initialEstadisticas;
    }
  }

  // Eventos de juego
  async createEvento(data: {
    idPartido: number;
    idJugador: number;
    idEstadistica: number;
    cuarto: number;
  }): Promise<EventoJuego> {
    try {
      return await this.request<EventoJuego>("/eventos", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: Date.now(),
        ...data,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    }
  }

  // Tiros y Coordenadas
  async createUbicacionTiro(data: { idEvento: number; x: number; y: number }): Promise<UbicacionTiro> {
    try {
      return await this.request<UbicacionTiro>("/ubicacion-tiros", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch {
      return {
        id: Date.now(),
        ...data,
      };
    }
  }
}

export const api = new ApiService();
