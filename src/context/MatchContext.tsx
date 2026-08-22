import React, { createContext, useContext, useState, useEffect } from "react";
import type { Jugador, EventoJuego, UbicacionTiro, MatchLiveState } from "../types/index.js";
import { initialJugadores, mockEventos, mockShotLocations } from "../data/mockData.js";
import { api } from "../services/api.js";

interface MatchContextType {
  matchState: MatchLiveState;
  selectedPlayer: Jugador | null;
  setSelectedPlayer: (player: Jugador | null) => void;
  activeQuarter: number;
  setActiveQuarter: (q: number) => void;
  recordStat: (statId: number, statName: string, points?: number, coordinates?: { x: number; y: number }) => Promise<void>;
  substitutePlayer: (outPlayerId: number, inPlayerId: number) => void;
  incrementRivalScore: (points: number) => void;
  decrementRivalScore: (points: number) => void;
  undoLastEvent: () => void;
  startNewMatch: (rivalName: string, startingFiveIds: number[], pin: string, initialJugadores: Jugador[]) => void;
}

const initialMatchState: MatchLiveState = {
  partidoId: 1,
  equipoLocal: "Los Cóndores",
  equipoRival: "Vikingos BC",
  puntosLocal: 42,
  puntosRival: 38,
  cuarto: 2,
  faltasLocal: 3,
  faltasRival: 4,
  jugadoresEnCancha: initialJugadores.slice(0, 5),
  jugadoresBanca: initialJugadores.slice(5),
  eventos: mockEventos,
  tiros: mockShotLocations,
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matchState, setMatchState] = useState<MatchLiveState>(() => {
    const saved = localStorage.getItem("basstats_live_match");
    return saved ? JSON.parse(saved) : initialMatchState;
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(matchState.jugadoresEnCancha[0] || null);
  const [activeQuarter, setActiveQuarter] = useState<number>(matchState.cuarto || 1);

  // Synchronize storage
  useEffect(() => {
    localStorage.setItem("basstats_live_match", JSON.stringify(matchState));
  }, [matchState]);

  const startNewMatch = (rivalName: string, startingFiveIds: number[], pin: string, initialJugadores: Jugador[]) => {
    const onCourt = initialJugadores.filter((j) => startingFiveIds.includes(j.id));
    const onBench = initialJugadores.filter((j) => !startingFiveIds.includes(j.id));

    const newState: MatchLiveState = {
      partidoId: Date.now(),
      equipoLocal: "SLB Vietcong",
      equipoRival: rivalName || "Rival",
      puntosLocal: 0,
      puntosRival: 0,
      cuarto: 1,
      faltasLocal: 0,
      faltasRival: 0,
      jugadoresEnCancha: onCourt,
      jugadoresBanca: onBench,
      eventos: [],
      tiros: [],
    };

    setMatchState(newState);
    setSelectedPlayer(newState.jugadoresEnCancha[0] || null);
    setActiveQuarter(1);
  };

  const recordStat = async (
    statId: number,
    statName: string,
    points: number = 0,
    coordinates?: { x: number; y: number }
  ) => {
    if (!selectedPlayer) return;

    const newEvent: EventoJuego = {
      id: Date.now(),
      idPartido: matchState.partidoId,
      idJugador: selectedPlayer.id,
      idEstadistica: statId,
      cuarto: activeQuarter,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      jugadorNombre: selectedPlayer.nombreCompleto,
      jugadorNumero: selectedPlayer.numero,
      accionNombre: statName,
    };

    let newShot: UbicacionTiro | undefined = undefined;
    if (coordinates) {
      const isMade = statName.toLowerCase().includes("anotado");
      newShot = {
        id: Date.now(),
        idEvento: newEvent.id,
        x: coordinates.x,
        y: coordinates.y,
        anotado: isMade,
      };
      newEvent.ubicacion = newShot;
    }

    // Try backend persistence in background
    api.createEvento({
      idPartido: matchState.partidoId,
      idJugador: selectedPlayer.id,
      idEstadistica: statId,
      cuarto: activeQuarter,
    }).then((created) => {
      if (coordinates && created.id) {
        api.createUbicacionTiro({
          idEvento: created.id,
          x: coordinates.x,
          y: coordinates.y,
        });
      }
    }).catch((e) => console.log("Offline mode event logging", e));

    setMatchState((prev) => ({
      ...prev,
      puntosLocal: prev.puntosLocal + points,
      faltasLocal: statName.toLowerCase().includes("falta") ? prev.faltasLocal + 1 : prev.faltasLocal,
      eventos: [newEvent, ...prev.eventos],
      tiros: newShot ? [...prev.tiros, newShot] : prev.tiros,
    }));
  };

  const substitutePlayer = (outPlayerId: number, inPlayerId: number) => {
    setMatchState((prev) => {
      const outPlayer = prev.jugadoresEnCancha.find((p) => p.id === outPlayerId);
      const inPlayer = prev.jugadoresBanca.find((p) => p.id === inPlayerId);

      if (!outPlayer || !inPlayer) return prev;

      const newOnCourt = prev.jugadoresEnCancha.map((p) => (p.id === outPlayerId ? inPlayer : p));
      const newOnBench = prev.jugadoresBanca.map((p) => (p.id === inPlayerId ? outPlayer : p));

      return {
        ...prev,
        jugadoresEnCancha: newOnCourt,
        jugadoresBanca: newOnBench,
      };
    });
  };

  const incrementRivalScore = (points: number) => {
    setMatchState((prev) => ({ ...prev, puntosRival: prev.puntosRival + points }));
  };

  const decrementRivalScore = (points: number) => {
    setMatchState((prev) => ({ ...prev, puntosRival: Math.max(0, prev.puntosRival - points) }));
  };

  const undoLastEvent = () => {
    setMatchState((prev) => {
      if (prev.eventos.length === 0) return prev;
      const [last, ...remaining] = prev.eventos;

      let scoreDelta = 0;
      if (last.accionNombre?.includes("Triple Anotado")) scoreDelta = 3;
      else if (last.accionNombre?.includes("Tiro 2 Anotado")) scoreDelta = 2;
      else if (last.accionNombre?.includes("Tiro Libre Anotado")) scoreDelta = 1;

      return {
        ...prev,
        puntosLocal: Math.max(0, prev.puntosLocal - scoreDelta),
        faltasLocal: last.accionNombre?.includes("Falta") ? Math.max(0, prev.faltasLocal - 1) : prev.faltasLocal,
        eventos: remaining,
        tiros: prev.tiros.filter((t) => t.idEvento !== last.id),
      };
    });
  };

  return (
    <MatchContext.Provider
      value={{
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
        startNewMatch,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

export const useMatch = (): MatchContextType => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error("useMatch must be used within a MatchProvider");
  }
  return context;
};
