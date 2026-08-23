import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMatch } from "../context/MatchContext.js";
//import { useAuth } from "../context/AuthContext.js";
//import { initialJugadores } from "../data/mockData.js";
import {
  UserCheck,
  CheckCircle2,
  Circle,
  Play,
  Shield,
  Key,
  Clock,
  Users,
} from "lucide-react";
import { Jugador } from "../types/index.js";

export const RosterSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { startNewMatch } = useMatch();
  //const { currentTeam } = useAuth();

  const [localName, setLocalName] = useState<string>("");
  const [rivalName, setRivalName] = useState<string>("");
  const [pin, setPin] = useState<string>("7421");
  const [selectedFive, setSelectedFive] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [modalError, setModalError] = useState<string>("");
  const [modalNewPlayer, setModalNewPlayer] = useState<boolean>(false)
  const [newPlayer, setNewPlayer] = useState<Jugador>({ id: 0, idEquipo: 0, nombreCompleto: "", numero: 0, posicionPrincipal: "" })
  const [initialJugadores, setInitialJugadores] = useState<Jugador[]>([])

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

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFive.length !== 5) {
      setError("Debes seleccionar exactamente 5 jugadores titulares para iniciar el partido");
      return;
    }

    startNewMatch(localName, rivalName, selectedFive, pin, initialJugadores);
    navigate("/match/live");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlayer({ ...newPlayer, [e.target.name]: e.target.value })
  }

  const handleNewPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setModalError("")

    const nombreCompleto = newPlayer.nombreCompleto.trim()
    const numero = newPlayer.numero
    const posicionPrincipal = newPlayer.posicionPrincipal.trim()

    if (nombreCompleto === "") return setModalError("Nombre completo es requerido")
    if (!numero || numero < 0) return setModalError("Número debe ser mayor a 0")
    if (posicionPrincipal === "") return setModalError("Posición es requerida")


    setInitialJugadores([...initialJugadores, newPlayer])
    setNewPlayer({ id: initialJugadores.length + 1, idEquipo: 0, nombreCompleto: "", numero: 0, posicionPrincipal: "" })
    setModalNewPlayer(false)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface">
          Configuración de Partido & Roster
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Ingresa los detalles del encuentro y selecciona a los 5 titulares iniciales
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

            {/* <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                Código PIN del Partido
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="PIN (4 dígitos)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div> */}
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
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${selectedFive.length === 5
                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                : "bg-surface-container text-primary border border-surface-container-highest"
                }`}
            >
              {selectedFive.length} / 5 Seleccionados
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {initialJugadores.map((jugador) => {
              const isSelected = selectedFive.includes(jugador.id);
              return (
                <div
                  key={jugador.id}
                  onClick={() => togglePlayer(jugador.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer select-none transition-all flex items-center justify-between ${isSelected
                    ? "bg-primary-container/20 border-primary-container ring-1 ring-primary-container"
                    : "bg-surface-container border-surface-container-highest hover:bg-surface-container-highest/60"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        jugador.foto ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      }
                      alt={jugador.nombreCompleto}
                      className="w-11 h-11 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-base font-headline font-black text-primary">
                          #{jugador.numero}
                        </span>
                        <h3 className="font-bold text-xs text-on-surface">
                          {jugador.nombreCompleto}
                        </h3>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">
                        {jugador.posicionPrincipal}
                      </span>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-primary-container" />
                    ) : (
                      <Circle className="w-5 h-5 text-on-surface-variant/40" />
                    )}
                  </div>
                </div>
              );
            })}
            <button type="button" onClick={() => setModalNewPlayer(true)} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-sm shadow-xl shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95">Agregar Jugador</button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-sm shadow-xl shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Comenzar Partido en Vivo</span>
          </button>
        </div>
      </form>

      {/* MODAL AGREGAR JUGADOR */}
      {modalNewPlayer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 w-11/12 max-w-lg shadow-lg">
            <h2 className="text-lg font-bold text-primary">Agregar Jugador</h2>
            <form onSubmit={handleNewPlayerSubmit}>
              {modalError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs font-bold">
                  {modalError}
                </div>
              )}
              <div className="mt-4">
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Nombre Completo</label>
                <input type="text" name="nombreCompleto" onChange={handleChange} className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Número</label>
                <input type="number" name="numero" onChange={handleChange} className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="mt-4">
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">Posición Principal</label>
                <input type="text" name="posicionPrincipal" onChange={handleChange} className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div className="flex items-center justify-end mt-3">
                <button type="submit" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-sm shadow-xl shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 m-4">Agregar Jugador</button>
                <button type="button" onClick={() => setModalNewPlayer(false)} className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-sm shadow-xl shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 m-4">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}