"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "@/lib/sound";
import { ClassAvatar } from "./ClassAvatar";
import { AttributeRadar } from "./AttributeRadar";
import {
  Shield,
  Dumbbell,
  Brain,
  Heart,
  Zap,
  Sparkles,
  Sword,
  ShieldCheck,
  CircleDot,
  Award,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface InventoryItem {
  id: string;
  isEquipped: boolean;
  quantity: number;
  item: {
    id: string;
    name: string;
    description: string;
    category: string;
    rarity: string;
    statBonusType: string | null;
    statBonusValue: number;
    icon: string;
    isEquippable: boolean;
  };
}

export function CharacterSheet() {
  const { character, refreshCharacter } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statViewMode, setStatViewMode] = useState<"list" | "radar">("list");

  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory);
      }
    } catch (e) {
      console.error("Failed to load inventory for sheet:", e);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  if (!character) return null;

  const equippedWeapon = inventory.find((i) => i.isEquipped && i.item.category === "WEAPON");
  const equippedArmor = inventory.find((i) => i.isEquipped && i.item.category === "ARMOR");
  const equippedAccessory = inventory.find((i) => i.isEquipped && i.item.category === "ACCESSORY");

  const unequip = async (inventoryId: string) => {
    try {
      const res = await fetch("/api/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId }),
      });
      if (res.ok) {
        sounds.playEquip();
        await refreshCharacter();
        await fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stats = [
    {
      key: "strength",
      label: "Strength",
      value: character.strength,
      bonus: character.equippedBonuses?.strength || 0,
      total: (character.totalStats?.strength ?? character.strength),
      icon: Dumbbell,
      color: "text-red-400",
      bgColor: "bg-red-500/10 border-red-500/30",
      description: "Boosts physical fortitude & gym habits",
    },
    {
      key: "intellect",
      label: "Intellect",
      value: character.intellect,
      bonus: character.equippedBonuses?.intellect || 0,
      total: (character.totalStats?.intellect ?? character.intellect),
      icon: Brain,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      description: "Channels focus, coding & study tasks",
    },
    {
      key: "vitality",
      label: "Vitality",
      value: character.vitality,
      bonus: character.equippedBonuses?.vitality || 0,
      total: (character.totalStats?.vitality ?? character.vitality),
      icon: Heart,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      description: "Governs sleep, hydration & recovery",
    },
    {
      key: "agility",
      label: "Agility",
      value: character.agility,
      bonus: character.equippedBonuses?.agility || 0,
      total: (character.totalStats?.agility ?? character.agility),
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      description: "Powers quick chores & nimble execution",
    },
    {
      key: "charisma",
      label: "Charisma",
      value: character.charisma,
      bonus: character.equippedBonuses?.charisma || 0,
      total: (character.totalStats?.charisma ?? character.charisma),
      icon: Sparkles,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10 border-pink-500/30",
      description: "Drives social, speaking & mind balance",
    },
  ];

  return (
    <div className="bg-rpg-card rounded-2xl border border-rpg-border/80 shadow-xl overflow-hidden backdrop-blur-sm transition-all duration-300">
      {/* Header Banner */}
      <div className="relative p-5 pb-4 bg-gradient-to-b from-rpg-border/30 to-transparent border-b border-rpg-border/40">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Custom Glowing Class Avatar */}
            <div className="relative">
              <ClassAvatar characterClass={character.characterClass} size="md" />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 font-black text-[11px] px-1.5 py-0.5 rounded-md shadow-md border border-amber-300">
                Lvl {character.level}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cinzel text-xl font-bold text-gray-100">{character.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  {character.characterClass}
                </span>
              </div>
              <p className="text-xs text-amber-400/80 font-medium tracking-wide mt-0.5">
                {character.activeBadge || character.title}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1.5 rounded-lg bg-rpg-cardHover text-gray-400 hover:text-white"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {/* Vitals Progress Bars */}
        <div className="mt-5 space-y-2.5">
          {/* Health Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-red-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-red-400/20" /> Health (HP)
              </span>
              <span className="text-gray-300">
                {character.currentHp} / {character.maxHp}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-900/80 rounded-full overflow-hidden border border-red-900/40">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, (character.currentHp / character.maxHp) * 100))}%` }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-blue-400/20" /> Mana (MP)
              </span>
              <span className="text-gray-300">
                {character.currentMana} / {character.maxMana}
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-900/80 rounded-full overflow-hidden border border-blue-900/40">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${Math.min(100, Math.max(0, (character.currentMana / character.maxMana) * 100))}%` }}
              />
            </div>
          </div>

          {/* Experience Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-purple-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Progression (XP)
              </span>
              <span className="text-purple-300 font-bold">
                {character.levelInfo?.currentXp || 0} / {character.levelInfo?.xpRequired || 100} ({character.levelInfo?.percentage || 0}%)
              </span>
            </div>
            <div className="w-full h-3 bg-gray-900/80 rounded-full overflow-hidden border border-purple-900/40 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                style={{ width: `${character.levelInfo?.percentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attributes & Gear */}
      <div className={`p-5 space-y-5 ${isExpanded ? "block" : "hidden sm:block"}`}>
        {/* Core Attributes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Hero Attributes
            </h3>
            <div className="flex items-center bg-rpg-bg p-0.5 rounded-lg border border-rpg-border text-[10px]">
              <button
                type="button"
                onClick={() => setStatViewMode("list")}
                className={`px-2 py-0.5 rounded-md font-semibold transition ${
                  statViewMode === "list" ? "bg-amber-500 text-gray-950 font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setStatViewMode("radar")}
                className={`px-2 py-0.5 rounded-md font-semibold transition ${
                  statViewMode === "radar" ? "bg-amber-500 text-gray-950 font-bold" : "text-gray-400 hover:text-white"
                }`}
              >
                Radar Web
              </button>
            </div>
          </div>

          {statViewMode === "radar" ? (
            <div className="bg-rpg-bg/60 rounded-xl border border-rpg-border/60 py-2 animate-in fade-in duration-300">
              <AttributeRadar stats={character.totalStats || character} />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 animate-in fade-in duration-300">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.key}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${stat.bgColor} transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg bg-gray-900/60 ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-200 block">{stat.label}</span>
                      <span className="text-[10px] text-gray-400 hidden xl:inline">{stat.description}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-gray-100">{stat.total}</span>
                    {stat.bonus > 0 && (
                      <span className="text-[10px] font-bold text-amber-400 ml-1">
                        (+{stat.bonus})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Equipped Paperdoll Gear */}
        <div className="pt-2 border-t border-rpg-border/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Equipped Artifacts
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {/* Weapon Slot */}
            <div className="p-2.5 rounded-xl bg-rpg-bg border border-rpg-border/80 flex flex-col items-center justify-center text-center relative group min-h-[76px]">
              <Sword className="w-4 h-4 text-amber-400/60 mb-1" />
              {equippedWeapon ? (
                <>
                  <span className="text-[11px] font-bold text-amber-300 leading-tight line-clamp-1">
                    {equippedWeapon.item.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">
                    +{equippedWeapon.item.statBonusValue} {equippedWeapon.item.statBonusType}
                  </span>
                  <button
                    onClick={() => unequip(equippedWeapon.id)}
                    className="absolute inset-0 bg-red-950/90 text-red-300 text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    Unequip
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-gray-500 font-medium">Empty Weapon</span>
              )}
            </div>

            {/* Armor Slot */}
            <div className="p-2.5 rounded-xl bg-rpg-bg border border-rpg-border/80 flex flex-col items-center justify-center text-center relative group min-h-[76px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400/60 mb-1" />
              {equippedArmor ? (
                <>
                  <span className="text-[11px] font-bold text-emerald-300 leading-tight line-clamp-1">
                    {equippedArmor.item.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">
                    +{equippedArmor.item.statBonusValue} {equippedArmor.item.statBonusType}
                  </span>
                  <button
                    onClick={() => unequip(equippedArmor.id)}
                    className="absolute inset-0 bg-red-950/90 text-red-300 text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    Unequip
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-gray-500 font-medium">Empty Armor</span>
              )}
            </div>

            {/* Accessory Slot */}
            <div className="p-2.5 rounded-xl bg-rpg-bg border border-rpg-border/80 flex flex-col items-center justify-center text-center relative group min-h-[76px]">
              <CircleDot className="w-4 h-4 text-purple-400/60 mb-1" />
              {equippedAccessory ? (
                <>
                  <span className="text-[11px] font-bold text-purple-300 leading-tight line-clamp-1">
                    {equippedAccessory.item.name}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-medium">
                    +{equippedAccessory.item.statBonusValue} {equippedAccessory.item.statBonusType}
                  </span>
                  <button
                    onClick={() => unequip(equippedAccessory.id)}
                    className="absolute inset-0 bg-red-950/90 text-red-300 text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    Unequip
                  </button>
                </>
              ) : (
                <span className="text-[10px] text-gray-500 font-medium">Empty Trinket</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
