import React from "react";
import { Header } from "./Header.js";
import { BottomNav } from "./BottomNav.js";

export const Layout: React.FC<{ children: React.ReactNode; hideNav?: boolean }> = ({
  children,
  hideNav = false,
}) => {
  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {!hideNav && <Header />}
      <main className={`flex-1 ${!hideNav ? "pb-20 md:pb-8" : ""}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
