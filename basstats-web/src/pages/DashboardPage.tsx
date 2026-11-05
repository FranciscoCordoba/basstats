import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { useMatch } from "../context/MatchContext.js";
import {
  PlusCircle,
  Users,
  Shield,
  Trophy,
  ChevronRight,
  TrendingUp,
  Radio,
  Flame,
  Activity,
  ShieldAlert,
  Calendar,
  UserPlus,
} from "lucide-react";
import { api } from "../services/api.js";
import type { Partido, Jugador } from "../types/index.js";

export const DashboardPage: React.FC = () => {
  const { user, isAdmin, currentTeam } = useAuth();
  const { matchState } = useMatch();

  const [recentMatches, setRecentMatches] = useState<Partido[]>([]);
  const [topJugadores, setTopJugadores] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentTeam?.id) {
        setLoading(false);
        return;
      }
      try {
        const [partidosRes, jugadoresRes] = await Promise.all([
          api.getPartidos(1, 5, currentTeam.id),
          api.getJugadores(1, 10, currentTeam.id),
        ]);
        if (partidosRes.items) setRecentMatches(partidosRes.items);
        if (jugadoresRes.items) setTopJugadores(jugadoresRes.items);
      } catch (e) {
        console.warn("Error al cargar datos del dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [currentTeam?.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Admin Highlight Banner if logged in as Administrador */}
      {isAdmin && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/60 via-surface-container-high to-surface-container border border-red-500/40 p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-red-400">
                  Acceso Especial • Rol Administrador
                </span>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  Panel de Administración de Liga Activo
                </h3>
              </div>
            </div>
            <Link
              to="/admin"
              className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95"
            >
              <span>Abrir Panel de Control</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Primary Call To Action */}
        <Link
          to="/roster"
          className="md:col-span-12 lg:col-span-6 bg-gradient-to-br from-primary to-orange-700 text-white rounded-3xl p-7 flex flex-col justify-between shadow-xl shadow-primary/20 hover:shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all group min-h-[160px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              Planilla Digital en Vivo
            </span>
            <PlusCircle className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight">
              Cargar Nuevo Partido
            </h2>
            <p className="text-sm text-white/80 font-medium mt-1">
              Configura titulares y registra estadísticas interactivas sobre la cancha
            </p>
          </div>
        </Link>

        {/* Secondary Quick Actions */}
        <div className="md:col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
          <Link
            to="/team"
            className="bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest rounded-3xl p-5 flex flex-col justify-between transition-all group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Mi Equipo</h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>Gestión de Plantel & ABM</span>
              </p>
            </div>
          </Link>

          <Link
            to="/match/live"
            className="bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest rounded-3xl p-5 flex flex-col justify-between transition-all group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Consola en Vivo</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Marcador y tiros en cancha
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Recent Matches & Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Matches Table / Cards */}
        <section className="lg:col-span-7 bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
            <div className="flex items-center space-x-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Historial de Partidos</span>
            </div>
            <Link to="/roster" className="text-xs font-bold text-primary hover:underline">
              + Nuevo Encuentro
            </Link>
          </div>

          {recentMatches.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant space-y-2">
              <p className="font-bold text-on-surface">No hay partidos registrados aún</p>
              <p>Comienza configurando tu primer encuentro desde el botón principal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-2xl bg-surface-container border border-surface-container-highest flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center font-bold text-xs text-primary">
                      VS
                    </div>
                    <div>
                      <p className="font-bold text-sm text-on-surface">
                        {currentTeam.nombre} <span className="text-primary font-normal">vs</span> {m.equipoRival}
                      </p>
                      <p className="text-[10px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(m.fecha).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {m.resultado ? (
                      <span className="font-headline font-black text-sm text-on-surface px-2.5 py-1 rounded-lg bg-surface-container-highest">
                        {m.resultado}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                        En Juego
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Performers Card */}
        <section className="lg:col-span-5 bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-highest">
            <div className="flex items-center space-x-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <Flame className="w-4 h-4 text-primary" />
              <span>Plantel del Equipo</span>
            </div>
            <Link to="/team" className="text-xs font-bold text-primary hover:underline">
              Gestionar
            </Link>
          </div>

          {topJugadores.length === 0 ? (
            <div className="py-12 text-center text-xs text-on-surface-variant space-y-3">
              <p className="font-bold text-on-surface">No hay jugadores registrados</p>
              <p className="max-w-xs mx-auto">Agrega los jugadores de tu plantel en la sección de tu equipo.</p>
              <Link
                to="/team"
                className="inline-flex items-center space-x-1.5 bg-primary/20 text-primary hover:bg-primary/30 font-bold px-3 py-1.5 rounded-xl border border-primary/30"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Agregar Jugadores</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topJugadores.slice(0, 4).map((player) => (
                <Link
                  key={player.id}
                  to={`/player/${player.id}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-container hover:bg-surface-container-highest border border-transparent hover:border-surface-container-highest transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={
                          player.foto ||
                          "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80"
                        }
                        alt={player.nombreCompleto}
                        className="w-10 h-10 rounded-xl object-cover border border-surface-container-highest"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-surface-container-highest text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-surface-container">
                        #{player.numero}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
                        {player.nombreCompleto}
                      </h4>
                      <span className="text-xs text-on-surface-variant">{player.posicionPrincipal}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
