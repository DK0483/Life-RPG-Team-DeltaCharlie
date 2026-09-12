"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Swords,
  Coins,
  Flame,
  Volume2,
  VolumeX,
  LogOut,
  Shield,
  ShoppingBag,
  Skull,
  Scroll,
  User,
} from "lucide-react";

interface NavbarProps {
  activeTab: "quests" | "shop" | "boss" | "logs";
  setActiveTab: (tab: "quests" | "shop" | "boss" | "logs") => void;
  onOpenAuth: () => void;
}

export function Navbar({ activeTab, setActiveTab, onOpenAuth }: NavbarProps) {
  const { user, character, isSoundMuted, toggleSound, logout } = useAuth();

  return (
    <>
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b border-rpg-border/60 bg-rpg-bg/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 shrink-0">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                LIFE RPG
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-rpg-goldDark tracking-widest uppercase">
                Realm of Progression
              </span>
            </div>
          </div>

          {/* Center Tabs for Desktop */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-rpg-card/80 p-1 rounded-xl border border-rpg-border">
              <button
                onClick={() => setActiveTab("quests")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "quests"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-rpg-cardHover"
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Quest Board</span>
              </button>

              <button
                onClick={() => setActiveTab("shop")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "shop"
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-rpg-cardHover"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Armory & Shop</span>
              </button>

              <button
                onClick={() => setActiveTab("boss")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "boss"
                    ? "bg-red-500/15 text-red-300 border border-red-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-rpg-cardHover"
                }`}
              >
                <Skull className="w-4 h-4" />
                <span>Dungeon Raid</span>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === "logs"
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200 hover:bg-rpg-cardHover"
                }`}
              >
                <Scroll className="w-4 h-4" />
                <span>Hero Codex</span>
              </button>
            </nav>
          )}

          {/* Right Status & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              aria-label={isSoundMuted ? "Unmute audio" : "Mute audio"}
              className="p-1.5 sm:p-2 rounded-lg bg-rpg-card hover:bg-rpg-cardHover border border-rpg-border text-gray-300 hover:text-amber-400 transition-colors"
              title={isSoundMuted ? "Sound Muted (Click to enable)" : "Sound On (Click to mute)"}
            >
              {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />}
            </button>

            {user && character ? (
              <>
                {/* Gold Counter */}
                <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm">
                  <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 shrink-0" />
                  <span className="font-bold tracking-wide">{character.gold}</span>
                  <span className="hidden sm:inline text-[10px] text-amber-400/70 font-semibold uppercase">Gold</span>
                </div>

                {/* Streak Counter */}
                <div className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs sm:text-sm">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 animate-pulse shrink-0" />
                  <span className="font-bold">{character.streakCount}</span>
                  <span className="hidden sm:inline text-[10px] text-orange-400/70 uppercase">Days</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => logout()}
                  className="p-1.5 sm:p-2 rounded-lg bg-rpg-card hover:bg-red-500/20 border border-rpg-border hover:border-red-500/40 text-gray-400 hover:text-red-400 transition-all"
                  title="Depart Camp (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Enter Realm</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-rpg-card/95 backdrop-blur-xl border-t border-rpg-border/90 py-1 px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
          <div className="grid grid-cols-4 items-center gap-1 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("quests")}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                activeTab === "quests"
                  ? "bg-amber-500/20 text-amber-300 font-bold shadow-inner"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Shield className={`w-5 h-5 mb-0.5 ${activeTab === "quests" ? "text-amber-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Quests</span>
            </button>

            <button
              onClick={() => setActiveTab("shop")}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                activeTab === "shop"
                  ? "bg-amber-500/20 text-amber-300 font-bold shadow-inner"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <ShoppingBag className={`w-5 h-5 mb-0.5 ${activeTab === "shop" ? "text-amber-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Armory</span>
            </button>

            <button
              onClick={() => setActiveTab("boss")}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                activeTab === "boss"
                  ? "bg-red-500/20 text-red-300 font-bold shadow-inner"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Skull className={`w-5 h-5 mb-0.5 ${activeTab === "boss" ? "text-red-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Boss Raid</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                activeTab === "logs"
                  ? "bg-indigo-500/20 text-indigo-300 font-bold shadow-inner"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Scroll className={`w-5 h-5 mb-0.5 ${activeTab === "logs" ? "text-indigo-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] tracking-tight">Codex</span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
