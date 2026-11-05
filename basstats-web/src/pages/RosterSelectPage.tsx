import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMatch } from "../context/MatchContext.js";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import {
  UserCheck,
  CheckCircle2,
  Circle,
  Play,
  Shield,
  Users,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import type { Jugador } from "../types/index.js";

export const RosterSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { startNewMatch } = useMatch();
  const { currentTeam } = useAuth();

  const [localName, setLocalName] = useState<string>(currentTeam?.nombre || "Mi Equipo");
  const [rivalName, setRivalName] = useState<string>("Equipo Rival");
  const [selectedFive, setSelectedFive] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [jugadoresList, setJugadoresList] = useState<Jugador[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);

  useEffect(() => {
    if (currentTeam?.nombre) {
      setLocalName(currentTeam.nombre);
    }
  }, [currentTeam?.nombre]);

  useEffect(() => {
    const loadPlayers = async () => {
      if (!currentTeam?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.getJugadores(1, 50, currentTeam.id);
        if (res.items && res.items.length > 0) {
          setJugadoresList(res.items);
          if (res.items.length >= 5) {
            setSelectedFive(res.items.slice(0, 5).map((j) => j.id));
          } else {
            setSelectedFive([]);
          }
        } else {
          setJugadoresList([]);
          setSelectedFive([]);
        }
      } catch (err) {
        console.error("Error al cargar jugadores del equipo:", err);
        setJugadoresList([]);
        setSelectedFive([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, [currentTeam?.id]);

  const togglePlayer = (id: number) => {
    if (selectedFive.includes(id)) {
      setSelectedFive(selectedFive.filter((pId) => pId !== id));
    } else {
      if (selectedFive.length >= 5) {
        setError("Solo puedes seleccionar exactamente 5 jugadores titulares");
        return;
      }
      setError("");
      setSelectedFive([...selectedFive, id]);
    }
  };

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFive.length !== 5) {
      setError("Debes seleccionar exactamente 5 jugadores titulares para iniciar el partido");
      return;
    }

    setStarting(true);
    let createdMatchId = Date.now();

    try {
      const match = await api.createPartido({
        idEquipo: currentTeam.id,
        equipoRival: rivalName,
        fecha: new Date().toISOString(),
      });
      createdMatchId = match.id;
    } catch (err) {
      console.warn("No se pudo persistir el partido en el backend:", err);
    }

    startNewMatch(localName, rivalName, selectedFive, jugadoresList, createdMatchId);
    setStarting(false);
    navigate("/match/live");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface">
          Configuración de Partido & Roster
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Ingresa los detalles del encuentro y selecciona a los 5 titulares iniciales de tu plantel
        </p>
      </div>

      <form onSubmit={handleStartGame} className="space-y-6">
        {/* Match Setup Inputs */}
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-headline font-bold text-on-surface flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Información del Encuentro
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Equipo Local
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del equipo local"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Equipo Rival
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del rival"
                value={rivalName}
                onChange={(e) => setRivalName(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Starting 5 Selection */}
        <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-headline font-bold text-on-surface flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Selección de Quinteto Inicial (5 Titulares)
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                selectedFive.length === 5
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : "bg-surface-container text-primary border border-surface-container-highest"
              }`}
            >
              {selectedFive.length} / 5 Seleccionados
            </span>
          </div>

          {error && (
            <p className="text-xs font-bold text-red-400 bg-red-950/40 border border-red-800/60 p-3 rounded-xl">
              {error}
            </p>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Cargando jugadores registrados de tu equipo...</span>
            </div>
          ) : jugadoresList.length < 5 ? (
            <div className="py-8 px-4 text-center space-y-3 bg-surface-container rounded-2xl border border-surface-container-highest">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-headline font-bold text-on-surface">
                Plantel Insuficiente ({jugadoresList.length} de 5 jugadores mínimos)
              </h3>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto">
                Para disputar un partido oficial debes tener al menos 5 jugadores registrados en tu equipo para conformar el quinteto titular inicial.
              </p>
              <div className="pt-2">
                <Link
                  to="/team"
                  className="inline-flex items-center space-x-2 bg-primary hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registrar Jugadores en Mi Equipo</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {jugadoresList.map((player) => {
                const isSelected = selectedFive.includes(player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none ${
                      isSelected
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-surface-container border-surface-container-highest hover:bg-surface-container-highest/50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-surface-container-highest flex items-center justify-center font-headline font-bold text-xs text-primary border border-primary/20">
                        #{player.numero}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface leading-snug">
                          {player.nombreCompleto}
                        </p>
                        <p className="text-[10px] text-on-surface-variant font-semibold">
                          {player.posicionPrincipal}
                        </p>
                      </div>
                    </div>

                    <div className="text-primary">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 fill-primary text-surface" />
                      ) : (
                        <Circle className="w-5 h-5 text-on-surface-variant/40" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Match CTA */}
        {jugadoresList.length >= 5 && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={selectedFive.length !== 5 || starting}
              className="w-full sm:w-auto bg-primary hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-headline font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              {starting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Comenzar Partido en Vivo</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
