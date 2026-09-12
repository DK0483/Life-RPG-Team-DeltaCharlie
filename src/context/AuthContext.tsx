"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { sounds } from "@/lib/sound";

export interface CharacterData {
  id: string;
  name: string;
  characterClass: string;
  title: string;
  level: number;
  currentXp: number;
  gold: number;
  currentHp: number;
  maxHp: number;
  currentMana: number;
  maxMana: number;
  strength: number;
  intellect: number;
  vitality: number;
  agility: number;
  charisma: number;
  streakCount: number;
  longestStreak: number;
  activeTheme: string;
  activeBadge: string;
  levelInfo: {
    level: number;
    currentXp: number;
    xpRequired: number;
    percentage: number;
  };
  equippedBonuses?: {
    strength: number;
    intellect: number;
    vitality: number;
    agility: number;
    charisma: number;
  };
  totalStats?: {
    strength: number;
    intellect: number;
    vitality: number;
    agility: number;
    charisma: number;
  };
}

export interface BossBattleData {
  id: string;
  bossId: string;
  currentHp: number;
  maxHp: number;
  isDefeated: boolean;
  damageDealt: number;
  boss: {
    id: string;
    name: string;
    title: string;
    description: string;
    level: number;
    rewardXp: number;
    rewardGold: number;
    avatar: string;
  };
}

interface UserData {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: UserData | null;
  character: CharacterData | null;
  activeBoss: BossBattleData | null;
  isLoading: boolean;
  isSoundMuted: boolean;
  activeLevelUp: { level: number; levelsGained: number } | null;
  toggleSound: () => void;
  closeLevelUpModal: () => void;
  triggerLevelUp: (level: number, levelsGained: number) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    username: string;
    email: string;
    password: string;
    characterClass: string;
    characterName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshCharacter: () => Promise<void>;
  updateCharacterState: (updater: (prev: CharacterData | null) => CharacterData | null) => void;
  updateBossState: (updater: (prev: BossBattleData | null) => BossBattleData | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [activeBoss, setActiveBoss] = useState<BossBattleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [activeLevelUp, setActiveLevelUp] = useState<{ level: number; levelsGained: number } | null>(null);

  useEffect(() => {
    setIsSoundMuted(sounds.getMuteState());
  }, []);

  const toggleSound = () => {
    const newState = sounds.toggleMute();
    setIsSoundMuted(newState);
  };

  const triggerLevelUp = (level: number, levelsGained: number) => {
    sounds.playLevelUp();
    setActiveLevelUp({ level, levelsGained });
  };

  const closeLevelUpModal = () => {
    setActiveLevelUp(null);
  };

  const refreshCharacter = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setCharacter(data.character);
        setActiveBoss(data.activeBoss);
      } else {
        setUser(null);
        setCharacter(null);
        setActiveBoss(null);
      }
    } catch (e) {
      console.error("Failed to load hero session:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCharacter();
  }, [refreshCharacter]);

  const login = async (identifier: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        sounds.playError();
        return { success: false, error: data.error || "Login failed" };
      }
      sounds.playQuestComplete();
      await refreshCharacter();
      return { success: true };
    } catch {
      sounds.playError();
      return { success: false, error: "Network connection failed" };
    }
  };

  const register = async (data: {
    username: string;
    email: string;
    password: string;
    characterClass: string;
    characterName: string;
  }) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) {
        sounds.playError();
        return { success: false, error: resData.error || "Registration failed" };
      }
      sounds.playLevelUp();
      await refreshCharacter();
      return { success: true };
    } catch {
      sounds.playError();
      return { success: false, error: "Network connection failed" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setCharacter(null);
      setActiveBoss(null);
    }
  };

  const updateCharacterState = (updater: (prev: CharacterData | null) => CharacterData | null) => {
    setCharacter(updater);
  };

  const updateBossState = (updater: (prev: BossBattleData | null) => BossBattleData | null) => {
    setActiveBoss(updater);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        character,
        activeBoss,
        isLoading,
        isSoundMuted,
        activeLevelUp,
        toggleSound,
        closeLevelUpModal,
        triggerLevelUp,
        login,
        register,
        logout,
        refreshCharacter,
        updateCharacterState,
        updateBossState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
