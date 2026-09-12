"use client";

import React, { useState, useEffect } from "react";
import { sounds } from "@/lib/sound";
import {
  Scroll,
  Skull,
  ShoppingBag,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface GuidanceBannerProps {
  onNavigate: (tab: "quests" | "shop" | "boss" | "logs") => void;
  activeTab: string;
}

const STORAGE_KEY = "life_rpg_guidance_dismissed_v1";

export function GuidanceBanner({ onNavigate, activeTab }: GuidanceBannerProps) {
  const [isDismissed, setIsDismissed] = useState<boolean>(true); // default true to prevent SSR hydration mismatch

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    sounds.unlock();
    sounds.playEquip();
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed) {
    return null;
  }

  const steps = [
    {
      id: "quests" as const,
      num: "01",
      title: "Summon & Complete Quests",
      desc: "Add real-world tasks or 1-click Curated Packs. Check them off to earn XP & Gold.",
      actionText: "Open Quest Board",
      icon: Scroll,
      color: "border-blue-500/40 bg-blue-500/10 text-blue-300",
      accent: "from-blue-500/20 to-indigo-500/10",
    },
    {
      id: "boss" as const,
      num: "02",
      title: "Strike Dungeon Bosses",
      desc: "Every completed task deals real strike damage to slay procrastination monsters.",
      actionText: "Enter Boss Arena",
      icon: Skull,
      color: "border-red-500/40 bg-red-500/10 text-red-300",
      accent: "from-red-500/20 to-orange-500/10",
    },
    {
      id: "shop" as const,
      num: "03",
      title: "Equip Legendary Spoils",
      desc: "Spend hard-earned gold at the Armory to buy weapons, armor, potions & themes.",
      actionText: "Visit Armory",
      icon: ShoppingBag,
      color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
      accent: "from-amber-500/20 to-yellow-500/10",
    },
  ];

  return (
    <div className="mb-4 sm:mb-6 relative rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-rpg-card to-rpg-card p-4 sm:p-6 shadow-xl shadow-amber-500/5 animate-in fade-in duration-300">
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-rpg-cardHover transition flex items-center gap-1 text-xs"
        title="Dismiss Guild Guidance"
      >
        <span className="hidden sm:inline font-sans text-[11px] text-gray-400">Dismiss</span>
        <X className="w-4 h-4" />
      </button>

      {/* Header Info */}
      <div className="max-w-2xl pr-8 sm:pr-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold mb-2">
          <Sparkles className="w-3 h-3" />
          <span>First-Time Adventurer Guidance</span>
        </div>
        <h2 className="font-cinzel text-lg sm:text-2xl font-black text-gray-100 flex items-center gap-2">
          <span>Welcome to the Guildhall, Adventurer!</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-relaxed">
          Your path to overcoming procrastination starts now. Master these three foundational rites of passage:
        </p>
      </div>

      {/* 3 Interactive Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5 mt-4 sm:mt-5">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          return (
            <div
              key={step.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all bg-gradient-to-b ${
                step.accent
              } ${
                isActive
                  ? "border-amber-400 shadow-md ring-1 ring-amber-400/50"
                  : "border-rpg-border/70 hover:border-gray-500"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-lg border ${step.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-black text-gray-500">
                    STEP {step.num}
                  </span>
                </div>
                <h3 className="font-cinzel text-sm font-bold text-gray-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-3">
                  {step.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.unlock();
                  sounds.playCoin();
                  onNavigate(step.id);
                }}
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  isActive
                    ? "bg-amber-400 text-gray-950 font-black shadow-sm"
                    : "bg-rpg-bg hover:bg-rpg-cardHover text-gray-200 border border-rpg-border"
                }`}
              >
                <span>{step.actionText}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
