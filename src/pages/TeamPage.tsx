import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import {
  Shield,
  Users,
  Plus,
  Trophy,
  ChevronRight,
  TrendingUp,
  X,
  UserPlus,
  Edit2,
  Trash2,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../services/api.js";
import type { Jugador, PaginationMeta } from "../types/index.js";
import { PaginationControl } from "../components/common/PaginationControl.js";

export const TeamPage: React.FC = () => {
  const { currentTeam, uploadAvatar } = useAuth();
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Estado del modal para agregar o editar
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPlayer, setEditingPlayer] = useState<Jugador | null>(null);

  // Campos del formulario
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [numero, setNumero] = useState<number>(10);
  const [posicionPrincipal, setPosicionPrincipal] = useState("Base (PG)");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [savingPlayer, setSavingPlayer] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showAlert = (text: string, type: "success" | "error") => {
    setAlertMsg({ text, type });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const fetchJugadores = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const res = await api.getJugadores(page, pagination.limit, currentTeam.id);
        setJugadores(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        console.error("Error fetching jugadores:", err);
      } finally {
        setLoading(false);
      }
    },
    [currentTeam.id, pagination.limit]
  );

  useEffect(() => {
    fetchJugadores(1);
  }, [fetchJugadores]);

  // Abrir modal para crear jugador
  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setNombreCompleto("");
    setNumero(10);
    setPosicionPrincipal("Base (PG)");
    setFotoFile(null);
    setFotoPreview("");
    setShowModal(true);
  };

  // Abrir modal para editar jugador
  const handleOpenEdit = (jugador: Jugador) => {
    setEditingPlayer(jugador);
    setNombreCompleto(jugador.nombreCompleto);
    setNumero(jugador.numero);
    setPosicionPrincipal(jugador.posicionPrincipal);
    setFotoFile(null);
    setFotoPreview(jugador.foto || "");
    setShowModal(true);
  };

  // Enviar formulario de alta o edición de jugador
  const handleSubmitPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPlayer(true);

    try {
      if (editingPlayer) {
        // Actualizar datos del jugador
        const updated = await api.updateJugador(editingPlayer.id, {
          nombreCompleto,
          numero: Number(numero),
          posicionPrincipal,
        });

        // Si se seleccionó una nueva foto, subirla a Cloudinary
        let finalPlayer = updated;
        if (fotoFile) {
          const resPhoto = await api.uploadJugadorFoto(editingPlayer.id, fotoFile);
          finalPlayer = resPhoto.jugador;
        }

        setJugadores((prev) =>
          prev.map((j) => (j.id === editingPlayer.id ? { ...j, ...finalPlayer } : j))
        );
        showAlert(`Jugador '${nombreCompleto}' actualizado con éxito.`, "success");
      } else {
        const created = await api.createJugador({
          idEquipo: currentTeam.id,
          nombreCompleto,
          numero: Number(numero),
          posicionPrincipal,
          foto: fotoPreview || null,
        });

        // Subir foto si se seleccionó un archivo
        let finalPlayer = created;
        if (fotoFile) {
          try {
            const resPhoto = await api.uploadJugadorFoto(created.id, fotoFile);
            finalPlayer = resPhoto.jugador;
          } catch (e) {
            console.warn("Error uploading photo:", e);
          }
        }

        setJugadores((prev) => [finalPlayer, ...prev]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        showAlert(`Jugador '${nombreCompleto}' registrado con éxito.`, "success");
      }

      setShowModal(false);
    } catch (err: any) {
      showAlert(err.message || "Error al procesar el jugador", "error");
    } finally {
      setSavingPlayer(false);
    }
  };

  const handleDeletePlayer = async (jugador: Jugador) => {
    if (!window.confirm(`¿Seguro que deseas eliminar al jugador #${jugador.numero} ${jugador.nombreCompleto}?`)) {
      return;
    }

    try {
      await api.deleteJugador(jugador.id);
      setJugadores((prev) => prev.filter((j) => j.id !== jugador.id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      showAlert(`Jugador '${jugador.nombreCompleto}' eliminado correctamente.`, "success");
    } catch (err: any) {
      showAlert(err.message || "Error al eliminar jugador", "error");
    }
  };

  // Gestionar la subida del avatar o escudo del equipo
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      showAlert("Escudo del equipo actualizado con éxito.", "success");
    } catch (err: any) {
      showAlert(err.message || "Error al subir avatar", "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Alert banner */}
      {alertMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
            alertMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {alertMsg.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{alertMsg.text}</span>
        </div>
      )}

      {/* Team Profile Header Banner (Requisito: Gestión de Avatar) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-high border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            {/* Avatar with Upload button */}
            <div className="relative group">
              <img
                src={
                  currentTeam.logo ||
                  "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=150&auto=format&fit=crop&q=80"
                }
                alt={currentTeam.nombre}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-primary/40 p-1 shadow-xl shadow-primary/10"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Cambiar avatar en el servidor"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-bold mt-1">Cambiar</span>
                  </>
                )}
              </button>
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full bg-primary-container text-white">
                  {currentTeam.nick}
                </span>
                <span className="text-xs text-on-surface-variant font-medium">
                  {currentTeam.correo}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant">
                  {currentTeam.rol}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface tracking-tight">
                {currentTeam.nombre}
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant flex items-center justify-center sm:justify-start gap-4 pt-1">
                <span><strong>{pagination.total}</strong> Jugadores</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Temporada Activa</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleOpenAdd}
              className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Jugador</span>
            </button>
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-headline font-black text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Plantel de Jugadores
            </h2>
            <p className="text-xs text-on-surface-variant">
              Administra los jugadores, posiciones y estadísticas individuales del equipo.
            </p>
          </div>
        </div>

        {loading && jugadores.length === 0 ? (
          <div className="py-12 text-center text-sm text-on-surface-variant flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Cargando jugadores desde el servidor...</span>
          </div>
        ) : jugadores.length === 0 ? (
          <div className="bg-surface-container border border-surface-container-highest rounded-2xl p-8 text-center space-y-3">
            <Users className="w-12 h-12 mx-auto text-on-surface-variant/40" />
            <p className="text-sm text-on-surface-variant font-medium">
              No hay jugadores cargados en este equipo.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 bg-primary text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Primer Jugador</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jugadores.map((jugador) => (
              <div
                key={jugador.id}
                className="bg-surface-container-high border border-surface-container-highest hover:border-primary/40 rounded-2xl p-5 shadow-lg transition-all hover:-translate-y-1 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <img
                          src={
                            jugador.foto ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                          }
                          alt={jugador.nombreCompleto}
                          className="w-14 h-14 rounded-2xl object-cover border border-surface-container-highest shadow-md"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 bg-primary text-white font-headline font-black text-xs px-1.5 py-0.5 rounded-lg shadow">
                          #{jugador.numero}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                          {jugador.nombreCompleto}
                        </h3>
                        <p className="text-xs font-semibold text-on-surface-variant">
                          {jugador.posicionPrincipal}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(jugador)}
                        className="p-1.5 rounded-lg border border-surface-container-highest hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors"
                        title="Modificar Jugador"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(jugador)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Eliminar Jugador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Player Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-surface-container-highest text-center">
                    <div className="bg-surface-container rounded-xl p-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        PPG
                      </span>
                      <p className="text-base font-headline font-black text-on-surface">
                        {jugador.ppg ?? 0}
                      </p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        RPG
                      </span>
                      <p className="text-base font-headline font-black text-on-surface">
                        {jugador.rpg ?? 0}
                      </p>
                    </div>
                    <div className="bg-surface-container rounded-xl p-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant">
                        APG
                      </span>
                      <p className="text-base font-headline font-black text-on-surface">
                        {jugador.apg ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/player/${jugador.id}`}
                  className="mt-4 flex items-center justify-between text-xs font-bold text-primary hover:text-orange-400 pt-2 transition-colors"
                >
                  <span>Ver Ficha y Estadísticas</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Server-Side Pagination Controls */}
        <PaginationControl
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          onPageChange={(p) => fetchJugadores(p)}
          limit={pagination.limit}
        />
      </section>

      {/* Modal for Add / Edit Player */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-surface-container-highest rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-surface-container-highest pb-4">
              <h3 className="text-lg font-headline font-black text-on-surface flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {editingPlayer ? "Modificar Jugador" : "Registrar Nuevo Jugador"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Lucas Rodríguez"
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    Número Dorsal
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    required
                    value={numero}
                    onChange={(e) => setNumero(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    Posición
                  </label>
                  <select
                    value={posicionPrincipal}
                    onChange={(e) => setPosicionPrincipal(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Base (PG)">Base (PG)</option>
                    <option value="Escolta (SG)">Escolta (SG)</option>
                    <option value="Alero (SF)">Alero (SF)</option>
                    <option value="Ala-Pívot (PF)">Ala-Pívot (PF)</option>
                    <option value="Pívot (C)">Pívot (C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Foto de Perfil
                </label>
                <div className="flex items-center space-x-3">
                  {fotoPreview && (
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-primary/30"
                    />
                  )}
                  <label className="flex-1 cursor-pointer flex items-center justify-center space-x-2 border border-dashed border-surface-container-highest hover:border-primary/60 bg-surface-container rounded-xl py-3 px-4 text-xs font-bold text-on-surface hover:text-primary transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{fotoFile ? fotoFile.name : "Seleccionar Imagen..."}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFotoFile(file);
                          setFotoPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-surface-container-highest">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-surface-container-highest hover:bg-surface-container text-xs font-bold text-on-surface-variant"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPlayer}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white text-xs font-bold flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  {savingPlayer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingPlayer ? "Guardar Cambios" : "Crear Jugador"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
