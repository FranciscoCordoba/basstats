import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Activity, Shield, Mail, Lock, User, Sparkles, Loader2, AlertCircle } from "lucide-react";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Formulario de inicio de sesión
  const [correoLogin, setCorreoLogin] = useState<string>("admin@basstats.com");
  const [contrasenaLogin, setContrasenaLogin] = useState<string>("Admin123!");

  // Formulario de registro de nuevo usuario o equipo
  const [nombre, setNombre] = useState<string>("");
  const [nick, setNick] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [rol, setRol] = useState<"Administrador" | "Equipo">("Equipo");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegister) {
        if (!nombre || !nick || !correo || !contrasena) {
          setErrorMsg("Por favor completa todos los campos obligatorios.");
          setLoading(false);
          return;
        }

        await register({
          nombre,
          nick,
          correo,
          contrasena,
          rol,
        });
        navigate("/");
      } else {
        await login(correoLogin, contrasenaLogin);
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Credenciales incorrectas o error de servidor");
    } finally {
      setLoading(false);
    }
  };

  const setFastCredentials = (c: string, p: string) => {
    setCorreoLogin(c);
    setContrasenaLogin(p);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-headline font-black text-on-surface">
            {isRegister ? "Crear Nueva Cuenta" : "Acceso al Sistema"}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {isRegister
              ? "Registra tu equipo o administrador de liga"
              : "Ingresa con tu correo electrónico y contraseña"}
          </p>
        </div>

        {/* Demo Fast Login Shortcuts (Ideal para defensa oral) */}
        {!isRegister && (
          <div className="p-3 bg-surface-container border border-surface-container-highest rounded-2xl space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant flex items-center gap-1">
              Cuentas de Acceso Rápido:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFastCredentials("admin@basstats.com", "Admin123!")}
                className="text-left p-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs transition-colors"
              >
                <span className="font-bold block text-red-300">Rol: Administrador</span>
                <span className="text-[10px] text-on-surface-variant">admin@basstats.com</span>
              </button>
              <button
                type="button"
                onClick={() => setFastCredentials("condores@basstats.com", "Equipo123!")}
                className="text-left p-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-xs transition-colors"
              >
                <span className="font-bold block text-primary">Rol: Equipo</span>
                <span className="text-[10px] text-on-surface-variant">condores@basstats.com</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Nombre (Equipo o Admin)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Club Los Cóndores"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    Nick / Sigla
                  </label>
                  <input
                    type="text"
                    required
                    value={nick}
                    onChange={(e) => setNick(e.target.value.toUpperCase())}
                    placeholder="CND"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                    Rol en Sistema
                  </label>
                  <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value as "Administrador" | "Equipo")}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="Equipo">Equipo</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Contraseña (mínimo 6 caracteres)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={correoLogin}
                    onChange={(e) => setCorreoLogin(e.target.value)}
                    placeholder="admin@basstats.com"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-on-surface-variant mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={contrasenaLogin}
                    onChange={(e) => setContrasenaLogin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-primary hover:bg-orange-600 text-white font-headline font-bold text-sm shadow-xl shadow-primary/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>{isRegister ? "Registrar Cuenta" : "Iniciar Sesión"}</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="text-center pt-2 border-t border-surface-container-highest">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg("");
            }}
            className="text-xs font-bold text-primary hover:underline"
          >
            {isRegister
              ? "¿Ya tienes una cuenta? Iniciar Sesión"
              : "¿No tienes una cuenta aún? Registrarse"}
          </button>
        </div>
      </div>
    </div>
  );
};
