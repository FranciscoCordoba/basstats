import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import {
  Shield,
  Users,
  Plus,
  Trophy,
  ChevronRight,
  TrendingUp,
  X,
  UserPlus,
} from "lucide-react";
import { initialJugadores, initialPartidos } from "../data/mockData.js";
import { api } from "../services/api.js";
import type { Jugador } from "../types/index.js";

export const TeamPage: React.FC = () => {
  const { currentTeam } = useAuth();
  const [jugadores, setJugadores] = useState<Jugador[]>(initialJugadores);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Player Form State
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [numero, setNumero] = useState<number>(10);
  const [posicionPrincipal, setPosicionPrincipal] = useState("Base (PG)");
  const [foto, setFoto] = useState("");

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createJugador({
      idEquipo: currentTeam.id,
      nombreCompleto,
      numero: Number(numero),
      posicionPrincipal,
      foto: foto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    });

    setJugadores((prev) => [...prev, created]);
    setShowAddModal(false);
    setNombreCompleto("");
    setNumero(10);
    setFoto("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Team Profile Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            <img
              src={
                currentTeam.logo ||
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80"
              }
              alt={currentTeam.nombre}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/40 p-1 shadow-xl shadow-primary/10"
            />
            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-primary-container text-white">
                  {currentTeam.nick}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {currentTeam.correo}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface tracking-tight">
                {currentTeam.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant flex items-center justify-center sm:justify-start gap-4 pt-1">
                <span><strong>{jugadores.length}</strong> Jugadores</span>
                <span>•</span>
                <span><strong>{initialPartidos.length}</strong> Partidos</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">66.7% Win Rate</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-xl bg-primary-container hover:bg-orange-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-primary-container/20 transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Agregar Jugador</span>
          </button>
        </div>
      </div>

      {/* Team Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Puntos Por Partido</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-headline font-black text-primary">77.3</span>
            <span className="text-xs text-emerald-400 font-bold">+4.2</span>
          </div>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Rebotes Totales / G</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-headline font-black text-on-surface">38.5</span>
            <span className="text-xs text-on-surface-variant">REB</span>
          </div>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Asistencias / G</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-headline font-black text-amber-400">19.2</span>
            <span className="text-xs text-on-surface-variant">AST</span>
          </div>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 space-y-1">
          <span className="text-xs text-on-surface-variant font-medium">Efectividad de Tiro</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-headline font-black text-emerald-400">47.8%</span>
            <span className="text-xs text-on-surface-variant">FG%</span>
          </div>
        </div>
      </div>

      {/* Roster & Squad List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Plantilla de Jugadores
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">{jugadores.length} registrados</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jugadores.map((jugador) => (
            <Link
              key={jugador.id}
              to={`/player/${jugador.id}`}
              className="bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest rounded-2xl p-4 flex items-center justify-between transition-all group shadow-sm hover:scale-[1.01]"
            >
              <div className="flex items-center space-x-3.5">
                <div className="relative">
                  <img
                    src={
                      jugador.foto ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                    }
                    alt={jugador.nombreCompleto}
                    className="w-14 h-14 rounded-2xl object-cover border border-surface-container-highest"
                  />
                  <span className="absolute -bottom-1.5 -right-1.5 bg-primary-container text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                    {jugador.numero}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                    {jugador.nombreCompleto}
                  </h3>
                  <span className="text-xs text-on-surface-variant block">
                    {jugador.posicionPrincipal}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] text-on-surface-variant font-medium mt-1">
                    <span>{jugador.ppg ?? 0} PTS</span>
                    <span>•</span>
                    <span>{jugador.rpg ?? 0} REB</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-on-surface-variant/40 group-hover:text-primary transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Match History Table */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-headline font-bold text-on-surface">
              Historial de Partidos
            </h2>
          </div>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl overflow-hidden">
          <div className="divide-y divide-surface-container-highest">
            {initialPartidos.map((match) => (
              <div
                key={match.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-headline font-bold text-sm text-on-surface">
                      vs {match.equipoRival}
                    </span>
                    <span className="text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded text-on-surface-variant">
                      PIN: {match.pin}
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(match.fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="font-headline font-black text-sm text-primary">
                    {match.resultado}
                  </span>
                  <Link
                    to="/match/live"
                    className="text-xs font-bold text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded-lg bg-surface-container"
                  >
                    Ver Ficha
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Registrar Nuevo Jugador
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-surface-container text-on-surface-variant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Stephen Curry"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Número Dorsal
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={99}
                    value={numero}
                    onChange={(e) => setNumero(parseInt(e.target.value, 10))}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-1">
                    Posición
                  </label>
                  <select
                    value={posicionPrincipal}
                    onChange={(e) => setPosicionPrincipal(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Base (PG)">Base (PG)</option>
                    <option value="Escolta (SG)">Escolta (SG)</option>
                    <option value="Alero (SF)">Alero (SF)</option>
                    <option value="Ala-Pívot (PF)">Ala-Pívot (PF)</option>
                    <option value="Pívot (C)">Pívot (C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1">
                  URL de Foto (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/foto.jpg"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-container hover:bg-orange-600 text-white text-xs font-bold shadow"
                >
                  Guardar Jugador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
