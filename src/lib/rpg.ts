export interface LevelInfo {
  level: number;
  currentXp: number;
  xpRequired: number;
  percentage: number;
}

/**
 * Calculates XP required to advance from the current level to the next.
 * Non-linear curve: XP = floor(100 * (level ^ 1.55))
 */
export function getXpRequiredForLevel(level: number): number {
  return Math.floor(100 * Math.pow(Math.max(1, level), 1.55));
}

/**
 * Calculates level and progress given a total or current level + XP.
 */
export function calculateLevelInfo(level: number, currentXp: number): LevelInfo {
  const xpRequired = getXpRequiredForLevel(level);
  const percentage = Math.min(100, Math.max(0, Math.round((currentXp / xpRequired) * 100)));
  return {
    level,
    currentXp,
    xpRequired,
    percentage,
  };
}

/**
 * Applies gained XP to character, processing single or multiple level-ups.
 */
export function processXpGain(currentLevel: number, currentXp: number, xpGained: number) {
  let level = currentLevel;
  let xp = currentXp + xpGained;
  let didLevelUp = false;
  let levelsGained = 0;

  while (true) {
    const needed = getXpRequiredForLevel(level);
    if (xp >= needed) {
      xp -= needed;
      level += 1;
      didLevelUp = true;
      levelsGained += 1;
    } else {
      break;
    }
  }

  return {
    newLevel: level,
    newXp: xp,
    didLevelUp,
    levelsGained,
  };
}

/**
 * Difficulty settings
 */
export const DIFFICULTY_CONFIG: Record<
  string,
  { xp: number; gold: number; statBonus: number; label: string; color: string }
> = {
  Trivial: { xp: 15, gold: 5, statBonus: 1, label: "Trivial", color: "text-gray-400 border-gray-600" },
  Easy: { xp: 30, gold: 10, statBonus: 1, label: "Easy", color: "text-emerald-400 border-emerald-600" },
  Medium: { xp: 60, gold: 25, statBonus: 2, label: "Medium", color: "text-blue-400 border-blue-600" },
  Hard: { xp: 120, gold: 50, statBonus: 3, label: "Hard", color: "text-amber-400 border-amber-600" },
  Epic: { xp: 250, gold: 120, statBonus: 5, label: "Epic", color: "text-purple-400 border-purple-600" },
};

export const CATEGORY_CONFIG: Record<
  string,
  { name: string; statKey: "strength" | "intellect" | "vitality" | "agility" | "charisma"; color: string; icon: string }
> = {
  Strength: { name: "Strength", statKey: "strength", color: "#F87171", icon: "Dumbbell" },
  Intellect: { name: "Intellect", statKey: "intellect", color: "#60A5FA", icon: "Brain" },
  Vitality: { name: "Vitality", statKey: "vitality", color: "#34D399", icon: "Heart" },
  Agility: { name: "Agility", statKey: "agility", color: "#FBBF24", icon: "Zap" },
  Charisma: { name: "Charisma", statKey: "charisma", color: "#F472B6", icon: "Sparkles" },
};

/**
 * Updates streak based on last active date
 */
export function calculateNewStreak(
  lastActiveDate: Date | null,
  currentStreak: number,
  longestStreak: number
): { newStreak: number; newLongest: number; streakExtended: boolean } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastActiveDate) {
    return {
      newStreak: 1,
      newLongest: Math.max(1, longestStreak),
      streakExtended: true,
    };
  }

  const last = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
  const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, maintain streak
    return {
      newStreak: currentStreak,
      newLongest: longestStreak,
      streakExtended: false,
    };
  } else if (diffDays === 1) {
    // Active yesterday: streak incremented!
    const updated = currentStreak + 1;
    return {
      newStreak: updated,
      newLongest: Math.max(updated, longestStreak),
      streakExtended: true,
    };
  } else {
    // Missed at least one whole day: reset streak to 1
    return {
      newStreak: 1,
      newLongest: longestStreak,
      streakExtended: true,
    };
  }
}

/**
 * Calculates boss damage dealt by completing a quest
 */
export function calculateBossDamage(
  difficulty: string,
  statValue: number
): number {
  const diffMultiplier =
    difficulty === "Epic" ? 60 :
    difficulty === "Hard" ? 35 :
    difficulty === "Medium" ? 20 :
    difficulty === "Easy" ? 12 : 6;

  // Base damage from difficulty + bonus scaling from related stat
  const damage = diffMultiplier + Math.floor(statValue * 0.8);
  return Math.max(10, damage);
}
