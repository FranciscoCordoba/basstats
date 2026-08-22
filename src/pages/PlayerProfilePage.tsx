import React from "react";
import { useParams, Link } from "react-router-dom";
import { initialJugadores, mockShotLocations, initialPartidos } from "../data/mockData.js";
import { BasketballCourt } from "../components/common/BasketballCourt.js";
import {
  ArrowLeft,
  Flame,
  Award,
  Activity,
  Calendar,
  Target,
  BarChart2,
} from "lucide-react";

export const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const playerId = id ? parseInt(id, 10) : 1;

  const player = initialJugadores.find((j) => j.id === playerId) || initialJugadores[0];

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
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"
              }
              alt={player.nombreCompleto}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl object-cover border-2 border-primary/50 shadow-2xl p-1"
            />
            <span className="absolute -bottom-2 -right-2 bg-gradient-to-tr from-primary-container to-surface-tint text-white font-headline font-black text-xl w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">
              #{player.numero}
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-primary-container/20 text-primary-container border border-primary-container/30">
                {player.posicionPrincipal}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-surface-container-highest">
                Los Cóndores BC
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-headline font-black text-on-surface tracking-tight">
              {player.nombreCompleto}
            </h1>

            <p className="text-xs sm:text-sm text-on-surface-variant max-w-xl">
              Titular indiscutido del equipo. Destacado por su visión de juego perimetral y efectividad en tiros de media y larga distancia.
            </p>
          </div>
        </div>
      </div>

      {/* Core Statistical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            PTS / G
          </span>
          <span className="text-2xl font-headline font-black text-primary">
            {player.ppg}
          </span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            REB / G
          </span>
          <span className="text-2xl font-headline font-black text-on-surface">
            {player.rpg}
          </span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            AST / G
          </span>
          <span className="text-2xl font-headline font-black text-amber-400">
            {player.apg}
          </span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            ROB / G
          </span>
          <span className="text-2xl font-headline font-black text-sky-400">
            {player.spg ?? 1.2}
          </span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            TAP / G
          </span>
          <span className="text-2xl font-headline font-black text-purple-400">
            {player.bpg ?? 0.5}
          </span>
        </div>

        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 text-center space-y-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
            FG %
          </span>
          <span className="text-2xl font-headline font-black text-emerald-400">
            {player.fgPercentage ?? 48.2}%
          </span>
        </div>
      </div>

      {/* Shot Chart & Game Log Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Shot Chart */}
        <div className="lg:col-span-6 bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              Mapa de Tiros de Temporada (Shot Chart)
            </h3>
            <div className="flex items-center space-x-3 text-[10px] font-semibold text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Anotado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> Fallado
              </span>
            </div>
          </div>

          <BasketballCourt shots={mockShotLocations} />
        </div>

        {/* Recent Matches Log */}
        <div className="lg:col-span-6 bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              Desglose de Últimos Partidos
            </h3>
          </div>

          <div className="divide-y divide-surface-container-highest">
            {initialPartidos.map((match) => (
              <div key={match.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-on-surface block">vs {match.equipoRival}</span>
                  <span className="text-on-surface-variant text-[11px]">
                    {new Date(match.fecha).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-headline font-bold text-primary text-sm">22 PTS</span>
                    <span className="text-[10px] block text-on-surface-variant">6 REB • 7 AST</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold text-[10px]">
                    W
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
