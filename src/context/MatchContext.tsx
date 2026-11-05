import React, { createContext, useContext, useState, useEffect } from "react";
import type { Jugador, EventoJuego, UbicacionTiro, MatchLiveState } from "../types/index.js";
import { api } from "../services/api.js";

interface MatchContextType {
  matchState: MatchLiveState;
  selectedPlayer: Jugador | null;
  setSelectedPlayer: (player: Jugador | null) => void;
  activeQuarter: number;
  setActiveQuarter: (q: number) => void;
  recordStat: (
    statId: number,
    statName: string,
    points?: number,
    coordinates?: { x: number; y: number }
  ) => Promise<void>;
  substitutePlayer: (outPlayerId: number, inPlayerId: number) => void;
  incrementRivalScore: (points: number) => void;
  decrementRivalScore: (points: number) => void;
  undoLastEvent: () => void;
  startNewMatch: (
    localName: string,
    rivalName: string,
    startingFiveIds: number[],
    initialJugadoresList: Jugador[],
    backendPartidoId?: number
  ) => void;
  resetMatch: () => void;
}

const emptyMatchState: MatchLiveState = {
  partidoId: 0,
  equipoLocal: "",
  equipoRival: "",
  puntosLocal: 0,
  puntosRival: 0,
  cuarto: 1,
  faltasLocal: 0,
  faltasRival: 0,
  jugadoresEnCancha: [],
  jugadoresBanca: [],
  eventos: [],
  tiros: [],
};

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [matchState, setMatchState] = useState<MatchLiveState>(() => {
    const saved = localStorage.getItem("basstats_live_match");
    if (!saved) return emptyMatchState;
    try {
      const parsed = JSON.parse(saved);
      // Asegurar que contenga jugadores válidos
      if (parsed && Array.isArray(parsed.jugadoresEnCancha)) {
        return parsed;
      }
      return emptyMatchState;
    } catch {
      return emptyMatchState;
    }
  });

  const [selectedPlayer, setSelectedPlayer] = useState<Jugador | null>(
    matchState.jugadoresEnCancha[0] || null
  );
  const [activeQuarter, setActiveQuarter] = useState<number>(matchState.cuarto || 1);

  // Sincronizar con el almacenamiento local
  useEffect(() => {
    if (matchState.partidoId > 0 && matchState.jugadoresEnCancha.length > 0) {
      localStorage.setItem("basstats_live_match", JSON.stringify(matchState));
    } else {
      localStorage.removeItem("basstats_live_match");
    }
  }, [matchState]);

  const startNewMatch = (
    localName: string,
    rivalName: string,
    startingFiveIds: number[],
    initialJugadoresList: Jugador[],
    backendPartidoId?: number
  ) => {
    const onCourt = initialJugadoresList.filter((j) => startingFiveIds.includes(j.id));
    const onBench = initialJugadoresList.filter((j) => !startingFiveIds.includes(j.id));

    const newState: MatchLiveState = {
      partidoId: backendPartidoId || Date.now(),
      equipoLocal: localName || "Local",
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
    setSelectedPlayer(onCourt[0] || null);
    setActiveQuarter(1);
  };

  const resetMatch = () => {
    localStorage.removeItem("basstats_live_match");
    setMatchState(emptyMatchState);
    setSelectedPlayer(null);
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
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
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
        idJugador: selectedPlayer.id,
        x: coordinates.x,
        y: coordinates.y,
        anotado: isMade,
      };
      newEvent.ubicacion = newShot;
    }

    // Persistir en el backend PostgreSQL mediante la Web API
    if (matchState.partidoId > 0) {
      try {
        await api.createEvento({
          idPartido: matchState.partidoId,
          idJugador: selectedPlayer.id,
          idEstadistica: statId,
          cuarto: activeQuarter,
          tiro: coordinates,
        });
      } catch (e) {
        console.warn("Registro de evento en API:", e);
      }
    }

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

      const newOnCourt = prev.jugadoresEnCancha.map((p) =>
        p.id === outPlayerId ? inPlayer : p
      );
      const newOnBench = prev.jugadoresBanca.map((p) =>
        p.id === inPlayerId ? outPlayer : p
      );

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
      else if (last.accionNombre?.includes("Doble Anotado") || last.accionNombre?.includes("Tiro 2 Anotado"))
        scoreDelta = 2;
      else if (last.accionNombre?.includes("Libre Anotado")) scoreDelta = 1;

      return {
        ...prev,
        puntosLocal: Math.max(0, prev.puntosLocal - scoreDelta),
        faltasLocal: last.accionNombre?.includes("Falta")
          ? Math.max(0, prev.faltasLocal - 1)
          : prev.faltasLocal,
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
        resetMatch,
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
