import React from "react";
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
} from "lucide-react";
import { initialJugadores } from "../data/mockData.js";

export const DashboardPage: React.FC = () => {
  //const { currentTeam } = useAuth();
  //const { matchState } = useMatch();

  const topScorers = [...initialJugadores].sort((a, b) => (b.ppg || 0) - (a.ppg || 0)).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Live Match Alert (If Active) */}
      {/*
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-container/20 via-surface-container-high to-surface-container border border-primary-container/40 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-primary-container">
                  En Vivo • Q{matchState.cuarto}
                </span>
              </div>
              <h3 className="text-lg font-headline font-bold text-on-surface">
                {matchState.equipoLocal} vs {matchState.equipoRival}
              </h3>
            </div>
          </div>
          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-2xl font-black font-headline text-primary">
                {matchState.puntosLocal} - {matchState.puntosRival}
              </span>
            </div>
            <Link
              to="/match/live"
              className="bg-primary-container hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Abrir Consola</span>
            </Link>
          </div>
        </div>
      </div>
      */}
      {/* Main Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Primary Call To Action */}
        <Link
          to="/roster"
          className="md:col-span-12 lg:col-span-6 bg-gradient-to-br from-primary-container to-orange-700 text-white rounded-2xl p-7 flex flex-col justify-between shadow-xl shadow-primary-container/20 hover:shadow-orange-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all group min-h-[160px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              Planilla Digital
            </span>
            <PlusCircle className="w-8 h-8 text-white group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <div>
            <h2 className="text-2xl font-headline font-extrabold tracking-tight">
              Cargar Nuevo Partido
            </h2>
            <p className="text-sm text-white/80 font-medium mt-1">
              Selecciona los 5 titulares y comienza a registrar estadísticas en vivo
            </p>
          </div>
        </Link>

        {/* Secondary Quick Actions */}
        {/* <div className="md:col-span-12 lg:col-span-6 grid grid-cols-2 gap-4">
          <Link
            to="/team"
            className="bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest rounded-2xl p-5 flex flex-col justify-between transition-all group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Mi Equipo</h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                <Users className="w-3.5 h-3.5 text-primary" />
                <span>{initialJugadores.length} Jugadores</span>
              </p>
            </div>
          </Link>

          <Link
            to="/roster"
            className="bg-surface-container-high hover:bg-surface-container-highest border border-surface-container-highest rounded-2xl p-5 flex flex-col justify-between transition-all group min-h-[160px]"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">Roster Activo</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Alineaciones y dorsales
              </p>
            </div>
          </Link>
        </div> */}
      </section>

      {/* Last Result & Stats Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Match Result Card */}
        {/*
        <section className="lg:col-span-7 bg-surface-container-high border border-surface-container-highest rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-surface-container-highest">
            <div className="flex items-center space-x-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Último Partido Jugado</span>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-xs font-bold">
              Victoria
            </span>
          </div>

          <div className="py-6 flex items-center justify-around">
            <div className="flex flex-col items-center text-center space-y-2">
              <img
                src={currentTeam.logo || "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80"}
                alt={currentTeam.nombre}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/40 p-1"
              />
              <span className="font-headline font-bold text-sm text-on-surface">
                {currentTeam.nombre}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-headline font-black text-primary">88</span>
                <span className="text-2xl font-bold text-on-surface-variant">-</span>
                <span className="text-4xl font-headline font-black text-on-surface-variant/60">82</span>
              </div>
              <span className="text-xs text-on-surface-variant/70 mt-1 font-medium">14 Ago 2026</span>
            </div>

            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-surface-container border-2 border-surface-container-highest flex items-center justify-center text-lg font-black text-on-surface-variant">
                VIK
              </div>
              <span className="font-headline font-bold text-sm text-on-surface-variant">
                Vikingos BC
              </span>
            </div>
          </div>

          <div className="mt-2 pt-4 border-t border-surface-container-highest flex items-center justify-between text-xs text-on-surface-variant">
            <span>MVP del Partido: <strong className="text-on-surface">Lucas Rodríguez (28 pts)</strong></span>
            <Link to="/player/2" className="text-primary font-bold hover:underline flex items-center">
              Ver Detalle <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
        */}
        {/* Top Performers Card */}
        {/*
        <section className="lg:col-span-5 bg-surface-container-high border border-surface-container-highest rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-primary" />
              <h3 className="font-headline font-bold text-base text-on-surface">
                Líderes Anotadores
              </h3>
            </div>
            <span className="text-xs text-on-surface-variant">Promedio / Partido</span>
          </div>

          <div className="space-y-3">
            {topScorers.map((player, index) => (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-highest border border-transparent hover:border-surface-container-highest transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={player.foto || ""}
                      alt={player.nombreCompleto}
                      className="w-10 h-10 rounded-full object-cover border border-surface-container-highest"
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
                <div className="text-right">
                  <span className="text-base font-black font-headline text-primary">
                    {player.ppg}
                  </span>
                  <span className="text-[10px] block text-on-surface-variant">PTS</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        */}
      </div>
    </div>
  );
};
