import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import { Activity, Shield, Users, Radio, Bell } from "lucide-react";

export const Header: React.FC = () => {
  const { currentTeam } = useAuth();
  const location = useLocation();

  const isLive = location.pathname.includes("/match/live");

  return (
    <header className="md:sticky top-0 z-40 bg-surface-container/90 backdrop-blur-md border-b border-surface-container-high px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Team Info */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-container to-surface-tint flex items-center justify-center shadow-lg shadow-primary-container/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-on-primary-container font-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-headline font-black text-xl tracking-tight text-on-surface">
                BASTATS
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-container/20 text-primary-container border border-primary-container/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-on-surface-variant/80 font-medium">
              {currentTeam.nombre} • <span className="text-primary font-semibold">{currentTeam.nick}</span>
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${location.pathname === "/"
              ? "bg-surface-container-high text-primary"
              : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
              }`}
          >
            Dashboard
          </Link>
          <Link
            to="/team"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${location.pathname === "/team"
              ? "bg-surface-container-high text-primary"
              : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
              }`}
          >
            <Shield className="w-4 h-4" />
            <span>Mi Equipo</span>
          </Link>
          <Link
            to="/roster"
            className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1.5 ${location.pathname === "/roster"
              ? "bg-surface-container-high text-primary"
              : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container-high/50"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Roster</span>
          </Link>
          <Link
            to="/match/live"
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-all shadow-md ${isLive
              ? "bg-primary-container text-white shadow-primary-container/30"
              : "bg-surface-container-highest text-primary hover:bg-primary-container/20"
              }`}
          >
            <Radio className={`w-4 h-4 ${isLive ? "animate-pulse" : ""}`} />
            <span>Consola En Vivo</span>
          </Link>
        </nav>

        {/* User / Notification */}
        <div className="flex items-center space-x-2">
          <Link
            to="/login"
            className="flex items-center space-x-2 pl-2 border-l border-surface-container-highest"
          >
            <img
              src={
                currentTeam.logo ||
                "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=100&auto=format&fit=crop&q=80"
              }
              alt="Logo"
              className="w-8 h-8 rounded-full object-cover border border-primary/30"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};
