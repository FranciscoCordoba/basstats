import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { MatchProvider } from "./context/MatchContext.js";
import { Layout } from "./components/layout/Layout.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { LiveMatchPage } from "./pages/LiveMatchPage.js";
import { AuthPage } from "./pages/AuthPage.js";
import { TeamPage } from "./pages/TeamPage.js";
import { PlayerProfilePage } from "./pages/PlayerProfilePage.js";
import { RosterSelectPage } from "./pages/RosterSelectPage.js";

import { MatchSummaryPage } from "./pages/MatchSummaryPage.js";

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchProvider>
          <Routes>
            <Route
              path="/"
              element={
                <Layout>
                  <DashboardPage />
                </Layout>
              }
            />
            <Route
              path="/match/live"
              element={
                <Layout>
                  <LiveMatchPage />
                </Layout>
              }
            />
            <Route
              path="/match/summary"
              element={
                <Layout>
                  <MatchSummaryPage />
                </Layout>
              }
            />
            <Route
              path="/login"
              element={
                <Layout hideNav>
                  <AuthPage />
                </Layout>
              }
            />
            {/*<Route
              path="/team"
              element={
                <Layout>
                  <TeamPage />
                </Layout>
              }
            />*/}
            <Route
              path="/player/:id"
              element={
                <Layout>
                  <PlayerProfilePage />
                </Layout>
              }
            />
            <Route
              path="/roster"
              element={
                <Layout>
                  <RosterSelectPage />
                </Layout>
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
