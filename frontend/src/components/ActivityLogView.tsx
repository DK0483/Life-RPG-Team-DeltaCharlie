"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Scroll,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Shield,
  Heart,
  Skull,
  Flame,
  Filter,
} from "lucide-react";

interface LogEntry {
  id: string;
  action: string;
  title: string;
  details: string | null;
  xpGained: number;
  goldGained: number;
  createdAt: string;
}

export function ActivityLogView() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterAction, setFilterAction] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to load activity logs:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "QUEST_COMPLETED": return CheckCircle2;
      case "LEVEL_UP": return Sparkles;
      case "ITEM_BOUGHT": return ShoppingBag;
      case "ITEM_EQUIPPED": return Shield;
      case "ITEM_USED": return Heart;
      case "BOSS_DEFEATED": return Skull;
      case "STREAK_EXTENDED": return Flame;
      default: return Scroll;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "QUEST_COMPLETED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "LEVEL_UP": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "ITEM_BOUGHT": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "ITEM_EQUIPPED": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "ITEM_USED": return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      case "BOSS_DEFEATED": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "STREAK_EXTENDED": return "text-orange-400 bg-orange-500/10 border-orange-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "ALL") return true;
    return log.action === filterAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-rpg-card p-5 rounded-2xl border border-rpg-border/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-gray-100 flex items-center gap-2.5">
            <Scroll className="w-6 h-6 text-amber-400" />
            <span>Hero Chronicle & Codex</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            An indelible permanent ledger of all your completed endeavors, level-ups, and legendary acquisitions.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { key: "ALL", label: "All Deeds" },
            { key: "QUEST_COMPLETED", label: "Quests" },
            { key: "LEVEL_UP", label: "Level Ups" },
            { key: "ITEM_BOUGHT", label: "Arsenal" },
            { key: "BOSS_DEFEATED", label: "Raid Victories" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterAction(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filterAction === f.key
                  ? "bg-amber-500 text-gray-950 font-bold"
                  : "bg-rpg-bg text-gray-400 hover:text-white border border-rpg-border/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-rpg-card/60 animate-pulse rounded-xl border border-rpg-border/40" />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-rpg-card/40 border border-rpg-border/60 rounded-2xl p-10 text-center flex flex-col items-center">
          <Scroll className="w-10 h-10 text-gray-600 mb-2" />
          <h3 className="font-cinzel text-lg font-bold text-gray-300">No Chronicle Entries Yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1">
            Undertake quests or acquire artifacts to record your heroic deeds.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const Icon = getActionIcon(log.action);
            const colorClass = getActionColor(log.action);

            return (
              <div
                key={log.id}
                className="bg-rpg-card rounded-xl border border-rpg-border/70 p-3.5 flex items-center justify-between gap-4 hover:border-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg border flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-200 truncate">
                      {log.title}
                    </h4>
                    {log.details && (
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right flex-shrink-0">
                  {log.xpGained > 0 && (
                    <span className="text-xs font-mono font-bold text-purple-400">
                      +{log.xpGained} XP
                    </span>
                  )}
                  {log.goldGained !== 0 && (
                    <span
                      className={`text-xs font-mono font-bold ${
                        log.goldGained > 0 ? "text-amber-300" : "text-gray-400"
                      }`}
                    >
                      {log.goldGained > 0 ? `+${log.goldGained}` : log.goldGained} Gold
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 hidden sm:inline font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
