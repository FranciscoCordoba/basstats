import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { Activity, Shield, Users, Radio, ShieldAlert, LogOut, LogIn } from "lucide-react";

export const Header: React.FC = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const isLive = location.pathname.includes("/match/live");

  return (
    <header className="md:sticky top-0 z-40 bg-surface-container/90 backdrop-blur-md border-b border-surface-container-high px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Team Info */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-headline font-black text-xl tracking-tight text-on-surface">
                BASSTATS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              location.pathname === "/"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/team"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
              location.pathname === "/team"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Mi Equipo</span>
          </Link>

          <Link
            to="/roster"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-1.5 ${
              location.pathname === "/roster"
                ? "bg-surface-container-high text-primary"
                : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Roster</span>
          </Link>

          <Link
            to="/match/live"
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center space-x-2 transition-all shadow-md ${
              isLive
                ? "bg-primary text-white shadow-primary/30"
                : "bg-surface-container-highest text-primary hover:bg-primary/20"
            }`}
          >
            <Radio className={`w-4 h-4 ${isLive ? "animate-pulse" : ""}`} />
            <span>Consola En Vivo</span>
          </Link>

          {/* Admin Exclusive Link */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-colors flex items-center space-x-1.5 ${
                location.pathname === "/admin"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* User Profile & Auth */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-surface-container-highest">
              <Link to="/team" className="flex items-center space-x-2 text-right group">
                <div className="hidden sm:block">
                  <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
                    {user.nombre}
                  </p>
                  <span
                    className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full ${
                      user.rol === "Administrador"
                        ? "bg-red-500/20 text-red-300"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {user.rol}
                  </span>
                </div>
                <img
                  src={
                    user.logo ||
                    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80"
                  }
                  alt={user.nombre}
                  className="w-9 h-9 rounded-xl object-cover border-2 border-primary/30"
                />
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-xl border border-surface-container-highest hover:bg-red-500/10 hover:text-red-400 text-on-surface-variant transition-colors"
                title="Cerrar Sesión (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-primary hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-1.5 transition-transform active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
