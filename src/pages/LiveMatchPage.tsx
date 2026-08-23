import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../context/MatchContext.js";
import { BasketballCourt } from "../components/common/BasketballCourt.js";
import {
  RotateCcw,
  Play,
  Pause,
  Plus,
  Minus,
  UserCheck,
  ChevronRight,
  Sparkles,
  ArrowRightLeft,
  Flame,
  ShieldAlert,
  Eye,
  EyeOff,
  Layers,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import type { Jugador } from "../types/index.js";

export const LiveMatchPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    matchState,
    selectedPlayer,
    setSelectedPlayer,
    activeQuarter,
    setActiveQuarter,
    recordStat,
    substitutePlayer,
    incrementRivalScore,
    decrementRivalScore,
    undoLastEvent,
  } = useMatch();

  const [pendingShotCoord, setPendingShotCoord] = useState<{ x: number; y: number } | null>(null);
  const [showSubModal, setShowSubModal] = useState<boolean>(false);
  const [subOutPlayer, setSubOutPlayer] = useState<Jugador | null>(null);
  const [showShots, setShowShots] = useState<boolean>(true);
  const [filterByPlayer, setFilterByPlayer] = useState<boolean>(true);
  const [showEndMatchModal, setShowEndMatchModal] = useState<boolean>(false);

  const displayedShots = React.useMemo(() => {
    if (!showShots) return [];
    if (filterByPlayer && selectedPlayer) {
      return matchState.tiros.filter((shot) => {
        if (shot.idJugador !== undefined) {
          return shot.idJugador === selectedPlayer.id;
        }
        const ev = matchState.eventos.find((e) => e.id === shot.idEvento);
        return ev ? ev.idJugador === selectedPlayer.id : false;
      });
    }
    return matchState.tiros;
  }, [showShots, filterByPlayer, selectedPlayer, matchState.tiros, matchState.eventos]);

  const handleCourtClick = (coords: { x: number; y: number }) => {
    setPendingShotCoord(coords);
  };

  const handleAction = async (statId: number, statName: string, points: number = 0) => {
    if (!selectedPlayer) return;

    await recordStat(statId, statName, points, pendingShotCoord || undefined);
    setPendingShotCoord(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 space-y-4">
      {/* Top Match Bar / Scoreboard */}
      <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col items-center justify-between gap-4">
          {/* Team Scores */}
          <div className="flex items-center justify-between w-full md:w-auto md:space-x-8">
            {/* Home Team */}
            <div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-container to-orange-700 flex items-center justify-center text-white font-black font-headline text-lg shadow-md">
                CND
              </div>
              <h2 className="font-headline font-black text-base text-on-surface">
                {matchState.equipoLocal}
              </h2>
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Faltas: {matchState.faltasLocal}
              </span>
            </div>

            {/* Score Display */}
            <div className="flex items-center space-x-4 bg-surface-container px-5 py-2 rounded-xl border border-surface-container-highest">
              <span className="text-3xl sm:text-4xl font-headline font-black text-primary">
                {matchState.puntosLocal}
              </span>
              <span className="text-xl font-bold text-on-surface-variant/40">-</span>
              <span className="text-3xl sm:text-4xl font-headline font-black text-on-surface-variant">
                {matchState.puntosRival}
              </span>
            </div>

            {/* Rival Team */}
            <div className="flex flex-col space-x-3">
              <div className="w-12 h-12 ms-auto rounded-xl bg-surface-container-highest border border-surface-container flex items-center justify-center text-on-surface-variant font-black font-headline text-lg">
                RIV
              </div>
              <div className="text-right">
                <h2 className="font-headline font-black text-base text-on-surface">
                  {matchState.equipoRival}
                </h2>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <button
                    onClick={() => incrementRivalScore(1)}
                    title="Sumar punto rival"
                    className="w-5 h-5 rounded bg-surface-container-highest hover:bg-primary-container hover:text-white flex items-center justify-center text-[10px] font-bold"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => decrementRivalScore(1)}
                    title="Restar punto rival"
                    className="w-5 h-5 rounded bg-surface-container-highest hover:bg-error-container hover:text-white flex items-center justify-center text-[10px] font-bold"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quarters & Timer Controller */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex bg-surface-container rounded-xl p-1 border border-surface-container-highest">
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setActiveQuarter(q)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${activeQuarter === q
                    ? "bg-primary-container text-white shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                    }`}
                >
                  Q{q}
                </button>
              ))}
            </div>

            <button
              onClick={undoLastEvent}
              title="Deshacer última acción"
              className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-highest text-xs font-bold text-on-surface flex items-center space-x-1.5 border border-surface-container-highest transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
              <span>Deshacer</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Console Layout: Interactive Court & Action Buttons Grid */}
      <div className="grid grid-cols-1 gap-4 items-start">
        {/* Court Section */}
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Cancha de Tiro
            </h3>

            <div className="flex items-center space-x-1.5">
              {/* Filtro: Solo Jugador Actual vs Todos */}
              <button
                type="button"
                onClick={() => setFilterByPlayer((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border ${filterByPlayer
                  ? "bg-primary-container/20 text-primary border-primary/40"
                  : "bg-surface-container text-on-surface-variant border-surface-container-highest hover:text-on-surface"
                  }`}
                title={filterByPlayer ? "Viendo tiros del jugador seleccionado" : "Viendo tiros de todo el equipo"}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{filterByPlayer && selectedPlayer ? `#${selectedPlayer.numero}` : "Todos"}</span>
              </button>

              {/* Toggle Ocultar / Mostrar Tiros */}
              <button
                type="button"
                onClick={() => setShowShots((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border ${showShots
                  ? "bg-surface-container text-on-surface border-surface-container-highest hover:bg-surface-container-highest"
                  : "bg-error-container/20 text-error border-error/40"
                  }`}
                title={showShots ? "Ocultar tiros" : "Mostrar tiros"}
              >
                {showShots ? (
                  <>
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>Tiros ({displayedShots.length})</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Ocultos</span>
                  </>
                )}
              </button>

              {/* Limpiar punto fijado */}
              {pendingShotCoord && (
                <button
                  type="button"
                  onClick={() => setPendingShotCoord(null)}
                  className="px-2 py-1 rounded-lg text-xs font-bold text-error bg-error-container/20 hover:bg-error-container/40 border border-error/30 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          <BasketballCourt
            shots={displayedShots}
            interactive={true}
            activeSelectedShot={pendingShotCoord}
            onCourtClick={handleCourtClick}
          />
        </div>

        {/* On-Court Players Selection Strip (5 Active Players) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-primary" /> Jugadores
            </span>
            <button
              onClick={() => setShowSubModal(true)}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Realizar Cambio
            </button>
          </div>

          <div className="grid grid-cols-5 gap-1 sm:gap-3">
            {matchState.jugadoresEnCancha.map((player) => {
              const isSelected = selectedPlayer?.id === player.id;
              return (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={`p-1.5 sm:p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[70px] ${isSelected
                    ? "bg-primary-container/20 border-primary-container ring-2 ring-primary-container/50 shadow-md shadow-primary-container/10"
                    : "bg-surface-container-high border-surface-container-highest hover:bg-surface-container-highest"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base sm:text-lg font-black font-headline text-primary">
                      #{player.numero}
                    </span>
                  </div>
                  <div className="truncate w-full mt-1">
                    <span className="block text-xs font-bold text-on-surface truncate">
                      {player.nombreCompleto.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-on-surface-variant block">
                      {player.nombreCompleto.split(" ")[1] || ""}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Pad Buttons */}
        <div className="space-y-3">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-2">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-2">
              <span className="text-xs font-bold text-on-surface">
                Acción para: <strong className="text-primary">{selectedPlayer?.nombreCompleto} (#{selectedPlayer?.numero})</strong>
              </span>
              {pendingShotCoord && (
                <span className="text-[10px] bg-primary-container/20 text-primary-container px-2 py-0.5 rounded font-bold">
                  Coordenada Fijada
                </span>
              )}
            </div>

            {/* Shots Grid */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                Lanzamientos
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 sm:grid-flow-col  gap-2">
                <button
                  onClick={() => handleAction(1, "Tiro 2 Anotado", 2)}
                  className="bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold p-3 rounded-xl shadow text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black">+2 PTS</span>
                </button>
                <button
                  onClick={() => handleAction(2, "Tiro 2 Fallado", 0)}
                  className="bg-surface-container-highest hover:bg-red-950/40 text-on-surface font-semibold p-3 rounded-xl border border-surface-container text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black text-error">FALLO 2</span>
                </button>
                <button
                  onClick={() => handleAction(3, "Triple Anotado", 3)}
                  className="bg-primary-container hover:bg-orange-600 text-white font-bold p-3 rounded-xl shadow text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black">+3 PTS</span>
                </button>
                <button
                  onClick={() => handleAction(4, "Triple Fallado", 0)}
                  className="bg-surface-container-highest hover:bg-red-950/40 text-on-surface font-semibold p-3 rounded-xl border border-surface-container text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black text-error">FALLO 3</span>
                </button>
                <button
                  onClick={() => handleAction(5, "Tiro Libre Anotado", 1)}
                  className="bg-emerald-800/60 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl shadow text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black">+1 PT</span>
                </button>
                <button
                  onClick={() => handleAction(6, "Tiro Libre Fallado", 0)}
                  className="bg-surface-container-highest hover:bg-red-950/40 text-on-surface font-semibold p-3 rounded-xl border border-surface-container text-xs flex flex-col items-center justify-center transition-transform active:scale-95"
                >
                  <span className="text-sm font-black text-error">FALLO TL</span>
                </button>
              </div>
            </div>

            {/* Other Actions Grid */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                Rebotes, Asistencias & Defensa
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleAction(7, "Rebote Ofensivo")}
                  className="bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-primary font-black">REB. OF</span>
                </button>
                <button
                  onClick={() => handleAction(8, "Rebote Defensivo")}
                  className="bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-primary font-black">REB. DEF</span>
                </button>
                <button
                  onClick={() => handleAction(9, "Asistencia")}
                  className="bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-amber-400 font-black">AST</span>
                </button>
                <button
                  onClick={() => handleAction(10, "Robo de Balón")}
                  className="bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-sky-400 font-black">ROBO</span>
                </button>
                <button
                  onClick={() => handleAction(11, "Bloqueo / Tapón")}
                  className="bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-purple-400 font-black">TAPÓN</span>
                </button>
                <button
                  onClick={() => handleAction(12, "Falta Personal")}
                  className="bg-error-container/80 hover:bg-error-container text-white font-bold p-2.5 rounded-xl text-xs flex flex-col items-center transition-transform active:scale-95"
                >
                  <span className="text-white font-black">FALTA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Event Log Feed */}
      <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-2">
            <Flame className="w-4 h-4 text-primary" />
            Registro de Eventos en Tiempo Real
          </h3>
          <span className="text-xs text-on-surface-variant">{matchState.eventos.length} acciones registradas</span>
        </div>

        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {matchState.eventos.length === 0 ? (
            <p className="text-xs text-on-surface-variant/70 italic py-3 text-center">
              Aún no hay eventos registrados en este cuarto.
            </p>
          ) : (
            matchState.eventos.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between p-2 rounded-xl bg-surface-container border border-surface-container-highest text-xs"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-on-surface-variant text-[11px]">{ev.createdAt}</span>
                  <span className="font-bold text-primary">#{ev.jugadorNumero} {ev.jugadorNombre}</span>
                </div>
                <span className="px-2 py-0.5 rounded font-semibold bg-surface-container-highest text-on-surface">
                  {ev.accionNombre} (Q{ev.cuarto})
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* End Match Button Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high border border-surface-container-highest shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-headline font-bold text-on-surface flex items-center justify-center sm:justify-start gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            Finalización del Encuentro
          </h4>
          <p className="text-xs text-on-surface-variant">
            Cierra el partido para calcular todas las estadísticas individuales, porcentajes, mapas de tiro y box score.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowEndMatchModal(true)}
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-xs sm:text-sm shadow-xl shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 whitespace-nowrap"
        >
          <Trophy className="w-4 h-4 fill-white" />
          <span>Terminar Partido & Ver Estadísticas</span>
        </button>
      </div>

      {/* End Match Confirmation Modal */}
      {showEndMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                  ¿Terminar Partido?
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Se generará el reporte estadístico completo por cada jugador.
                </p>
              </div>
            </div>

            {/* Scorecard preview */}
            <div className="bg-surface-container p-4 rounded-2xl border border-surface-container-highest flex items-center justify-around text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">{matchState.equipoLocal}</span>
                <span className="text-3xl font-headline font-black text-primary">{matchState.puntosLocal}</span>
              </div>
              <span className="text-xl font-bold text-on-surface-variant/40">-</span>
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant block">{matchState.equipoRival}</span>
                <span className="text-3xl font-headline font-black text-on-surface">{matchState.puntosRival}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEndMatchModal(false)}
                className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-highest text-xs font-bold text-on-surface border border-surface-container-highest transition-colors"
              >
                Continuar Jugando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEndMatchModal(false);
                  navigate("/match/summary");
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-xs shadow-lg flex items-center space-x-2 transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar & Ver Reporte</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Substitution Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Realizar Sustitución
            </h3>

            {/* Step 1: Select Player to Exit */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant block">
                1. Selecciona el jugador que SALE de cancha:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {matchState.jugadoresEnCancha.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSubOutPlayer(p)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all text-left ${subOutPlayer?.id === p.id
                      ? "bg-primary-container text-white border-primary"
                      : "bg-surface-container border-surface-container-highest text-on-surface"
                      }`}
                  >
                    #{p.numero} {p.nombreCompleto}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Player from Bench */}
            {subOutPlayer && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant block">
                  2. Selecciona el jugador que ENTRA desde la banca:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {matchState.jugadoresBanca.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        substitutePlayer(subOutPlayer.id, p.id);
                        setShowSubModal(false);
                        setSubOutPlayer(null);
                      }}
                      className="p-2 rounded-xl border border-surface-container-highest bg-surface-container hover:bg-primary-container hover:text-white text-xs font-bold transition-all text-left text-on-surface"
                    >
                      #{p.numero} {p.nombreCompleto}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setShowSubModal(false);
                  setSubOutPlayer(null);
                }}
                className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-xs font-bold hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
