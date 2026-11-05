import type {
  Usuario,
  Jugador,
  Partido,
  EstadisticaAccion,
  EventoJuego,
  PaginatedResult,
} from "../types/index.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem("basstats_token");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // No establecer Content-Type si el cuerpo es FormData (el navegador define el límite automáticamente)
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error || json.message || `Error en la petición: ${res.statusText}`);
    }

    return json;
  }

  // ==========================================
  // AUTENTICACIÓN & PERFIL
  // ==========================================
  async login(correo: string, contrasena: string): Promise<{ token: string; user: Usuario }> {
    const res = await this.request<{ success: boolean; data: { token: string; user: Usuario } }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ correo, contrasena }),
      }
    );
    if (res.data?.token) {
      localStorage.setItem("basstats_token", res.data.token);
    }
    return res.data;
  }

  async register(data: {
    nombre: string;
    correo: string;
    nick: string;
    contrasena: string;
    rol?: "Administrador" | "Equipo";
    logo?: string;
  }): Promise<{ token: string; user: Usuario }> {
    const res = await this.request<{ success: boolean; data: { token: string; user: Usuario } }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    if (res.data?.token) {
      localStorage.setItem("basstats_token", res.data.token);
    }
    return res.data;
  }

  async getProfile(): Promise<Usuario> {
    const res = await this.request<{ success: boolean; data: Usuario }>("/auth/profile");
    return res.data;
  }

  async updateProfile(data: { nombre?: string; nick?: string; logo?: string }): Promise<Usuario> {
    const res = await this.request<{ success: boolean; data: Usuario }>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async uploadAvatar(file: File): Promise<{ url: string; user: Usuario }> {
    const formData = new FormData();
    formData.append("avatar", file);

    const res = await this.request<{ success: boolean; data: { url: string; user: Usuario } }>(
      "/auth/avatar",
      {
        method: "POST",
        body: formData,
      }
    );
    return res.data;
  }

  // ==========================================
  // PANEL ADMINISTRADOR (Restringido por Rol)
  // ==========================================
  async getAdminUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResult<Usuario>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append("search", search);

    const res = await this.request<{ success: boolean; data: Usuario[]; pagination: any }>(
      `/admin/usuarios?${params.toString()}`
    );
    return {
      items: res.data,
      pagination: res.pagination,
    };
  }

  async changeUserRole(id: number, rol: "Administrador" | "Equipo"): Promise<Usuario> {
    const res = await this.request<{ success: boolean; data: Usuario }>(`/admin/usuarios/${id}/rol`, {
      method: "PATCH",
      body: JSON.stringify({ rol }),
    });
    return res.data;
  }

  async deleteUser(id: number): Promise<void> {
    await this.request(`/admin/usuarios/${id}`, {
      method: "DELETE",
    });
  }

  async getAuditStats(): Promise<{ totalUsuarios: number; totalJugadores: number; totalPartidos: number }> {
    const res = await this.request<{ success: boolean; data: any }>("/admin/audit");
    return res.data;
  }

  // ==========================================
  // BÚSQUEDA ASÍNCRONA (AJAX Search)
  // ==========================================
  async searchUsuarios(q: string): Promise<Usuario[]> {
    if (!q || q.trim().length === 0) return [];
    const res = await this.request<{ success: boolean; data: Usuario[] }>(
      `/usuarios/search?q=${encodeURIComponent(q)}`
    );
    return res.data;
  }

  async searchJugadores(q: string, idEquipo?: number): Promise<Jugador[]> {
    if (!q || q.trim().length === 0) return [];
    const params = new URLSearchParams({ q });
    if (idEquipo) params.append("idEquipo", idEquipo.toString());

    const res = await this.request<{ success: boolean; data: Jugador[] }>(
      `/jugadores/search?${params.toString()}`
    );
    return res.data;
  }

  // ==========================================
  // JUGADORES (ABM REACTIVO + PAGINADO)
  // ==========================================
  async getJugadores(
    page: number = 1,
    limit: number = 10,
    idEquipo?: number,
    search?: string
  ): Promise<PaginatedResult<Jugador>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (idEquipo) params.append("idEquipo", idEquipo.toString());
    if (search) params.append("search", search);

    const res = await this.request<{ success: boolean; data: Jugador[]; pagination: any }>(
      `/jugadores?${params.toString()}`
    );
    return {
      items: res.data,
      pagination: res.pagination,
    };
  }

  async getJugadorById(id: number): Promise<Jugador> {
    const res = await this.request<{ success: boolean; data: Jugador }>(`/jugadores/${id}`);
    return res.data;
  }

  async getJugadorStats(id: number): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>(`/jugadores/${id}/stats`);
    return res.data;
  }

  async createJugador(data: {
    idEquipo: number;
    nombreCompleto: string;
    numero: number;
    posicionPrincipal: string;
    foto?: string | null;
  }): Promise<Jugador> {
    const res = await this.request<{ success: boolean; data: Jugador }>("/jugadores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async uploadJugadorFoto(id: number, file: File): Promise<{ url: string; jugador: Jugador }> {
    const formData = new FormData();
    formData.append("foto", file);

    const res = await this.request<{ success: boolean; data: { url: string; jugador: Jugador } }>(
      `/jugadores/${id}/foto`,
      {
        method: "POST",
        body: formData,
      }
    );
    return res.data;
  }

  async updateJugador(id: number, data: Partial<Jugador>): Promise<Jugador> {
    const res = await this.request<{ success: boolean; data: Jugador }>(`/jugadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async deleteJugador(id: number): Promise<void> {
    await this.request(`/jugadores/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // PARTIDOS (CRUD + PAGINADO + DETALLES)
  // ==========================================
  async getPartidos(
    page: number = 1,
    limit: number = 10,
    idEquipo?: number,
    search?: string
  ): Promise<PaginatedResult<Partido>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (idEquipo) params.append("idEquipo", idEquipo.toString());
    if (search) params.append("search", search);

    const res = await this.request<{ success: boolean; data: Partido[]; pagination: any }>(
      `/partidos?${params.toString()}`
    );
    return {
      items: res.data,
      pagination: res.pagination,
    };
  }

  async getPartidoById(id: number): Promise<Partido> {
    const res = await this.request<{ success: boolean; data: Partido }>(`/partidos/${id}`);
    return res.data;
  }

  async getPartidoDetails(id: number): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>(`/partidos/${id}/details`);
    return res.data;
  }

  async createPartido(data: {
    idEquipo: number;
    equipoRival: string;
    fecha: string;
    resultado?: string | null;
  }): Promise<Partido> {
    const res = await this.request<{ success: boolean; data: Partido }>("/partidos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async updatePartido(id: number, data: Partial<Partido>): Promise<Partido> {
    const res = await this.request<{ success: boolean; data: Partido }>(`/partidos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async deletePartido(id: number): Promise<void> {
    await this.request(`/partidos/${id}`, {
      method: "DELETE",
    });
  }

  // ==========================================
  // ESTADÍSTICAS & EVENTOS EN VIVO
  // ==========================================
  async getEstadisticas(): Promise<EstadisticaAccion[]> {
    const res = await this.request<{ success: boolean; data: EstadisticaAccion[] }>("/estadisticas");
    return res.data;
  }

  async getEventos(idPartido?: number, idJugador?: number): Promise<EventoJuego[]> {
    const params = new URLSearchParams();
    if (idPartido) params.append("idPartido", idPartido.toString());
    if (idJugador) params.append("idJugador", idJugador.toString());

    const res = await this.request<{ success: boolean; data: EventoJuego[] }>(
      `/eventos?${params.toString()}`
    );
    return res.data;
  }

  async createEvento(data: {
    idPartido: number;
    idJugador: number;
    idEstadistica: number;
    cuarto: number;
    tiro?: { x: number; y: number };
  }): Promise<EventoJuego> {
    const res = await this.request<{ success: boolean; data: EventoJuego }>("/eventos", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.data;
  }

  async deleteEvento(id: number): Promise<void> {
    await this.request(`/eventos/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiService();
