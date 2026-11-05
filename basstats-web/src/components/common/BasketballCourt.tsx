import React from "react";
import type { UbicacionTiro } from "../../types/index.js";

interface BasketballCourtProps {
  shots?: UbicacionTiro[];
  onCourtClick?: (coords: { x: number; y: number }) => void;
  interactive?: boolean;
  activeSelectedShot?: { x: number; y: number } | null;
  className?: string;
}

export const BasketballCourt: React.FC<BasketballCourtProps> = ({
  shots = [],
  onCourtClick,
  interactive = false,
  activeSelectedShot = null,
  className = "",
}) => {
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const getCoordinatesFromEvent = (clientX: number, clientY: number) => {
    if (!interactive || !onCourtClick || !svgRef.current) return;
    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const svgCoords = point.matrixTransform(ctm.inverse());
      const clampedX = Math.max(0, Math.min(100, svgCoords.x));
      const clampedY = Math.max(0, Math.min(80, svgCoords.y));

      onCourtClick({
        x: Math.round(clampedX * 10) / 10,
        y: Math.round(clampedY * 10) / 10,
      });
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    getCoordinatesFromEvent(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!interactive) return;
    const touch = e.touches[0];
    if (touch) {
      getCoordinatesFromEvent(touch.clientX, touch.clientY);
    }
  };

  return (
    <div
      className={`relative w-full aspect-[5/4] max-h-[380px] bg-gradient-to-b from-surface-container-high to-surface-container-low rounded-2xl border border-surface-container-highest/80 shadow-inner overflow-hidden select-none flex items-center justify-center ${className}`}
    >
      {/* SVG Basketball Half Court */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 80"
        className={`w-full h-full ${interactive ? "cursor-crosshair touch-manipulation" : "cursor-default"}`}
        onClick={handleSvgClick}
        onTouchStart={handleTouchStart}
      >
        {/* Court Outline */}
        <rect
          x="2"
          y="2"
          width="96"
          height="76"
          rx="4"
          fill="none"
          stroke="#584237"
          strokeWidth="1"
          strokeOpacity="0.4"
        />

        {/* 3-Point Arc */}
        <path
          d="M 12 78 L 12 59 A 38 38 0 0 1 88 59 L 88 78"
          fill="none"
          stroke="#ffb690"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {/* The Key / Paint */}
        <rect
          x="35"
          y="42"
          width="30"
          height="36"
          fill="#ffb690"
          fillOpacity="0.04"
          stroke="#ffb690"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {/* Free Throw Circle (Top Arc) */}
        <path
          d="M 35 42 A 15 15 0 0 1 65 42"
          fill="none"
          stroke="#ffb690"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
        {/* Free Throw Circle (Dashed Bottom Arc) */}
        <path
          d="M 35 42 A 15 15 0 0 0 65 42"
          fill="none"
          stroke="#ffb690"
          strokeWidth="1"
          strokeDasharray="2,2"
          strokeOpacity="0.3"
        />

        {/* Restricted Area Arc */}
        <path
          d="M 44 72 A 6 6 0 0 1 56 72"
          fill="none"
          stroke="#ffb690"
          strokeWidth="1"
          strokeOpacity="0.5"
        />

        {/* Backboard & Rim */}
        <line x1="42" y1="74" x2="58" y2="74" stroke="#e0e3e5" strokeWidth="1.5" />
        <circle cx="50" cy="71" r="2.5" fill="none" stroke="#f97316" strokeWidth="1.5" />

        {/* Existing Shots */}
        {shots.map((shot, index) => {
          const isMade = shot.anotado ?? true;
          return (
            <g key={shot.id ?? index} transform={`translate(${shot.x}, ${shot.y})`}>
              <circle
                r="2.2"
                fill={isMade ? "#22c55e" : "#ef4444"}
                stroke="#101415"
                strokeWidth="0.8"
                className="transition-transform hover:scale-150"
              />
              {isMade ? (
                <circle r="0.8" fill="#ffffff" />
              ) : (
                <path
                  d="M -1 -1 L 1 1 M -1 1 L 1 -1"
                  stroke="#ffffff"
                  strokeWidth="0.6"
                />
              )}
            </g>
          );
        })}

        {/* Selected Pending Shot Marker */}
        {activeSelectedShot && (
          <g transform={`translate(${activeSelectedShot.x}, ${activeSelectedShot.y})`}>
            <circle
              r="4.5"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
              strokeDasharray="1.5,1.5"
              className="animate-spin"
            />
            <circle r="2.5" fill="#f97316" className="animate-pulse" />
          </g>
        )}
      </svg>

      {/* Guide overlay */}
      {interactive && (
        <div className="absolute top-2 right-2 bg-surface-container/80 backdrop-blur-sm border border-surface-container-highest px-2 py-1 rounded text-[10px] text-on-surface-variant font-medium pointer-events-none">
          Haz clic en la cancha para marcar el tiro
        </div>
      )}
    </div>
  );
};
