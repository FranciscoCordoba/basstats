import React, { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import { useMatch } from "../context/MatchContext.js";
import { BasketballCourt } from "../components/common/BasketballCourt.js";
import {
  Trophy,
  ArrowLeft,
  Target,
  Flame,
  Shield,
  Activity,
  Award,
  BarChart3,
  RotateCcw,
  Sparkles,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import type { Jugador, UbicacionTiro } from "../types/index.js";

export interface PlayerMatchStats {
  jugador: Jugador;
  pts: number;
  fgm: number;
  fga: number;
  fgPct: number;
  twoPm: number;
  twoPa: number;
  twoPct: number;
  threePm: number;
  threePa: number;
  threePct: number;
  ftm: number;
  fta: number;
  ftPct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  pf: number;
  shots: UbicacionTiro[];
}

export const MatchSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const { matchState } = useMatch();
  const tableExportRef = useRef<HTMLDivElement | null>(null);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Combine all active and bench players
  const allPlayers = useMemo(() => {
    const combined = [...matchState.jugadoresEnCancha, ...matchState.jugadoresBanca];
    const uniqueMap = new Map<number, Jugador>();
    combined.forEach((p) => uniqueMap.set(p.id, p));
    return Array.from(uniqueMap.values());
  }, [matchState.jugadoresEnCancha, matchState.jugadoresBanca]);

  const [selectedPlayerId, setSelectedPlayerId] = useState<number>(() => {
    return allPlayers[0]?.id || 1;
  });

  // Calculate detailed stats per player (without eff and without turnovers)
  const playerStatsList = useMemo<PlayerMatchStats[]>(() => {
    return allPlayers.map((player) => {
      let pts = 0;
      let fgm = 0;
      let fga = 0;
      let twoPm = 0;
      let twoPa = 0;
      let threePm = 0;
      let threePa = 0;
      let ftm = 0;
      let fta = 0;
      let oreb = 0;
      let dreb = 0;
      let ast = 0;
      let stl = 0;
      let blk = 0;
      let pf = 0;

      const playerEvents = matchState.eventos.filter((e) => e.idJugador === player.id);

      playerEvents.forEach((ev) => {
        const action = ev.accionNombre?.toLowerCase() || "";
        if (action.includes("triple anotado")) {
          pts += 3;
          threePm += 1;
          threePa += 1;
          fgm += 1;
          fga += 1;
        } else if (action.includes("triple fallado")) {
          threePa += 1;
          fga += 1;
        } else if (action.includes("tiro 2 anotado")) {
          pts += 2;
          twoPm += 1;
          twoPa += 1;
          fgm += 1;
          fga += 1;
        } else if (action.includes("tiro 2 fallado")) {
          twoPa += 1;
          fga += 1;
        } else if (action.includes("tiro libre anotado")) {
          pts += 1;
          ftm += 1;
          fta += 1;
        } else if (action.includes("tiro libre fallado")) {
          fta += 1;
        } else if (action.includes("rebote ofensivo")) {
          oreb += 1;
        } else if (action.includes("rebote defensivo")) {
          dreb += 1;
        } else if (action.includes("asistencia")) {
          ast += 1;
        } else if (action.includes("robo")) {
          stl += 1;
        } else if (action.includes("bloqueo") || action.includes("tapón") || action.includes("tapon")) {
          blk += 1;
        } else if (action.includes("falta")) {
          pf += 1;
        }
      });

      const playerShots = matchState.tiros.filter(
        (t) => t.idJugador === player.id || playerEvents.some((e) => e.id === t.idEvento)
      );

      const reb = oreb + dreb;
      const fgPct = fga > 0 ? Math.round((fgm / fga) * 100) : 0;
      const twoPct = twoPa > 0 ? Math.round((twoPm / twoPa) * 100) : 0;
      const threePct = threePa > 0 ? Math.round((threePm / threePa) * 100) : 0;
      const ftPct = fta > 0 ? Math.round((ftm / fta) * 100) : 0;

      return {
        jugador: player,
        pts,
        fgm,
        fga,
        fgPct,
        twoPm,
        twoPa,
        twoPct,
        threePm,
        threePa,
        threePct,
        ftm,
        fta,
        ftPct,
        oreb,
        dreb,
        reb,
        ast,
        stl,
        blk,
        pf,
        shots: playerShots,
      };
    });
  }, [allPlayers, matchState.eventos, matchState.tiros]);

  // Team totals
  const teamTotals = useMemo(() => {
    return playerStatsList.reduce(
      (acc, curr) => ({
        pts: acc.pts + curr.pts,
        fgm: acc.fgm + curr.fgm,
        fga: acc.fga + curr.fga,
        twoPm: acc.twoPm + curr.twoPm,
        twoPa: acc.twoPa + curr.twoPa,
        threePm: acc.threePm + curr.threePm,
        threePa: acc.threePa + curr.threePa,
        ftm: acc.ftm + curr.ftm,
        fta: acc.fta + curr.fta,
        oreb: acc.oreb + curr.oreb,
        dreb: acc.dreb + curr.dreb,
        reb: acc.reb + curr.reb,
        ast: acc.ast + curr.ast,
        stl: acc.stl + curr.stl,
        blk: acc.blk + curr.blk,
        pf: acc.pf + curr.pf,
      }),
      {
        pts: 0,
        fgm: 0,
        fga: 0,
        twoPm: 0,
        twoPa: 0,
        threePm: 0,
        threePa: 0,
        ftm: 0,
        fta: 0,
        oreb: 0,
        dreb: 0,
        reb: 0,
        ast: 0,
        stl: 0,
        blk: 0,
        pf: 0,
      }
    );
  }, [playerStatsList]);

  // Selected player stats
  const activePlayerStats = useMemo(() => {
    return playerStatsList.find((p) => p.jugador.id === selectedPlayerId) || playerStatsList[0];
  }, [playerStatsList, selectedPlayerId]);

  // Events of selected player
  const activePlayerEvents = useMemo(() => {
    if (!activePlayerStats) return [];
    return matchState.eventos.filter((e) => e.idJugador === activePlayerStats.jugador.id);
  }, [matchState.eventos, activePlayerStats]);

  const isLocalWinner = matchState.puntosLocal >= matchState.puntosRival;

  // Export Box Score table as image for mobile and desktop
  const handleExportImage = async () => {
    if (!tableExportRef.current || isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const dataUrl = await toPng(tableExportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#101415",
      });

      const fileName = `BasStats-${matchState.equipoLocal}-vs-${matchState.equipoRival}.png`.replace(/\s+/g, "_");

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Estadísticas: ${matchState.equipoLocal} vs ${matchState.equipoRival}`,
            text: `Box Score final del partido: ${matchState.equipoLocal} (${matchState.puntosLocal}) vs ${matchState.equipoRival} (${matchState.puntosRival})`,
          });
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 3000);
          setIsExporting(false);
          return;
        } catch (shareErr) {
          console.log("Share dismissed, downloading instead...", shareErr);
        }
      }

      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Error exporting boxscore image", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <Link
          to="/match/live"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-colors bg-surface-container px-3 py-1.5 rounded-xl border border-surface-container-highest"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Partido</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-primary/40 hover:bg-primary-container/20 text-primary font-bold text-xs shadow flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
            title="Descargar o compartir imagen de la tabla"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generando...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Imagen Lista!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Imagen Tabla</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate("/roster")}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 text-white font-headline font-black text-xs shadow flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Nuevo Partido</span>
          </button>
        </div>
      </div>

      {/* Match Result Compact Banner */}
      <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col items-center justify-between gap-3">
          {/* Local Team */}
          <div className="flex items-center space-x-3 text-left">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary-container to-orange-700 flex items-center justify-center text-white font-black font-headline text-base shadow">
              VTC
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-headline font-black text-on-surface leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                {matchState.equipoLocal}
              </h3>
              <span className="text-[11px] text-on-surface-variant">Faltas: {matchState.faltasLocal}</span>
            </div>
          </div>

          {/* Final Score Center */}
          <div className="flex flex-col items-center justify-center bg-surface-container px-4 py-1.5 rounded-xl border border-surface-container-highest">
            <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Final
            </span>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl sm:text-3xl font-headline font-black ${isLocalWinner ? "text-primary" : "text-on-surface"}`}>
                {matchState.puntosLocal}
              </span>
              <span className="text-lg font-bold text-on-surface-variant/40">-</span>
              <span className={`text-2xl sm:text-3xl font-headline font-black ${!isLocalWinner ? "text-primary" : "text-on-surface-variant"}`}>
                {matchState.puntosRival}
              </span>
            </div>
          </div>

          {/* Rival Team */}
          <div className="flex items-center space-x-3 text-right flex-row-reverse">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-surface-container-highest border border-surface-container flex items-center justify-center text-on-surface-variant font-black font-headline text-base shadow">
              RIV
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-headline font-black text-on-surface leading-tight truncate max-w-[120px] sm:max-w-[180px]">
                {matchState.equipoRival}
              </h3>
              <span className="text-[11px] text-on-surface-variant">Faltas: {matchState.faltasRival}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Individual Player Detailed Analysis & Shot Chart */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-headline font-black text-on-surface flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-primary" />
            Reporte Individual por Jugador
          </h2>
          <span className="text-[11px] text-on-surface-variant">Toca un jugador</span>
        </div>

        {/* Player Selector Strip (Horizontal Scroll for easy mobile touch) */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
          {playerStatsList.map((ps) => {
            const isSelected = ps.jugador.id === activePlayerStats?.jugador.id;
            return (
              <button
                key={ps.jugador.id}
                onClick={() => setSelectedPlayerId(ps.jugador.id)}
                className={`flex-shrink-0 min-w-[110px] sm:min-w-[130px] p-2.5 rounded-xl border text-left transition-all snap-start ${isSelected
                    ? "bg-primary-container/20 border-primary ring-1 ring-primary/40 shadow-md"
                    : "bg-surface-container-high border-surface-container-highest hover:bg-surface-container-highest/60"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-black font-headline text-primary">
                    #{ps.jugador.numero}
                  </span>
                  <span className="text-[11px] font-black text-on-surface bg-surface-container px-1.5 py-0.5 rounded">
                    {ps.pts} PTS
                  </span>
                </div>
                <h4 className="font-bold text-xs text-on-surface truncate mt-1">
                  {ps.jugador.nombreCompleto}
                </h4>
                <span className="text-[10px] text-on-surface-variant block truncate">
                  {ps.jugador.posicionPrincipal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Player Detailed Stats & Shot Map Grid */}
        {activePlayerStats && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left: Player Shot Chart Map */}
            <div className="lg:col-span-5 bg-surface-container-high border border-surface-container-highest rounded-2xl p-3.5 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-xs text-on-surface flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    Mapa de Tiros
                  </h3>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    #{activePlayerStats.jugador.numero} {activePlayerStats.jugador.nombreCompleto}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    {activePlayerStats.fgm} Anot.
                  </span>
                  <span className="flex items-center gap-1 text-red-400 bg-red-950/40 px-1.5 py-0.5 rounded border border-red-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                    {activePlayerStats.fga - activePlayerStats.fgm} Fall.
                  </span>
                </div>
              </div>

              {/* Court */}
              <div className="w-full">
                <BasketballCourt shots={activePlayerStats.shots} interactive={false} />
              </div>

              {/* Shot Summary Metrics */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-surface-container p-1.5 rounded-lg border border-surface-container-highest">
                  <span className="text-[9px] text-on-surface-variant font-bold block uppercase">
                    TC Total
                  </span>
                  <span className="text-xs font-black text-on-surface">
                    {activePlayerStats.fgm}/{activePlayerStats.fga}
                  </span>
                  <span className="text-[10px] font-bold text-primary block">
                    {activePlayerStats.fgPct}%
                  </span>
                </div>

                <div className="bg-surface-container p-1.5 rounded-lg border border-surface-container-highest">
                  <span className="text-[9px] text-on-surface-variant font-bold block uppercase">
                    Tiros 2P
                  </span>
                  <span className="text-xs font-black text-on-surface">
                    {activePlayerStats.twoPm}/{activePlayerStats.twoPa}
                  </span>
                  <span className="text-[10px] font-bold text-primary block">
                    {activePlayerStats.twoPct}%
                  </span>
                </div>

                <div className="bg-surface-container p-1.5 rounded-lg border border-surface-container-highest">
                  <span className="text-[9px] text-on-surface-variant font-bold block uppercase">
                    Triples 3P
                  </span>
                  <span className="text-xs font-black text-on-surface">
                    {activePlayerStats.threePm}/{activePlayerStats.threePa}
                  </span>
                  <span className="text-[10px] font-bold text-primary block">
                    {activePlayerStats.threePct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Detailed Player KPI Grid & Event Timeline */}
            <div className="lg:col-span-7 space-y-3">
              {/* Main KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-on-surface-variant uppercase flex items-center gap-1">
                    <Flame className="w-3 h-3 text-primary" /> Puntos
                  </span>
                  <div className="mt-0.5">
                    <span className="text-2xl font-headline font-black text-primary">
                      {activePlayerStats.pts}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-on-surface-variant uppercase flex items-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> Asistencias
                  </span>
                  <div className="mt-0.5">
                    <span className="text-2xl font-headline font-black text-amber-400">
                      {activePlayerStats.ast}
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-on-surface-variant uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3 text-sky-400" /> Rebotes
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="text-2xl font-headline font-black text-sky-400">
                      {activePlayerStats.reb}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {activePlayerStats.oreb}O / {activePlayerStats.dreb}D
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] font-extrabold text-on-surface-variant uppercase flex items-center gap-1">
                    <Activity className="w-3 h-3 text-purple-400" /> Robos / Tapas
                  </span>
                  <div className="mt-0.5 flex items-baseline justify-between">
                    <span className="text-2xl font-headline font-black text-purple-400">
                      {activePlayerStats.stl}
                    </span>
                    <span className="text-xs text-on-surface-variant font-semibold">
                      {activePlayerStats.blk} Tapas
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary Stats Grid: Free throws & Fouls */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase block">
                    Tiros Libres
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-base font-black text-on-surface">
                      {activePlayerStats.ftm}/{activePlayerStats.fta}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {activePlayerStats.ftPct}%
                    </span>
                  </div>
                </div>

                <div className="bg-surface-container-high border border-surface-container-highest p-3 rounded-xl shadow-sm">
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase block">
                    Faltas Personales
                  </span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-base font-black text-error">
                      {activePlayerStats.pf}
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      {activePlayerStats.pf >= 5 ? "Límite alcanzado" : "Cometidas"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Timeline / Game Log */}
              <div className="bg-surface-container-high border border-surface-container-highest rounded-xl p-3 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-extrabold uppercase text-on-surface-variant tracking-wider">
                    Secuencia de Acciones
                  </h4>
                  <span className="text-primary font-bold text-xs">{activePlayerEvents.length} eventos</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {activePlayerEvents.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/70 italic py-2 text-center">
                      No hay eventos registrados para este jugador.
                    </p>
                  ) : (
                    activePlayerEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-surface-container border border-surface-container-highest text-xs"
                      >
                        <span className="font-mono text-on-surface-variant text-[10px]">
                          Q{ev.cuarto} • {ev.createdAt}
                        </span>
                        <span className="font-bold text-on-surface">{ev.accionNombre}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Box Score Table Section (Exportable as Image) */}
      <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-3.5 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm sm:text-base font-headline font-black text-on-surface">
              Tabla General (Box Score)
            </h2>
          </div>

          <button
            onClick={handleExportImage}
            disabled={isExporting}
            className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-highest border border-surface-container-highest text-primary text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            {isExporting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Exportar Imagen</span>
          </button>
        </div>

        {/* Printable / Capture Canvas Container */}
        <div ref={tableExportRef} className="bg-surface-container-high p-2 sm:p-4 rounded-xl">
          {/* Card Header for Image Export branding */}
          <div className="flex items-center justify-between border-b border-surface-container-highest pb-2.5 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-headline font-black text-primary tracking-wider uppercase">BasStats</span>
              <span className="text-xs text-on-surface-variant font-bold">• Resumen del Partido</span>
            </div>
            <div className="text-xs font-headline font-black text-on-surface">
              {matchState.equipoLocal} <span className="text-primary">{matchState.puntosLocal}</span> - <span className="text-on-surface-variant">{matchState.puntosRival}</span> {matchState.equipoRival}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[580px]">
              <thead>
                <tr className="border-b border-surface-container-highest text-on-surface-variant uppercase font-bold text-[10px]">
                  <th className="py-2 px-2.5">Jugador</th>
                  <th className="py-2 px-1.5 text-center font-black text-primary">PTS</th>
                  <th className="py-2 px-1.5 text-center">TC (M/A)</th>
                  <th className="py-2 px-1.5 text-center">%TC</th>
                  <th className="py-2 px-1.5 text-center">2P (M/A)</th>
                  <th className="py-2 px-1.5 text-center">%2P</th>
                  <th className="py-2 px-1.5 text-center">3P (M/A)</th>
                  <th className="py-2 px-1.5 text-center">%3P</th>
                  <th className="py-2 px-1.5 text-center">TL (M/A)</th>
                  <th className="py-2 px-1.5 text-center">%TL</th>
                  <th className="py-2 px-1.5 text-center">REB (O/D)</th>
                  <th className="py-2 px-1.5 text-center">AST</th>
                  <th className="py-2 px-1.5 text-center">ROB</th>
                  <th className="py-2 px-1.5 text-center">TAP</th>
                  <th className="py-2 px-1.5 text-center">FAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest">
                {playerStatsList.map((p) => {
                  const isSelected = p.jugador.id === activePlayerStats?.jugador.id;
                  return (
                    <tr
                      key={p.jugador.id}
                      onClick={() => setSelectedPlayerId(p.jugador.id)}
                      className={`cursor-pointer transition-colors ${isSelected
                          ? "bg-primary-container/15 font-bold"
                          : "hover:bg-surface-container-highest/50"
                        }`}
                    >
                      <td className="py-2 px-2.5 flex items-center space-x-1.5">
                        <span className="font-headline font-black text-primary text-xs">
                          #{p.jugador.numero}
                        </span>
                        <span className="text-on-surface truncate max-w-[130px]">{p.jugador.nombreCompleto}</span>
                      </td>
                      <td className="py-2 px-1.5 text-center font-black text-primary text-sm">
                        {p.pts}
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface">
                        {p.fgm}/{p.fga}
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface-variant font-semibold">
                        {p.fgPct}%
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface">
                        {p.twoPm}/{p.twoPa}
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface-variant font-semibold">
                        {p.twoPct}%
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface">
                        {p.threePm}/{p.threePa}
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface-variant font-semibold">
                        {p.threePct}%
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface">
                        {p.ftm}/{p.fta}
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface-variant font-semibold">
                        {p.ftPct}%
                      </td>
                      <td className="py-2 px-1.5 text-center text-on-surface">
                        <span className="font-bold">{p.reb}</span>{" "}
                        <span className="text-[9px] text-on-surface-variant">
                          ({p.oreb}/{p.dreb})
                        </span>
                      </td>
                      <td className="py-2 px-1.5 text-center text-amber-400 font-bold">{p.ast}</td>
                      <td className="py-2 px-1.5 text-center text-sky-400 font-bold">{p.stl}</td>
                      <td className="py-2 px-1.5 text-center text-purple-400 font-bold">{p.blk}</td>
                      <td className="py-2 px-1.5 text-center text-error font-bold">{p.pf}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary/40 bg-surface-container font-black text-on-surface">
                  <td className="py-2.5 px-2.5 uppercase text-[11px]">Totales</td>
                  <td className="py-2.5 px-1.5 text-center text-primary text-sm font-black">
                    {teamTotals.pts}
                  </td>
                  <td className="py-2.5 px-1.5 text-center">
                    {teamTotals.fgm}/{teamTotals.fga}
                  </td>
                  <td className="py-2.5 px-1.5 text-center text-on-surface-variant">
                    {teamTotals.fga > 0 ? Math.round((teamTotals.fgm / teamTotals.fga) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-1.5 text-center">
                    {teamTotals.twoPm}/{teamTotals.twoPa}
                  </td>
                  <td className="py-2.5 px-1.5 text-center text-on-surface-variant">
                    {teamTotals.twoPa > 0 ? Math.round((teamTotals.twoPm / teamTotals.twoPa) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-1.5 text-center">
                    {teamTotals.threePm}/{teamTotals.threePa}
                  </td>
                  <td className="py-2.5 px-1.5 text-center text-on-surface-variant">
                    {teamTotals.threePa > 0 ? Math.round((teamTotals.threePm / teamTotals.threePa) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-1.5 text-center">
                    {teamTotals.ftm}/{teamTotals.fta}
                  </td>
                  <td className="py-2.5 px-1.5 text-center text-on-surface-variant">
                    {teamTotals.fta > 0 ? Math.round((teamTotals.ftm / teamTotals.fta) * 100) : 0}%
                  </td>
                  <td className="py-2.5 px-1.5 text-center">
                    {teamTotals.reb} ({teamTotals.oreb}/{teamTotals.dreb})
                  </td>
                  <td className="py-2.5 px-1.5 text-center text-amber-400">{teamTotals.ast}</td>
                  <td className="py-2.5 px-1.5 text-center text-sky-400">{teamTotals.stl}</td>
                  <td className="py-2.5 px-1.5 text-center text-purple-400">{teamTotals.blk}</td>
                  <td className="py-2.5 px-1.5 text-center text-error">{teamTotals.pf}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
