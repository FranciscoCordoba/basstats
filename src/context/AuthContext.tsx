import React, { createContext, useContext, useState, useEffect } from "react";
import type { Equipo } from "../types/index.js";
import { initialEquipo } from "../data/mockData.js";
import { api } from "../services/api.js";

interface AuthContextType {
  currentTeam: Equipo;
  isAuthenticated: boolean;
  login: (emailOrNick: string) => Promise<boolean>;
  registerTeam: (teamData: {
    nombre: string;
    nick: string;
    correo: string;
    contrasena: string;
    logo?: string;
  }) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<Equipo>(() => {
    const saved = localStorage.getItem("basstats_team");
    return saved ? JSON.parse(saved) : initialEquipo;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("basstats_auth") === "true";
  });

  useEffect(() => {
    localStorage.setItem("basstats_team", JSON.stringify(currentTeam));
    localStorage.setItem("basstats_auth", isAuthenticated.toString());
  }, [currentTeam, isAuthenticated]);

  const login = async (emailOrNick: string): Promise<boolean> => {
    try {
      const equipos = await api.getEquipos();
      const found = equipos.find(
        (e) =>
          e.correo.toLowerCase() === emailOrNick.toLowerCase() ||
          e.nick.toLowerCase() === emailOrNick.toLowerCase()
      );
      if (found) {
        setCurrentTeam(found);
        setIsAuthenticated(true);
        return true;
      }
      // Demo fallback
      setCurrentTeam({
        ...initialEquipo,
        nick: emailOrNick.toUpperCase(),
      });
      setIsAuthenticated(true);
      return true;
    } catch {
      setIsAuthenticated(true);
      return true;
    }
  };

  const registerTeam = async (teamData: {
    nombre: string;
    nick: string;
    correo: string;
    contrasena: string;
    logo?: string;
  }): Promise<boolean> => {
    try {
      const created = await api.createEquipo(teamData);
      setCurrentTeam(created);
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      console.error("Register team failed:", e);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ currentTeam, isAuthenticated, login, registerTeam, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
