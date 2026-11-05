import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BasketballCourt } from "../components/common/BasketballCourt.js";
import { ArrowLeft, Loader2, Award, Activity, Calendar, Target, AlertCircle, Shield } from "lucide-react";
import { api } from "../services/api.js";
import type { Jugador, UbicacionTiro } from "../types/index.js";

export const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerId = id ? parseInt(id, 10) : 0;

  const [player, setPlayer] = useState<Jugador | null>(null);
  const [stats, setStats] = useState<{
    jugador: Jugador;
    partidosJugados: number;
    totalPuntos: number;
    ppg: number;
    rpg: number;
    apg: number;
    spg: number;
    faltas: number;
    totalEventos: number;
    tiros: UbicacionTiro[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!playerId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      try {
        const data = await api.getJugadorStats(playerId);
        setPlayer(data.jugador);
        setStats(data);
      } catch (err) {
        console.error("Error al cargar perfil del jugador:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-on-surface-variant font-medium">Cargando perfil oficial del jugador...</p>
      </div>
    );
  }

  if (notFound || !player) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-headline font-bold text-on-surface">Jugador no encontrado</h2>
        <p className="text-xs text-on-surface-variant">
          El jugador solicitado no existe en la base de datos o no pertenece a tu equipo.
        </p>
        <div className="pt-2">
          <Link
            to="/team"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mi Equipo</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasPlayed = (stats?.partidosJugados || 0) > 0;
  const playerShots = stats?.tiros || [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Back Button */}
      <Link
        to="/team"
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Plantilla</span>
      </Link>

      {/* Player Hero Profile Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-high border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left relative z-10">
          <div className="relative">
            <img
              src={
                player.foto ||
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300&auto=format&fit=crop&q=80"
              }
              alt={player.nombreCompleto}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-primary/50 shadow-2xl p-1"
            />
            <span className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-primary to-orange-600 text-white font-headline font-black text-xl w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              #{player.numero}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                {player.posicionPrincipal}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-surface-container-highest">
                Ficha Oficial
              </span>
              {!hasPlayed && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Sin partidos jugados
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-headline font-black text-on-surface tracking-tight">
              {player.nombreCompleto}
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
              Ficha oficial de rendimiento y estadísticas de juego registradas para este jugador en el sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Core Statistical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center">
          <p className="text-xs font-bold uppercase text-on-surface-variant">Puntos por Partido (PPG)</p>
          <p className="text-3xl font-headline font-black text-primary mt-1">
            {stats?.ppg ?? 0}
          </p>
          <span className="text-[10px] text-on-surface-variant">{stats?.totalPuntos ?? 0} pts totales</span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center">
          <p className="text-xs font-bold uppercase text-on-surface-variant">Rebotes (RPG)</p>
          <p className="text-3xl font-headline font-black text-on-surface mt-1">
            {stats?.rpg ?? 0}
          </p>
          <span className="text-[10px] text-on-surface-variant">Promedio por juego</span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center">
          <p className="text-xs font-bold uppercase text-on-surface-variant">Asistencias (APG)</p>
          <p className="text-3xl font-headline font-black text-on-surface mt-1">
            {stats?.apg ?? 0}
          </p>
          <span className="text-[10px] text-on-surface-variant">Visión de cancha</span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center">
          <p className="text-xs font-bold uppercase text-on-surface-variant">Partidos Jugados</p>
          <p className={`text-3xl font-headline font-black mt-1 ${hasPlayed ? "text-emerald-400" : "text-on-surface-variant/60"}`}>
            {stats?.partidosJugados ?? 0}
          </p>
          <span className="text-[10px] text-on-surface-variant">{stats?.totalEventos ?? 0} eventos registrados</span>
        </div>
      </div>

      {/* Shot Chart Section */}
      <div className="bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Carta de Tiro (Shot Chart)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Distribución de lanzamientos registrados sobre la cancha
            </p>
          </div>
        </div>

        {playerShots.length > 0 ? (
          <div className="flex justify-center p-4 bg-surface-container rounded-2xl">
            <div className="w-full max-w-lg aspect-[50/47]">
              <BasketballCourt shots={playerShots} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-container rounded-2xl border border-surface-container-highest space-y-2">
            <Target className="w-8 h-8 text-on-surface-variant/40" />
            <p className="text-sm font-bold text-on-surface">Sin tiros registrados</p>
            <p className="text-xs text-on-surface-variant max-w-sm">
              {hasPlayed
                ? "Este jugador participó en partidos pero aún no cuenta con tiros registrados sobre el mapa de la cancha."
                : "Este jugador aún no ha disputado ningún partido oficial."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
