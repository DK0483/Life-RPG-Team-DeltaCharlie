"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { sounds } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  Plus,
  CheckCircle2,
  Circle,
  Dumbbell,
  Brain,
  Heart,
  Zap,
  Sparkles,
  Calendar,
  Flame,
  Trash2,
  Edit2,
  X,
  Clock,
  Search,
  Filter,
} from "lucide-react";

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  category: "Strength" | "Intellect" | "Vitality" | "Agility" | "Charisma";
  difficulty: "Trivial" | "Easy" | "Medium" | "Hard" | "Epic";
  priority: "Low" | "Normal" | "High";
  recurrence: "ONCE" | "DAILY" | "HABIT";
  xpReward: number;
  goldReward: number;
  statReward: number;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
  streak: number;
}

interface FloatingFeedback {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

export function QuestBoard() {
  const { refreshCharacter, triggerLevelUp } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterRecurrence, setFilterRecurrence] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [floatingTexts, setFloatingTexts] = useState<FloatingFeedback[]>([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Strength" | "Intellect" | "Vitality" | "Agility" | "Charisma">("Intellect");
  const [difficulty, setDifficulty] = useState<"Trivial" | "Easy" | "Medium" | "Hard" | "Epic">("Medium");
  const [priority, setPriority] = useState<"Low" | "Normal" | "High">("Normal");
  const [recurrence, setRecurrence] = useState<"ONCE" | "DAILY" | "HABIT">("ONCE");
  const [formError, setFormError] = useState("");

  const fetchQuests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/quests");
      if (res.ok) {
        const data = await res.json();
        setQuests(data.quests);
      }
    } catch (e) {
      console.error("Failed to fetch quests:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setCategory("Intellect");
    setDifficulty("Medium");
    setPriority("Normal");
    setRecurrence("ONCE");
    setFormError("");
    setEditingQuest(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (quest: Quest) => {
    setEditingQuest(quest);
    setTitle(quest.title);
    setDescription(quest.description || "");
    setCategory(quest.category);
    setDifficulty(quest.difficulty);
    setPriority(quest.priority);
    setRecurrence(quest.recurrence);
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleSaveQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Quest title cannot be empty!");
      return;
    }

    try {
      if (editingQuest) {
        // Edit
        const res = await fetch(`/api/quests/${editingQuest.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            difficulty,
            priority,
            recurrence,
          }),
        });
        if (res.ok) {
          sounds.playEquip();
          setIsCreateModalOpen(false);
          await fetchQuests();
        }
      } else {
        // Create
        const res = await fetch("/api/quests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category,
            difficulty,
            priority,
            recurrence,
          }),
        });
        if (res.ok) {
          sounds.playCoin();
          setIsCreateModalOpen(false);
          await fetchQuests();
        }
      }
    } catch {
      setFormError("Failed to save quest");
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    try {
      const res = await fetch(`/api/quests/${questId}`, { method: "DELETE" });
      if (res.ok) {
        sounds.playEquip();
        setQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleComplete = async (quest: Quest, event: React.MouseEvent) => {
    sounds.unlock();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const spawnX = rect.left + rect.width / 2;
    const spawnY = rect.top;

    // Optimistic toggle
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, isCompleted: !q.isCompleted } : q))
    );

    try {
      const res = await fetch(`/api/quests/${quest.id}/complete`, { method: "POST" });
      if (!res.ok) {
        // Revert if failed
        setQuests((prev) =>
          prev.map((q) => (q.id === quest.id ? { ...q, isCompleted: quest.isCompleted } : q))
        );
        sounds.playError();
        return;
      }

      const data = await res.json();

      if (!data.toggledOff) {
        // Completed sound and celebratory feedback
        sounds.playQuestComplete();

        // Confetti explosion
        confetti({
          particleCount: quest.difficulty === "Epic" ? 100 : 45,
          spread: 70,
          origin: {
            x: spawnX / window.innerWidth,
            y: spawnY / window.innerHeight,
          },
          colors: ["#F59E0B", "#8B5CF6", "#10B981", "#3B82F6", "#EC4899"],
        });

        // Add floating combat text
        const newFeedbacks: FloatingFeedback[] = [
          {
            id: Date.now() + 1,
            text: `+${data.rewards.xp} XP`,
            color: "text-purple-400",
            x: spawnX - 30,
            y: spawnY - 10,
          },
          {
            id: Date.now() + 2,
            text: `+${data.rewards.gold} Gold`,
            color: "text-amber-300",
            x: spawnX + 25,
            y: spawnY - 25,
          },
        ];

        if (data.bossCombat) {
          sounds.playBossHit();
          newFeedbacks.push({
            id: Date.now() + 3,
            text: `-${data.bossCombat.damageDealt} DMG to ${data.bossCombat.bossName}!`,
            color: "text-red-400 font-bold",
            x: spawnX,
            y: spawnY - 45,
          });
        }

        setFloatingTexts((prev) => [...prev, ...newFeedbacks]);
        setTimeout(() => {
          setFloatingTexts((prev) => prev.filter((item) => !newFeedbacks.some((n) => n.id === item.id)));
        }, 1300);

        // Check if level up occurred
        if (data.levelUp?.didLevelUp) {
          triggerLevelUp(data.levelUp.newLevel, data.levelUp.levelsGained);
        }
      }

      await refreshCharacter();
      await fetchQuests();
    } catch {
      sounds.playError();
      await fetchQuests();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Strength": return Dumbbell;
      case "Intellect": return Brain;
      case "Vitality": return Heart;
      case "Agility": return Zap;
      case "Charisma": return Sparkles;
      default: return Brain;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Strength": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Intellect": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "Vitality": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Agility": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Charisma": return "text-pink-400 bg-pink-500/10 border-pink-500/20";
      default: return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Trivial": return "text-gray-400 border-gray-600/40";
      case "Easy": return "text-emerald-400 border-emerald-500/40";
      case "Medium": return "text-blue-400 border-blue-500/40";
      case "Hard": return "text-amber-400 border-amber-500/40";
      case "Epic": return "text-purple-400 border-purple-500/40 shadow-sm shadow-purple-500/20";
      default: return "text-gray-400 border-gray-600/40";
    }
  };

  // Filter quests
  const filteredQuests = quests.filter((quest) => {
    if (filterCategory !== "ALL" && quest.category !== filterCategory) return false;
    if (filterRecurrence !== "ALL" && quest.recurrence !== filterRecurrence) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = quest.title.toLowerCase().includes(q);
      const matchDesc = quest.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const activeCount = quests.filter((q) => !q.isCompleted).length;
  const completedCount = quests.filter((q) => q.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Floating Combat Text Container */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {floatingTexts.map((f) => (
          <div
            key={f.id}
            style={{ left: `${f.x}px`, top: `${f.y}px` }}
            className={`absolute font-cinzel text-sm sm:text-base font-extrabold ${f.color} floating-combat-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}
          >
            {f.text}
          </div>
        ))}
      </div>

      {/* Top Banner with Actions and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-rpg-card p-4 sm:p-5 rounded-2xl border border-rpg-border/80 shadow-md">
        <div>
          <h1 className="font-cinzel text-2xl font-black text-gray-100 flex items-center gap-2.5">
            <span>Guild Quest Board</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold font-sans">
              {activeCount} Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Complete real-world tasks to conquer sloth, gain experience, and gather legendary spoils.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Summon New Quest</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-rpg-card/60 p-3 rounded-xl border border-rpg-border/60">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quest log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-rpg-bg/80 border border-rpg-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {["ALL", "Strength", "Intellect", "Vitality", "Agility", "Charisma"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? "bg-amber-500 text-gray-950 font-bold shadow-sm"
                  : "bg-rpg-card hover:bg-rpg-cardHover text-gray-400 border border-rpg-border/50"
              }`}
            >
              {cat === "ALL" ? "All Realms" : cat}
            </button>
          ))}
        </div>

        {/* Recurrence Filter */}
        <div className="flex items-center gap-1 border-t md:border-t-0 md:border-l border-rpg-border/60 pt-2 md:pt-0 md:pl-2">
          {["ALL", "DAILY", "HABIT", "ONCE"].map((rec) => (
            <button
              key={rec}
              onClick={() => setFilterRecurrence(rec)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                filterRecurrence === rec
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {rec === "ALL" ? "Any Type" : rec === "DAILY" ? "Daily" : rec === "HABIT" ? "Habit" : "One-Time"}
            </button>
          ))}
        </div>
      </div>

      {/* Quest Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-rpg-card/60 animate-pulse rounded-xl border border-rpg-border/40" />
          ))}
        </div>
      ) : filteredQuests.length === 0 ? (
        <div className="bg-rpg-card/40 border border-rpg-border/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-cinzel text-lg font-bold text-gray-200">No Quests in this Realm</h3>
          <p className="text-xs text-gray-400 max-w-sm mt-1 mb-4">
            No matching tasks found. Adjust your filters or summon a new adventure to begin earning XP!
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition"
          >
            Create Your First Quest
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuests.map((quest) => {
            const IconComponent = getCategoryIcon(quest.category);
            return (
              <div
                key={quest.id}
                className={`relative group bg-rpg-card rounded-xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                  quest.isCompleted
                    ? "opacity-60 bg-rpg-card/40 border-rpg-border/30 hover:opacity-85"
                    : "border-rpg-border/80 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5"
                }`}
              >
                <div>
                  {/* Top tags row */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryColor(
                          quest.category
                        )}`}
                      >
                        <IconComponent className="w-3 h-3" />
                        {quest.category}
                      </span>

                      {/* Difficulty Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-rpg-bg ${getDifficultyColor(
                          quest.difficulty
                        )}`}
                      >
                        {quest.difficulty}
                      </span>

                      {/* Recurrence Badge */}
                      {quest.recurrence !== "ONCE" && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {quest.recurrence}
                        </span>
                      )}

                      {quest.streak > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5" />
                          {quest.streak}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(quest)}
                        className="p-1 rounded-md text-gray-400 hover:text-amber-300 hover:bg-rpg-cardHover transition"
                        title="Edit Quest"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuest(quest.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-400 hover:bg-rpg-cardHover transition"
                        title="Banish Quest"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description with complete trigger */}
                  <div className="flex items-start gap-3 mt-1">
                    <button
                      onClick={(e) => handleToggleComplete(quest, e)}
                      aria-label={quest.isCompleted ? "Unmark quest" : "Complete quest"}
                      className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-amber-400 transition-colors"
                    >
                      {quest.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 hover:text-amber-400 hover:scale-110 transition-transform" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h4
                        className={`text-sm font-bold leading-snug break-words ${
                          quest.isCompleted ? "line-through text-gray-400 font-medium" : "text-gray-100"
                        }`}
                      >
                        {quest.title}
                      </h4>
                      {quest.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {quest.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Rewards row */}
                <div className="mt-3 pt-2.5 border-t border-rpg-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-purple-400 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> +{quest.xpReward} XP
                    </span>
                    <span className="text-amber-300 font-bold flex items-center gap-0.5">
                      +{quest.goldReward} Gold
                    </span>
                    <span className="text-emerald-400 font-bold hidden sm:inline">
                      +{quest.statReward} {quest.category}
                    </span>
                  </div>

                  {quest.dueDate && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(quest.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summon / Edit Quest Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-rpg-card border border-rpg-border/90 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-rpg-cardHover"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-cinzel text-xl font-bold text-gray-100 mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>{editingQuest ? "Reforge Quest" : "Summon New Quest"}</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Shape your real-world endeavor into an epic guild contract.
            </p>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveQuest} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Quest Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Next.js App Router Architecture"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Scroll Lore / Notes (Optional)
                </label>
                <textarea
                  placeholder="Details, subtasks, or objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl px-3.5 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Attribute Category */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                  Governing Attribute
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: "Strength", icon: Dumbbell, desc: "Fitness / Physical" },
                    { key: "Intellect", icon: Brain, desc: "Study / Coding" },
                    { key: "Vitality", icon: Heart, desc: "Sleep / Health" },
                    { key: "Agility", icon: Zap, desc: "Errands / Chores" },
                    { key: "Charisma", icon: Sparkles, desc: "Social / Mind" },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.key;
                    return (
                      <button
                        type="button"
                        key={cat.key}
                        onClick={() => setCategory(cat.key as typeof category)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm"
                            : "bg-rpg-bg border-rpg-border text-gray-400 hover:border-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{cat.key}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block mt-0.5">{cat.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Recurrence in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Difficulty Rank
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                    className="w-full bg-rpg-bg border border-rpg-border rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Trivial">Trivial (+15 XP, 5 Gold)</option>
                    <option value="Easy">Easy (+30 XP, 10 Gold)</option>
                    <option value="Medium">Medium (+60 XP, 25 Gold)</option>
                    <option value="Hard">Hard (+120 XP, 50 Gold)</option>
                    <option value="Epic">Epic (+250 XP, 120 Gold)</option>
                  </select>
                </div>

                {/* Recurrence */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1">
                    Recurrence
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
                    className="w-full bg-rpg-bg border border-rpg-border rounded-xl px-3 py-2 text-xs font-bold text-gray-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="ONCE">One-Time Contract</option>
                    <option value="DAILY">Daily Quest (Resets daily)</option>
                    <option value="HABIT">Habitual Routine</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-rpg-bg hover:bg-rpg-cardHover border border-rpg-border text-gray-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 text-xs font-black shadow-lg shadow-amber-500/20 transition active:scale-95"
                >
                  {editingQuest ? "Update Quest" : "Confirm Contract"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
