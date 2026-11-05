import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Usuario } from "../types/index.js";
import { api } from "../services/api.js";

const emptyTeam: Usuario = {
  id: 0,
  nombre: "Sin Equipo",
  correo: "",
  nick: "",
  rol: "Equipo",
  logo: null,
};

interface AuthContextType {
  user: Usuario | null;
  currentTeam: Usuario;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  register: (data: {
    nombre: string;
    correo: string;
    nick: string;
    contrasena: string;
    rol?: "Administrador" | "Equipo";
    logo?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { nombre?: string; nick?: string }) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const token = localStorage.getItem("basstats_token");
    const saved = localStorage.getItem("basstats_user");
    if (!token || !saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Restaurar sesión autenticada a partir del token JWT
  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("basstats_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await api.getProfile();
      setUser(profile);
      localStorage.setItem("basstats_user", JSON.stringify(profile));
    } catch (err) {
      console.warn("Sesión expirada o no válida, reiniciando:", err);
      localStorage.removeItem("basstats_token");
      localStorage.removeItem("basstats_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (correo: string, contrasena: string) => {
    const result = await api.login(correo, contrasena);
    setUser(result.user);
    localStorage.setItem("basstats_user", JSON.stringify(result.user));
  };

  const register = async (data: {
    nombre: string;
    correo: string;
    nick: string;
    contrasena: string;
    rol?: "Administrador" | "Equipo";
    logo?: string;
  }) => {
    const result = await api.register(data);
    setUser(result.user);
    localStorage.setItem("basstats_user", JSON.stringify(result.user));
  };

  const logout = () => {
    localStorage.removeItem("basstats_token");
    localStorage.removeItem("basstats_user");
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (data: { nombre?: string; nick?: string }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem("basstats_user", JSON.stringify(updated));
  };

  const uploadAvatar = async (file: File) => {
    const res = await api.uploadAvatar(file);
    setUser(res.user);
    localStorage.setItem("basstats_user", JSON.stringify(res.user));
    return res.url;
  };

  const isAuthenticated = !!user && !!localStorage.getItem("basstats_token");
  const isAdmin = user?.rol === "Administrador";
  const currentTeam = user || emptyTeam;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentTeam,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
      }}
    >
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
