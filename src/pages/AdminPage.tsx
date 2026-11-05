import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import { api } from "../services/api.js";
import type { Usuario, PaginationMeta } from "../types/index.js";
import { PaginationControl } from "../components/common/PaginationControl.js";
import { AsyncSearchSelect, type AsyncSearchItem } from "../components/common/AsyncSearchSelect.js";
import {
  ShieldAlert,
  Users,
  Trophy,
  Activity,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });
  const [searchFilter, setSearchFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [auditStats, setAuditStats] = useState<{
    totalUsuarios: number;
    totalJugadores: number;
    totalPartidos: number;
  } | null>(null);

  // Elemento seleccionado de la búsqueda asíncrona
  const [searchedEntity, setSearchedEntity] = useState<AsyncSearchItem | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchUsers = useCallback(
    async (page: number = 1, search: string = searchFilter) => {
      setLoading(true);
      try {
        const res = await api.getAdminUsers(page, pagination.limit, search);
        setUsers(res.items);
        setPagination(res.pagination);
      } catch (err: any) {
        setActionMessage({ text: err.message || "Error al cargar usuarios", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, searchFilter]
  );

  const fetchAudit = useCallback(async () => {
    try {
      const stats = await api.getAuditStats();
      setAuditStats(stats);
    } catch (err) {
      console.warn("Audit stats fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1);
    fetchAudit();
  }, [fetchUsers, fetchAudit]);

  const handleRoleToggle = async (targetUser: Usuario) => {
    const newRole = targetUser.rol === "Administrador" ? "Equipo" : "Administrador";
    if (targetUser.id === user?.id) {
      alert("No puedes cambiar tu propio rol de administrador.");
      return;
    }

    try {
      await api.changeUserRole(targetUser.id, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, rol: newRole } : u))
      );
      setActionMessage({
        text: `Rol de '${targetUser.nombre}' actualizado a ${newRole}.`,
        type: "success",
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ text: err.message || "No se pudo cambiar el rol", type: "error" });
    }
  };

  const handleDeleteUser = async (targetUser: Usuario) => {
    if (targetUser.id === user?.id) {
      alert("No puedes dar de baja tu propia cuenta de administrador.");
      return;
    }

    if (
      !window.confirm(
        `¿Seguro que deseas dar de baja el usuario/equipo '${targetUser.nombre}'? Sus jugadores y partidos asociados serán eliminados en cascada.`
      )
    ) {
      return;
    }

    try {
      await api.deleteUser(targetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      fetchAudit();
      setActionMessage({
        text: `Usuario '${targetUser.nombre}' eliminado correctamente del sistema.`,
        type: "success",
      });
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage({ text: err.message || "Error al eliminar usuario", type: "error" });
    }
  };

  // Función de búsqueda asíncrona para el componente con debounce
  const handleAsyncSearch = async (term: string): Promise<AsyncSearchItem[]> => {
    const [foundUsers, foundPlayers] = await Promise.all([
      api.searchUsuarios(term),
      api.searchJugadores(term),
    ]);

    const userItems: AsyncSearchItem[] = foundUsers.map((u) => ({
      id: u.id,
      title: u.nombre,
      subtitle: `${u.correo} • Nick: ${u.nick}`,
      badge: u.rol,
      image: u.logo,
    }));

    const playerItems: AsyncSearchItem[] = foundPlayers.map((p) => ({
      id: p.id,
      title: `${p.nombreCompleto} (#${p.numero})`,
      subtitle: `Posición: ${p.posicionPrincipal}`,
      badge: "Jugador",
      image: p.foto,
    }));

    return [...userItems, ...playerItems];
  };

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-headline text-on-surface">
          Acceso Restringido por Rol
        </h2>
        <p className="text-on-surface-variant text-sm max-w-md mx-auto">
          Esta funcionalidad está restringida exclusivamente para cuentas con rol de{" "}
          <strong>Administrador</strong>. Tu cuenta actual posee rol de <strong>{user?.rol || "Invitado"}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950/40 via-surface-container to-surface-container-high border border-red-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-inner">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300">
                  Panel Exclusivo
                </span>
                <span className="text-xs text-on-surface-variant font-medium">Rol: {user?.rol}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-headline font-black text-on-surface tracking-tight mt-1">
                Administración de Liga
              </h1>
            </div>
          </div>

          {/* Real-time system counters */}
          {auditStats && (
            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
              <div className="bg-surface-container/80 border border-surface-container-highest rounded-2xl p-3 text-center min-w-[90px]">
                <p className="text-xs text-on-surface-variant font-medium">Usuarios</p>
                <p className="text-xl font-headline font-black text-primary">{auditStats.totalUsuarios}</p>
              </div>
              <div className="bg-surface-container/80 border border-surface-container-highest rounded-2xl p-3 text-center min-w-[90px]">
                <p className="text-xs text-on-surface-variant font-medium">Jugadores</p>
                <p className="text-xl font-headline font-black text-primary">{auditStats.totalJugadores}</p>
              </div>
              <div className="bg-surface-container/80 border border-surface-container-highest rounded-2xl p-3 text-center min-w-[90px]">
                <p className="text-xs text-on-surface-variant font-medium">Partidos</p>
                <p className="text-xl font-headline font-black text-primary">{auditStats.totalPartidos}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center space-x-3 transition-all ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          {actionMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{actionMessage.text}</span>
        </div>
      )}

      {/* Búsqueda Rápida */}
      <section className="bg-surface-container-high border border-surface-container-highest rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Búsqueda de Entidades
            </h2>
            <p className="text-xs text-on-surface-variant">
              Encuentra rápidamente usuarios, equipos y jugadores registrados en la liga.
            </p>
          </div>
        </div>

        <AsyncSearchSelect
          placeholder="Escribe al menos 2 letras (ej. 'cond', 'silva', 'vik', 'matias')..."
          onSearch={handleAsyncSearch}
          selectedItem={searchedEntity}
          onSelect={(item) => setSearchedEntity(item)}
          onClear={() => setSearchedEntity(null)}
        />

        {searchedEntity && (
          <div className="mt-3 p-4 rounded-xl bg-surface-container border border-surface-container-highest flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {searchedEntity.image && (
                <img
                  src={searchedEntity.image}
                  alt={searchedEntity.title}
                  className="w-12 h-12 rounded-xl object-cover border border-primary/30"
                />
              )}
              <div>
                <p className="text-base font-bold text-on-surface">{searchedEntity.title}</p>
                <p className="text-xs text-on-surface-variant">{searchedEntity.subtitle}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                  {searchedEntity.badge}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setSearchFilter(searchedEntity.title.split(" ")[0]);
                fetchUsers(1, searchedEntity.title.split(" ")[0]);
              }}
              className="text-xs font-bold bg-surface-container-highest hover:bg-surface-container px-3 py-2 rounded-xl text-on-surface transition-colors"
            >
              Filtrar en tabla
            </button>
          </div>
        )}
      </section>

      {/* Gestión de Usuarios */}
      <section className="bg-surface-container-high border border-surface-container-highest rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-surface-container-highest flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-headline font-bold text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gestión de Usuarios y Equipos
            </h2>
            <p className="text-xs text-on-surface-variant">
              Administra cuentas, visualiza datos y asigna roles a los miembros de la liga.
            </p>
          </div>

          {/* Quick Search on table */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Filtrar por nombre/correo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchUsers(1, searchFilter);
                }}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-8 pr-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            </div>
            <button
              onClick={() => fetchUsers(1, searchFilter)}
              className="p-2 rounded-xl border border-surface-container-highest hover:bg-surface-container text-on-surface transition-colors"
              title="Buscar / Refrescar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="py-3 px-4">Usuario / Equipo</th>
                <th className="py-3 px-4">Correo</th>
                <th className="py-3 px-4">Nick</th>
                <th className="py-3 px-4 text-center">Rol Actual</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-on-surface-variant">
                    Cargando usuarios desde el backend...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-on-surface-variant">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container/60 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={
                            u.logo ||
                            "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80"
                          }
                          alt={u.nombre}
                          className="w-9 h-9 rounded-xl object-cover border border-primary/20"
                        />
                        <div>
                          <p className="font-bold text-on-surface leading-tight">{u.nombre}</p>
                          <span className="text-[10px] text-on-surface-variant">ID #{u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-on-surface-variant font-mono text-xs">{u.correo}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface">
                        {u.nick}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          u.rol === "Administrador"
                            ? "bg-red-500/20 text-red-300 border border-red-500/30"
                            : "bg-primary/20 text-primary border border-primary/30"
                        }`}
                      >
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Role switcher button */}
                        <button
                          onClick={() => handleRoleToggle(u)}
                          disabled={u.id === user?.id}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-surface-container-highest hover:bg-surface-container text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                          title="Alternar Rol Administrador / Equipo"
                        >
                          Cambiar Rol
                        </button>

                        {/* Delete user button */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={u.id === user?.id}
                          className="p-1.5 rounded-xl border border-red-500/30 hover:bg-red-500/20 text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                          title="Dar de baja equipo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-3 bg-surface-container">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            onPageChange={(p) => fetchUsers(p, searchFilter)}
            limit={pagination.limit}
          />
        </div>
      </section>
    </div>
  );
};
