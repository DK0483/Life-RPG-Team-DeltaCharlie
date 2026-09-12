"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import confetti from "canvas-confetti";
import { Sparkles, Trophy, Heart, Zap, Shield, ArrowUp } from "lucide-react";

export function LevelUpModal() {
  const { activeLevelUp, closeLevelUpModal, character } = useAuth();

  useEffect(() => {
    if (activeLevelUp) {
      // Fire double celebratory confetti cannons!
      const end = Date.now() + 1000;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() * 0.4 },
          colors: ["#F59E0B", "#EC4899", "#8B5CF6", "#10B981", "#3B82F6"],
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [activeLevelUp]);

  if (!activeLevelUp) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-950/80 via-rpg-card to-rpg-card border-2 border-amber-400/80 rounded-3xl max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.4)] relative animate-in zoom-in-90 duration-300">
        {/* Glow halo */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/50 mx-auto mb-4 border-2 border-amber-200 animate-bounce">
          <Trophy className="w-10 h-10 text-gray-950 stroke-[2.5]" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-amber-400">
          Ascension Achieved
        </span>

        <h2 className="font-cinzel text-3xl font-black text-white mt-1 mb-2 tracking-wide">
          LEVEL UP!
        </h2>

        {/* Level badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-cinzel font-bold text-base mb-4">
          <span>Level {activeLevelUp.level - activeLevelUp.levelsGained}</span>
          <ArrowUp className="w-4 h-4 text-amber-400 stroke-[3]" />
          <span className="text-white font-extrabold text-lg">Level {activeLevelUp.level}</span>
        </div>

        <p className="text-xs text-gray-300 mb-5 leading-relaxed">
          Your discipline echoes throughout the guild! Your powers have surged to greater heights.
        </p>

        {/* Perks list */}
        <div className="space-y-2 text-left bg-rpg-bg/80 p-3.5 rounded-2xl border border-rpg-border/70 mb-5 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Heart className="w-4 h-4 fill-emerald-400/20" />
            <span>Health (HP) fully restored & increased (+15 Max HP)</span>
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-bold">
            <Zap className="w-4 h-4 fill-blue-400/20" />
            <span>Mana (MP) fully replenished (+10 Max Mana)</span>
          </div>
          <div className="flex items-center gap-2 text-purple-300 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Attributes bolstered across active categories</span>
          </div>
        </div>

        <button
          onClick={closeLevelUpModal}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:brightness-110 text-gray-950 font-black text-sm shadow-lg shadow-amber-500/30 transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4 stroke-[2.5]" />
          <span>Claim Glory & Proceed</span>
        </button>
      </div>
    </div>
  );
}
