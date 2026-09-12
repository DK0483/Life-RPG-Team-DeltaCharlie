"use client";

import React from "react";

interface AttributeRadarProps {
  stats: {
    strength: number;
    intellect: number;
    vitality: number;
    agility: number;
    charisma: number;
  };
}

export function AttributeRadar({ stats }: AttributeRadarProps) {
  const size = 200;
  const center = size / 2;
  const radius = 68;
  const maxStat = 35; // baseline scale cap

  // 5 axes: Strength (top), Intellect (top-right), Charisma (bottom-right), Agility (bottom-left), Vitality (top-left)
  const axes = [
    { key: "strength", label: "STR", val: stats.strength, angle: -Math.PI / 2, color: "#F87171" },
    { key: "intellect", label: "INT", val: stats.intellect, angle: -Math.PI / 2 + (2 * Math.PI) / 5, color: "#60A5FA" },
    { key: "charisma", label: "CHA", val: stats.charisma, angle: -Math.PI / 2 + (4 * Math.PI) / 5, color: "#F472B6" },
    { key: "agility", label: "AGI", val: stats.agility, angle: -Math.PI / 2 + (6 * Math.PI) / 5, color: "#FBBF24" },
    { key: "vitality", label: "VIT", val: stats.vitality, angle: -Math.PI / 2 + (8 * Math.PI) / 5, color: "#34D399" },
  ];

  // Concentric pentagon rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  const getPentagonPoints = (scale: number) => {
    return axes
      .map((a) => {
        const x = center + radius * scale * Math.cos(a.angle);
        const y = center + radius * scale * Math.sin(a.angle);
        return `${x},${y}`;
      })
      .join(" ");
  };

  // Calculate player stat polygon points
  const playerPoints = axes
    .map((a) => {
      const normalized = Math.min(1.0, Math.max(0.15, a.val / maxStat));
      const x = center + radius * normalized * Math.cos(a.angle);
      const y = center + radius * normalized * Math.sin(a.angle);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-48 h-48 sm:w-52 sm:h-52">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.15" />
            </radialGradient>
          </defs>

          {/* Concentric Grid Rings */}
          {rings.map((ring, idx) => (
            <polygon
              key={idx}
              points={getPentagonPoints(ring)}
              fill="none"
              stroke="#334155"
              strokeWidth="1"
              strokeDasharray={idx === 3 ? "none" : "2 2"}
              opacity={0.6}
            />
          ))}

          {/* Radial Axis Spokes */}
          {axes.map((a, idx) => {
            const endX = center + radius * Math.cos(a.angle);
            const endY = center + radius * Math.sin(a.angle);
            return (
              <line
                key={idx}
                x1={center}
                y1={center}
                x2={endX}
                y2={endY}
                stroke="#1E293B"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Player Stat Polygon */}
          <polygon
            points={playerPoints}
            fill="url(#radarFill)"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="transition-all duration-700"
            filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))"
          />

          {/* Vertex Stat Dots & Labels */}
          {axes.map((a, idx) => {
            const normalized = Math.min(1.0, Math.max(0.15, a.val / maxStat));
            const dotX = center + radius * normalized * Math.cos(a.angle);
            const dotY = center + radius * normalized * Math.sin(a.angle);

            // Label Position offset outward
            const labelX = center + (radius + 18) * Math.cos(a.angle);
            const labelY = center + (radius + 16) * Math.sin(a.angle);

            return (
              <g key={idx}>
                {/* Glowing vertex dot */}
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="3.5"
                  fill="#FDE68A"
                  stroke="#B45309"
                  strokeWidth="1.5"
                />

                {/* Outer Attribute Badge */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={a.color}
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {a.label} {a.val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest -mt-1 font-cinzel">
        Pentagonal Aptitude Web
      </span>
    </div>
  );
}
