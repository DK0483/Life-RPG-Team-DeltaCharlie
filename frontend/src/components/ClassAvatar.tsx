"use client";

import React from "react";

interface ClassAvatarProps {
  characterClass: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function ClassAvatar({ characterClass, size = "md", className = "" }: ClassAvatarProps) {
  const normalizedClass = characterClass.toLowerCase();

  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (normalizedClass === "mage") {
    return (
      <div className={`relative ${currentSize} rounded-2xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-950 border-2 border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Mystical Arcane Aura */}
          <circle cx="50" cy="50" r="42" stroke="url(#mageAura)" strokeWidth="2" strokeDasharray="4 4" className="animate-spin" style={{ animationDuration: "20s" }} />
          {/* Hood */}
          <path d="M25 85 C25 45, 30 20, 50 15 C70 20, 75 45, 75 85 Z" fill="#1E1B4B" stroke="#60A5FA" strokeWidth="2.5" />
          {/* Inner Shadow Mask */}
          <path d="M35 70 C35 48, 40 32, 50 30 C60 32, 65 48, 65 70 Z" fill="#090A15" />
          {/* Glowing Arcane Eyes */}
          <circle cx="43" cy="48" r="3.5" fill="#38BDF8" className="animate-pulse" filter="drop-shadow(0 0 4px #38BDF8)" />
          <circle cx="57" cy="48" r="3.5" fill="#38BDF8" className="animate-pulse" filter="drop-shadow(0 0 4px #38BDF8)" />
          {/* Floating Astral Rune Orb */}
          <circle cx="50" cy="74" r="8" fill="url(#orbGrad)" filter="drop-shadow(0 0 8px #818CF8)" />
          <path d="M47 74 L53 74 M50 71 L50 77" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <defs>
            <linearGradient id="mageAura" x1="0" y1="0" x2="100" y2="100">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
            <radialGradient id="orbGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#4338CA" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (normalizedClass === "rogue") {
    return (
      <div className={`relative ${currentSize} rounded-2xl bg-gradient-to-br from-amber-950/80 via-stone-950 to-slate-950 border-2 border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow Cloak Cowl */}
          <path d="M22 88 C22 50, 32 25, 50 18 C68 25, 78 50, 78 88 Z" fill="#1C1917" stroke="#F59E0B" strokeWidth="2.5" />
          {/* Stealth Face Wrap */}
          <path d="M34 52 C34 46, 66 46, 66 52 L64 72 C55 78, 45 78, 36 72 Z" fill="#292524" stroke="#78716C" strokeWidth="1.5" />
          {/* Piercing Keen Eyes */}
          <path d="M38 45 Q44 42 47 46" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 3px #FBBF24)" />
          <path d="M62 45 Q56 42 53 46" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" filter="drop-shadow(0 0 3px #FBBF24)" />
          {/* Dual Crossed Daggers */}
          <path d="M30 85 L44 68 M44 68 L48 72 M44 68 L41 65" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          <path d="M70 85 L56 68 M56 68 L52 72 M56 68 L59 65" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (normalizedClass === "paladin") {
    return (
      <div className={`relative ${currentSize} rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-900 to-amber-950/40 border-2 border-yellow-300/60 flex items-center justify-center shadow-lg shadow-yellow-500/20 overflow-hidden ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Radiating Sun Halo */}
          <circle cx="50" cy="46" r="36" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="2 6" className="animate-pulse" />
          {/* Winged Helm Plate */}
          <path d="M30 85 C30 50, 32 30, 50 25 C68 30, 70 50, 70 85 Z" fill="#334155" stroke="#FACC15" strokeWidth="2.5" />
          {/* Golden Faceplate Crest */}
          <path d="M40 45 L50 35 L60 45 L50 55 Z" fill="#FACC15" />
          {/* Holy Cross Eye Slit */}
          <line x1="50" y1="42" x2="50" y2="70" stroke="#FEF08A" strokeWidth="2" filter="drop-shadow(0 0 4px #FEF08A)" />
          <line x1="38" y1="52" x2="62" y2="52" stroke="#FEF08A" strokeWidth="2" filter="drop-shadow(0 0 4px #FEF08A)" />
          {/* Golden Wing Crests */}
          <path d="M28 36 C22 26, 26 15, 34 25" stroke="#FACC15" strokeWidth="2" fill="none" />
          <path d="M72 36 C78 26, 74 15, 66 25" stroke="#FACC15" strokeWidth="2" fill="none" />
        </svg>
      </div>
    );
  }

  // Default: Warrior
  return (
    <div className={`relative ${currentSize} rounded-2xl bg-gradient-to-br from-red-950 via-slate-950 to-neutral-950 border-2 border-red-500/50 flex items-center justify-center shadow-lg shadow-red-500/20 overflow-hidden ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Steel Great-Helm */}
        <path d="M25 85 C25 45, 30 25, 50 20 C70 25, 75 45, 75 85 Z" fill="#1E293B" stroke="#EF4444" strokeWidth="2.5" />
        {/* Reinforced Brow Plate */}
        <path d="M28 44 C40 38, 60 38, 72 44 L70 54 C58 50, 42 50, 30 54 Z" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Glowing Ruby Visor Slit */}
        <line x1="33" y1="52" x2="67" y2="52" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" filter="drop-shadow(0 0 6px #EF4444)" />
        {/* Battle Horns / Crest */}
        <path d="M28 32 C18 20, 22 8, 32 18" stroke="#F87171" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M72 32 C82 20, 78 8, 68 18" stroke="#F87171" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Crossed Greatswords Behind */}
        <line x1="20" y1="20" x2="80" y2="80" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        <line x1="80" y1="20" x2="20" y2="80" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
      </svg>
    </div>
  );
}
