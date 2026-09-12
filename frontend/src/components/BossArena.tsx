"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Skull,
  Swords,
  ShieldAlert,
  Flame,
  Trophy,
  Sparkles,
  Coins,
  Heart,
  Award,
} from "lucide-react";

interface BossData {
  id: string;
  name: string;
  title: string;
  description: string;
  level: number;
  rewardXp: number;
  rewardGold: number;
  avatar: string;
  badgeReward: string | null;
}

interface BattleData {
  id: string;
  currentHp: number;
  maxHp: number;
  isDefeated: boolean;
  damageDealt: number;
  boss: BossData;
}

export function BossArena() {
  const { character } = useAuth();
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBossData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/boss");
      if (res.ok) {
        const data = await res.json();
        setBattle(data.battle);
        setDefeatedCount(data.defeatedCount);
      }
    } catch (e) {
      console.error("Failed to load boss data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBossData();
  }, [fetchBossData]);

  if (isLoading) {
    return (
      <div className="bg-rpg-card rounded-2xl border border-rpg-border p-8 h-80 animate-pulse flex items-center justify-center">
        <Skull className="w-12 h-12 text-gray-700 animate-spin" />
      </div>
    );
  }

  if (!battle) {
    return (
      <div className="bg-rpg-card rounded-2xl border border-rpg-border p-8 text-center">
        <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
        <h2 className="font-cinzel text-xl font-bold text-gray-100">All Dungeon Bosses Slain!</h2>
        <p className="text-xs text-gray-400 mt-1">
          You have cleared the current raid tier. Keep conquering daily quests to defend the realm!
        </p>
      </div>
    );
  }

  const hpPercentage = Math.round((battle.currentHp / battle.maxHp) * 100);

  return (
    <div className="space-y-6">
      {/* Boss Raid Header */}
      <div className="bg-gradient-to-r from-red-950/40 via-rpg-card to-rpg-card p-5 sm:p-6 rounded-2xl border border-red-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative z-10">
          {/* Boss Sprite & Identity */}
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-900 to-black border-2 border-red-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-red-950/80">
              <Skull className="w-8 h-8 sm:w-10 sm:h-10 text-red-400 animate-pulse" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
                  Dungeon Raid Tier {battle.boss.level}
                </span>
                <span className="text-[11px] sm:text-xs text-gray-400 font-semibold">
                  Total Damage: {battle.damageDealt}
                </span>
              </div>

              <h2 className="font-cinzel text-xl sm:text-2xl md:text-3xl font-black text-gray-100 mt-1">
                {battle.boss.name}
              </h2>
              <p className="text-xs text-red-300/80 font-medium tracking-wide">
                {battle.boss.title}
              </p>
              <p className="text-xs text-gray-400 max-w-xl mt-1.5 leading-relaxed">
                {battle.boss.description}
              </p>
            </div>
          </div>

          {/* Defeated Boss Counter */}
          <div className="w-full sm:w-auto flex items-center gap-3 p-3 rounded-xl bg-rpg-bg/80 border border-rpg-border/60">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Raid Conquests</span>
              <span className="font-cinzel text-sm sm:text-base font-bold text-gray-100">
                {defeatedCount} Bosses Vanquished
              </span>
            </div>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="mt-6 pt-5 border-t border-red-900/40">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" /> Boss Health
            </span>
            <span className="font-mono text-gray-200">
              {battle.currentHp} / {battle.maxHp} HP ({hpPercentage}%)
            </span>
          </div>

          <div className="w-full h-4 bg-gray-950 rounded-full overflow-hidden border border-red-900/60 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-700 via-red-500 to-orange-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Combat Instructions & Bounty Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: How Battle Works */}
        <div className="bg-rpg-card rounded-2xl border border-rpg-border/80 p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Swords className="w-4 h-4" />
            <h3 className="font-cinzel text-sm font-bold">Combat Mechanics</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Completing tasks on your Quest Board strikes the boss directly!
            Higher difficulty ranks and character attributes deliver crushing blows.
          </p>
        </div>

        {/* Card 2: Strike Scaling */}
        <div className="bg-rpg-card rounded-2xl border border-rpg-border/80 p-4">
          <div className="flex items-center gap-2 mb-2 text-red-400">
            <Flame className="w-4 h-4" />
            <h3 className="font-cinzel text-sm font-bold">Strike Scaling</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Your current primary stats yield up to +{Math.round((character?.strength || 10) * 0.8)} bonus damage per strike. Keep training!
          </p>
        </div>

        {/* Card 3: Victory Spoils */}
        <div className="bg-rpg-card rounded-2xl border border-rpg-border/80 p-4">
          <div className="flex items-center gap-2 mb-2 text-purple-400">
            <Award className="w-4 h-4" />
            <h3 className="font-cinzel text-sm font-bold">Victory Spoils</h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold mt-1">
            <span className="text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> +{battle.boss.rewardXp} XP
            </span>
            <span className="text-amber-300 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> +{battle.boss.rewardGold} Gold
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
