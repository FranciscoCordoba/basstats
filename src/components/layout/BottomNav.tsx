import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Radio, Users, Shield, UserCheck } from "lucide-react";

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Inicio", icon: Home },
    { path: "/match/live", label: "En Vivo", icon: Radio, highlight: true },
    { path: "/roster", label: "Roster", icon: UserCheck },
    { path: "/team", label: "Equipo", icon: Shield },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container/95 backdrop-blur-lg border-t border-surface-container-high px-2 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.highlight) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative -top-4 flex flex-col items-center"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
                    isActive
                      ? "bg-primary-container text-white ring-4 ring-primary-container/20"
                      : "bg-surface-container-highest text-primary ring-2 ring-primary/40"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-primary tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant/70 hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
