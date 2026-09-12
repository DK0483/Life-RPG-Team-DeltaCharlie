"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "@/lib/sound";
import { Navbar } from "@/components/Navbar";
import { CharacterSheet } from "@/components/CharacterSheet";
import { QuestBoard } from "@/components/QuestBoard";
import { ShopAndInventory } from "@/components/ShopAndInventory";
import { BossArena } from "@/components/BossArena";
import { ActivityLogView } from "@/components/ActivityLogView";
import { AuthModal } from "@/components/AuthModal";
import { LevelUpModal } from "@/components/LevelUpModal";
import {
  Swords,
  Shield,
  Zap,
  Flame,
  ShoppingBag,
  Skull,
  Scroll,
  Trophy,
  Sparkles,
  ArrowRight,
  Keyboard,
  X,
} from "lucide-react";

export default function HomePage() {
  const { user, character, isLoading, toggleSound } = useAuth();
  const [activeTab, setActiveTab] = useState<"quests" | "shop" | "boss" | "logs">("quests");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      if (e.key === "1") {
        setActiveTab("quests");
      } else if (e.key === "2") {
        setActiveTab("shop");
      } else if (e.key === "3") {
        setActiveTab("boss");
      } else if (e.key === "4") {
        setActiveTab("logs");
      } else if (e.key === "m" || e.key === "M") {
        toggleSound();
      } else if (e.key === "?") {
        setIsHelpModalOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsHelpModalOpen(false);
        setIsAuthModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSound]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-2xl shadow-amber-500/20 border border-amber-400/40 animate-pulse mb-4">
          <Swords className="w-8 h-8 text-gray-950 stroke-[2.5]" />
        </div>
        <p className="font-cinzel text-lg font-bold text-amber-300 animate-pulse">
          Awakening Realm...
        </p>
      </div>
    );
  }

  const themeClass = character?.activeTheme ? `theme-${character.activeTheme}` : "";

  return (
    <div className={`min-h-screen bg-rpg-bg text-gray-100 flex flex-col transition-colors duration-500 ${themeClass}`}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {user && character ? (
          /* Authenticated Hero Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Character Sheet & Vitals */}
            <div className="lg:col-span-4 sticky top-20">
              <CharacterSheet />
            </div>

            {/* Right Column: Tab View */}
            <div className="lg:col-span-8">
              {activeTab === "quests" && <QuestBoard />}
              {activeTab === "shop" && <ShopAndInventory />}
              {activeTab === "boss" && <BossArena />}
              {activeTab === "logs" && <ActivityLogView />}
            </div>
          </div>
        ) : (
          /* Unauthenticated Landing & Realm Showcase */
          <div className="py-12 sm:py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Hero Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack Web RPG Productivity Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-cinzel text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
              Transform Mundane Tasks Into An{" "}
              <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                Epic RPG Adventure
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mb-10 leading-relaxed">
              Ditch dull to-do lists and procrastination. Level up real-world attributes, conquer
              deadly procrastination dungeon bosses, amass gold, and equip legendary artifacts.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Forge Your Hero</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rpg-card hover:bg-rpg-cardHover border border-rpg-border text-gray-200 font-bold text-sm transition"
              >
                Sign In to Existing Hero
              </button>
            </div>

            {/* Feature Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left w-full">
              <div className="p-5 rounded-2xl bg-rpg-card border border-rpg-border/80">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-sm font-bold text-gray-100 mb-1">
                  Non-Linear Leveling
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Progression scales exponentially. Each level requires more XP, unlocking greater powers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rpg-card border border-rpg-border/80">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-3">
                  <Skull className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-sm font-bold text-gray-100 mb-1">
                  Dungeon Boss Raids
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Procrastination monsters with real HP bars damaged whenever you complete real quests.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rpg-card border border-rpg-border/80">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-sm font-bold text-gray-100 mb-1">
                  Merchant Economy
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Earn gold to purchase swords, protective shields, restorative draughts, and vanity badges.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-rpg-card border border-rpg-border/80">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3">
                  <Flame className="w-5 h-5" />
                </div>
                <h3 className="font-cinzel text-sm font-bold text-gray-100 mb-1">
                  Consecutive Streaks
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Daily discipline multiplies your gold rewards and shields against burnout.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Keyboard Shortcuts Trigger Button */}
      <button
        onClick={() => setIsHelpModalOpen(true)}
        className="fixed bottom-4 right-4 z-30 p-2.5 rounded-full bg-rpg-card/90 hover:bg-rpg-cardHover border border-rpg-border/80 text-gray-400 hover:text-amber-300 shadow-xl backdrop-blur flex items-center gap-1.5 text-xs font-semibold transition"
        title="Keyboard Navigation Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4" />
        <span className="hidden sm:inline">Shortcuts</span>
      </button>

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-rpg-card border border-rpg-border rounded-2xl max-w-sm w-full p-5 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-cinzel text-base font-bold text-gray-100 flex items-center gap-2 mb-1">
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Keyboard Navigation</span>
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Control the guildhall hands-free via tactile keystrokes.
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Quest Board</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">1</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Armory & Merchant</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">2</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Dungeon Boss Raid</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">3</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Hero Chronicle Codex</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">4</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Toggle Sound Mute</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">M</kbd>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-rpg-bg border border-rpg-border">
                <span className="text-gray-300">Close Active Modal</span>
                <kbd className="px-2 py-0.5 rounded bg-gray-800 text-amber-400 font-mono text-xs font-bold border border-gray-700">Esc</kbd>
              </div>
            </div>

            {/* Audio Test Section */}
            <div className="mt-4 pt-3 border-t border-rpg-border/70">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                🔊 Audio Diagnostics (Click to Test)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    sounds.unlock();
                    sounds.playQuestComplete();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <span>✨ Quest Chime</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.unlock();
                    sounds.playLevelUp();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <span>🎺 Fanfare</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.unlock();
                    sounds.playCoin();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <span>🪙 Gold Coin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.unlock();
                    sounds.playBossHit();
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-bold transition flex items-center justify-center gap-1"
                >
                  <span>⚔️ Boss Slash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Up Fanfare Modal */}
      <LevelUpModal />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
