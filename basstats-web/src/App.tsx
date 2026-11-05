import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { MatchProvider } from "./context/MatchContext.js";
import { Layout } from "./components/layout/Layout.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { LiveMatchPage } from "./pages/LiveMatchPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { TeamPage } from "./pages/TeamPage.js";
import { PlayerProfilePage } from "./pages/PlayerProfilePage.js";
import { RosterSelectPage } from "./pages/RosterSelectPage.js";
import { MatchSummaryPage } from "./pages/MatchSummaryPage.js";
import { AdminPage } from "./pages/AdminPage.js";

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Layout hideNav>
                    <AuthPage />
                  </Layout>
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/team"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TeamPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/player/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlayerProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/roster"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RosterSelectPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/live"
              element={
                <ProtectedRoute>
                  <Layout>
                    <LiveMatchPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/match/summary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MatchSummaryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Layout>
                    <AdminPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MatchProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
