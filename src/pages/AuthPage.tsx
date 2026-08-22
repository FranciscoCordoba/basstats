import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Activity, Shield, Mail, Lock, Key, Image, ArrowRight } from "lucide-react";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, registerTeam } = useAuth();

  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState<string>("condores@basstats.app");
  const [loginPassword, setLoginPassword] = useState<string>("123456");

  // Register form
  const [nombre, setNombre] = useState<string>("");
  const [nick, setNick] = useState<string>("");
  const [correo, setCorreo] = useState<string>("");
  const [contrasena, setContrasena] = useState<string>("");
  const [logo, setLogo] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegister) {
        if (!nombre || !nick || !correo || !contrasena) {
          setErrorMsg("Por favor completa todos los campos requeridos");
          setLoading(false);
          return;
        }

        const success = await registerTeam({
          nombre,
          nick,
          correo,
          contrasena,
          logo: logo || undefined,
        });

        if (success) {
          navigate("/");
        } else {
          setErrorMsg("Error al registrar el equipo. Verifica los datos.");
        }
      } else {
        const success = await login(loginIdentifier);
        if (success) {
          navigate("/");
        } else {
          setErrorMsg("Credenciales incorrectas.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-surface-container-high border border-surface-container-highest rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-primary-container to-surface-tint flex items-center justify-center shadow-lg shadow-primary-container/30">
            <Activity className="w-8 h-8 text-on-primary-container" />
          </div>
          <h1 className="text-2xl font-headline font-black tracking-tight text-on-surface">
            BASTATS TRACKER
          </h1>
          <p className="text-xs text-on-surface-variant">
            Sistema Profesional de Estadísticas y Scouting de Básquetbol
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-surface-container rounded-2xl p-1 border border-surface-container-highest">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              !isRegister
                ? "bg-primary-container text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
              isRegister
                ? "bg-primary-container text-white shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Registrar Equipo
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error-container/40 border border-error text-error text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister ? (
            <>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Nombre del Club / Equipo
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej: Boston Celtics"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Nick / Abreviación (3-4 letras)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="Ej: CEL"
                    value={nick}
                    onChange={(e) => setNick(e.target.value.toUpperCase())}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface uppercase focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="coach@equipo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  URL del Logo del Club (Opcional)
                </label>
                <div className="relative">
                  <Image className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/logo.png"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Correo o Nick de Equipo
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="condores@basstats.app o CND"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-container to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white font-headline font-black text-sm shadow-lg shadow-primary-container/20 flex items-center justify-center space-x-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span>{isRegister ? "Registrar y Crear Equipo" : "Acceder al Panel"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
