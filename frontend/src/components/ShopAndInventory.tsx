"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  Backpack,
  Coins,
  Sparkles,
  Sword,
  Swords,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CircleDot,
  Flame,
  Crown,
  Heart,
  Zap,
  Scroll,
  Hammer,
  Wand2,
  Award,
  Compass,
  Skull,
  Check,
} from "lucide-react";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: "WEAPON" | "ARMOR" | "ACCESSORY" | "POTION" | "THEME" | "BADGE";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  cost: number;
  statBonusType: string | null;
  statBonusValue: number;
  icon: string;
  isConsumable: boolean;
  isEquippable: boolean;
  owned: boolean;
  quantity: number;
  isEquipped: boolean;
}

interface InventoryItem {
  id: string;
  isEquipped: boolean;
  quantity: number;
  acquiredAt: string;
  item: ShopItem;
}

export function ShopAndInventory() {
  const { character, refreshCharacter, triggerLevelUp } = useAuth();
  const [subTab, setSubTab] = useState<"shop" | "inventory">("shop");
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchShopAndInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const [shopRes, invRes] = await Promise.all([
        fetch("/api/shop"),
        fetch("/api/inventory"),
      ]);

      if (shopRes.ok) {
        const sData = await shopRes.json();
        setShopItems(sData.items);
      }

      if (invRes.ok) {
        const iData = await invRes.json();
        setInventory(iData.inventory);
      }
    } catch (e) {
      console.error("Failed to load shop items:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShopAndInventory();
  }, [fetchShopAndInventory]);

  const showNotification = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const handleBuyItem = async (item: ShopItem) => {
    sounds.unlock();
    if (!character || character.gold < item.cost) {
      sounds.playError();
      showNotification(`Insufficient gold! You require ${item.cost} Gold.`, "error");
      return;
    }

    try {
      const res = await fetch("/api/shop/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        sounds.playError();
        showNotification(data.error || "Purchase failed", "error");
        return;
      }

      sounds.playCoin();
      showNotification(`Acquired ${item.name}! Added to your inventory.`, "success");
      await refreshCharacter();
      await fetchShopAndInventory();
    } catch {
      sounds.playError();
      showNotification("Network error during purchase", "error");
    }
  };

  const handleEquip = async (inventoryId: string) => {
    sounds.unlock();
    try {
      const res = await fetch("/api/inventory/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId }),
      });

      const data = await res.json();
      if (!res.ok) {
        sounds.playError();
        showNotification(data.error || "Failed to equip item", "error");
        return;
      }

      sounds.playEquip();
      showNotification(
        data.isEquipped ? "Item equipped! Stats fortified." : "Item unequipped.",
        "success"
      );
      await refreshCharacter();
      await fetchShopAndInventory();
    } catch {
      sounds.playError();
    }
  };

  const handleConsume = async (inventoryId: string) => {
    sounds.unlock();
    try {
      const res = await fetch("/api/inventory/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventoryId }),
      });

      const data = await res.json();
      if (!res.ok) {
        sounds.playError();
        showNotification(data.error || "Failed to consume item", "error");
        return;
      }

      sounds.playPotion();
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
      });

      showNotification(data.effectDescription, "success");

      if (data.character && character && data.character.level > character.level) {
        triggerLevelUp(data.character.level, data.character.level - character.level);
      }

      await refreshCharacter();
      await fetchShopAndInventory();
    } catch {
      sounds.playError();
    }
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case "Sword": return Sword;
      case "Swords": return Swords;
      case "Wand2": return Wand2;
      case "Hammer": return Hammer;
      case "Shield": return Shield;
      case "ShieldAlert": return ShieldAlert;
      case "ShieldCheck": return ShieldCheck;
      case "CircleDot": return CircleDot;
      case "Flame": return Flame;
      case "Crown": return Crown;
      case "Heart": return Heart;
      case "Zap": return Zap;
      case "Scroll": return Scroll;
      case "Sparkles": return Sparkles;
      case "Compass": return Compass;
      case "Skull": return Skull;
      case "Award": return Award;
      default: return Sparkles;
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "Common": return "text-gray-300 border-gray-600 bg-gray-900/60";
      case "Uncommon": return "text-emerald-400 border-emerald-500/40 bg-emerald-950/40";
      case "Rare": return "text-blue-400 border-blue-500/40 bg-blue-950/40";
      case "Epic": return "text-purple-400 border-purple-500/40 bg-purple-950/40";
      case "Legendary": return "text-amber-400 border-amber-500/60 bg-amber-950/40 shadow-sm shadow-amber-500/20";
      default: return "text-gray-400 border-gray-600";
    }
  };

  const filteredShopItems = shopItems.filter((item) => {
    if (categoryFilter === "ALL") return true;
    return item.category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {message && (
        <div
          className={`p-3 rounded-xl border text-xs font-bold transition-all animate-in fade-in flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/15 border-red-500/30 text-red-300"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-white">
            ×
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-rpg-card p-5 rounded-2xl border border-rpg-border/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-gray-100 flex items-center gap-2.5">
            <span>Guild Arsenal & Bazaar</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Exchange your hard-earned quest gold for weapons, enchanted cuirasses, restorative draughts, and vanity badges.
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 w-full sm:w-auto items-center gap-1.5 p-1 bg-rpg-bg rounded-xl border border-rpg-border">
          <button
            onClick={() => setSubTab("shop")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === "shop"
                ? "bg-amber-500 text-gray-950 shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Merchant Catalog</span>
          </button>
          <button
            onClick={() => setSubTab("inventory")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition ${
              subTab === "inventory"
                ? "bg-amber-500 text-gray-950 shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Backpack className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Backpack ({inventory.length})</span>
          </button>
        </div>
      </div>

      {subTab === "shop" ? (
        <>
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["ALL", "WEAPON", "ARMOR", "ACCESSORY", "POTION", "THEME", "BADGE"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  categoryFilter === cat
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-rpg-card hover:bg-rpg-cardHover text-gray-400 border border-rpg-border/50"
                }`}
              >
                {cat === "ALL" ? "All Relics" : cat}
              </button>
            ))}
          </div>

          {/* Shop Item Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-44 bg-rpg-card/60 animate-pulse rounded-2xl border border-rpg-border/40" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredShopItems.map((item) => {
                const Icon = getItemIcon(item.icon);
                const canAfford = character ? character.gold >= item.cost : false;

                return (
                  <div
                    key={item.id}
                    className="bg-rpg-card rounded-2xl border border-rpg-border/80 p-4 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-200"
                  >
                    <div>
                      {/* Top rarity & category */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRarityBadge(item.rarity)}`}>
                          {item.rarity}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-rpg-bg border border-rpg-border flex items-center justify-center text-amber-400 flex-shrink-0 shadow-inner">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-100">{item.name}</h4>
                          {item.statBonusType && (
                            <span className="text-xs font-bold text-emerald-400">
                              +{item.statBonusValue} {item.statBonusType}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-2.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Bottom Buy Action */}
                    <div className="mt-4 pt-3 border-t border-rpg-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span>{item.cost}</span>
                        <span className="text-[10px] text-amber-400/70 font-semibold uppercase">Gold</span>
                      </div>

                      {item.owned && !item.isConsumable ? (
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Possessed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBuyItem(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            canAfford
                              ? "bg-amber-500 hover:bg-amber-400 text-gray-950 shadow-md active:scale-95"
                              : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/50"
                          }`}
                        >
                          <Coins className="w-3 h-3" />
                          <span>Buy Item</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* User Backpack / Inventory Tab */
        <div className="space-y-4">
          {inventory.length === 0 ? (
            <div className="bg-rpg-card/40 border border-rpg-border/60 rounded-2xl p-10 text-center flex flex-col items-center">
              <Backpack className="w-12 h-12 text-gray-600 mb-2" />
              <h3 className="font-cinzel text-lg font-bold text-gray-300">Your Satchel is Empty</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
                Complete quests to amass gold, then visit the Merchant Catalog to purchase gear and supplies.
              </p>
              <button
                onClick={() => setSubTab("shop")}
                className="px-4 py-2 rounded-xl bg-amber-500 text-gray-950 font-bold text-xs"
              >
                Browse Merchant Wares
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((inv) => {
                const Icon = getItemIcon(inv.item.icon);
                return (
                  <div
                    key={inv.id}
                    className={`bg-rpg-card rounded-2xl border p-4 flex flex-col justify-between transition-all ${
                      inv.isEquipped
                        ? "border-amber-500/60 bg-amber-950/10 shadow-lg shadow-amber-500/5"
                        : "border-rpg-border/80"
                    }`}
                  >
                    <div>
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRarityBadge(inv.item.rarity)}`}>
                          {inv.item.rarity}
                        </span>
                        {inv.quantity > 1 && (
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                            x{inv.quantity}
                          </span>
                        )}
                        {inv.isEquipped && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Equipped
                          </span>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-rpg-bg border border-rpg-border flex items-center justify-center text-amber-400 flex-shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-100">{inv.item.name}</h4>
                          {inv.item.statBonusType && (
                            <span className="text-xs font-bold text-emerald-400">
                              +{inv.item.statBonusValue} {inv.item.statBonusType}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-gray-400 mt-2.5 leading-relaxed">
                        {inv.item.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-rpg-border/50 flex items-center justify-end gap-2">
                      {inv.item.isEquippable && (
                        <button
                          onClick={() => handleEquip(inv.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            inv.isEquipped
                              ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                              : "bg-amber-500 text-gray-950 font-bold hover:bg-amber-400"
                          }`}
                        >
                          {inv.isEquipped ? "Unequip" : "Equip Gear"}
                        </button>
                      )}

                      {inv.item.isConsumable && (
                        <button
                          onClick={() => handleConsume(inv.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs shadow-md transition active:scale-95"
                        >
                          Drink / Consume
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
