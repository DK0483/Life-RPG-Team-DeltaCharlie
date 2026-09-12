import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { DIFFICULTY_CONFIG, processXpGain, calculateNewStreak, calculateBossDamage } from "../lib/rpg";

const router = Router();
router.use(requireAuth);

// GET /api/quests
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { category, recurrence } = req.query;

    const whereClause: { userId: string; category?: string; recurrence?: string } = { userId };
    if (category && category !== "ALL") whereClause.category = String(category);
    if (recurrence && recurrence !== "ALL") whereClause.recurrence = String(recurrence);

    const quests = await prisma.quest.findMany({
      where: whereClause,
      orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
    });

    return res.json({ quests });
  } catch (error: unknown) {
    console.error("Error listing quests:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/quests
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { title, description, category = "Intellect", difficulty = "Medium", priority = "Normal", recurrence = "ONCE", dueDate } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Quest title is required." });
    }

    const diffSetting = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;

    const newQuest = await prisma.quest.create({
      data: {
        userId,
        title: title.trim(),
        description: description ? description.trim() : null,
        category,
        difficulty,
        priority,
        recurrence,
        xpReward: diffSetting.xp,
        goldReward: diffSetting.gold,
        statReward: diffSetting.statBonus,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return res.status(201).json({ quest: newQuest });
  } catch (error: unknown) {
    console.error("Error creating quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/quests/:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const questId = req.params.id;

    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Quest not found" });
    }

    const { title, description, category, difficulty, priority, recurrence, dueDate } = req.body;
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (recurrence !== undefined) updateData.recurrence = recurrence;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

    if (difficulty !== undefined) {
      updateData.difficulty = difficulty;
      const diffSetting = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;
      updateData.xpReward = diffSetting.xp;
      updateData.goldReward = diffSetting.gold;
      updateData.statReward = diffSetting.statBonus;
    }

    const updated = await prisma.quest.update({
      where: { id: questId },
      data: updateData,
    });

    return res.json({ quest: updated });
  } catch (error: unknown) {
    console.error("Error updating quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/quests/:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const questId = req.params.id;

    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Quest not found" });
    }

    await prisma.quest.delete({ where: { id: questId } });
    return res.json({ message: "Quest banished from log" });
  } catch (error: unknown) {
    console.error("Error deleting quest:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/quests/:id/complete
router.post("/:id/complete", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const questId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.findFirst({
        where: { id: questId, userId },
      });

      if (!quest) throw new Error("Quest not found");

      const character = await tx.character.findUnique({
        where: { userId },
      });

      if (!character) throw new Error("Character not found");

      // Toggle back if already completed
      if (quest.isCompleted) {
        const revertedQuest = await tx.quest.update({
          where: { id: questId },
          data: { isCompleted: false, completedAt: null },
        });

        const newGold = Math.max(0, character.gold - quest.goldReward);
        const newXp = Math.max(0, character.currentXp - quest.xpReward);

        const updatedChar = await tx.character.update({
          where: { userId },
          data: { gold: newGold, currentXp: newXp },
        });

        return {
          quest: revertedQuest,
          character: updatedChar,
          toggledOff: true,
          rewards: { xp: -quest.xpReward, gold: -quest.goldReward },
        };
      }

      // Complete Quest
      const streakResult = calculateNewStreak(
        character.lastActiveDate,
        character.streakCount,
        character.longestStreak
      );

      const streakBonusMultiplier = 1 + Math.min(0.5, (streakResult.newStreak - 1) * 0.05);
      const finalGoldEarned = Math.round(quest.goldReward * streakBonusMultiplier);

      const xpProgression = processXpGain(
        character.level,
        character.currentXp,
        quest.xpReward
      );

      const statToIncrement = (
        quest.category.toLowerCase() === "strength" ? "strength" :
        quest.category.toLowerCase() === "intellect" ? "intellect" :
        quest.category.toLowerCase() === "vitality" ? "vitality" :
        quest.category.toLowerCase() === "agility" ? "agility" : "charisma"
      ) as "strength" | "intellect" | "vitality" | "agility" | "charisma";

      const currentStatVal = character[statToIncrement] || 10;
      const newStatVal = currentStatVal + quest.statReward;

      const charUpdateData: Record<string, unknown> = {
        level: xpProgression.newLevel,
        currentXp: xpProgression.newXp,
        gold: character.gold + finalGoldEarned,
        streakCount: streakResult.newStreak,
        longestStreak: streakResult.newLongest,
        lastActiveDate: new Date(),
        [statToIncrement]: newStatVal,
      };

      if (xpProgression.didLevelUp) {
        charUpdateData.maxHp = character.maxHp + xpProgression.levelsGained * 15;
        charUpdateData.currentHp = character.maxHp + xpProgression.levelsGained * 15;
        charUpdateData.maxMana = character.maxMana + xpProgression.levelsGained * 10;
        charUpdateData.currentMana = character.maxMana + xpProgression.levelsGained * 10;
      }

      const updatedCharacter = await tx.character.update({
        where: { userId },
        data: charUpdateData,
      });

      const updatedQuest = await tx.quest.update({
        where: { id: questId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          streak: quest.streak + 1,
        },
      });

      let bossCombat = null;
      const activeBattle = await tx.userBossBattle.findFirst({
        where: { userId, isDefeated: false },
        include: { boss: true },
      });

      if (activeBattle) {
        const damageDealt = calculateBossDamage(quest.difficulty, currentStatVal);
        const newBossHp = Math.max(0, activeBattle.currentHp - damageDealt);
        const bossDefeated = newBossHp <= 0;

        await tx.userBossBattle.update({
          where: { id: activeBattle.id },
          data: {
            currentHp: newBossHp,
            isDefeated: bossDefeated,
            damageDealt: activeBattle.damageDealt + damageDealt,
          },
        });

        bossCombat = {
          bossName: activeBattle.boss.name,
          damageDealt,
          currentHp: newBossHp,
          maxHp: activeBattle.maxHp,
          bossDefeated,
        };

        if (bossDefeated) {
          const bossXpGain = processXpGain(
            updatedCharacter.level,
            updatedCharacter.currentXp,
            activeBattle.boss.rewardXp
          );

          await tx.character.update({
            where: { userId },
            data: {
              gold: updatedCharacter.gold + activeBattle.boss.rewardGold,
              level: bossXpGain.newLevel,
              currentXp: bossXpGain.newXp,
              activeBadge: activeBattle.boss.badgeReward || updatedCharacter.activeBadge,
            },
          });

          await tx.activityLog.create({
            data: {
              userId,
              action: "BOSS_DEFEATED",
              title: `Defeated ${activeBattle.boss.name}!`,
              details: `Claimed ${activeBattle.boss.rewardGold} Gold & ${activeBattle.boss.rewardXp} XP!`,
              xpGained: activeBattle.boss.rewardXp,
              goldGained: activeBattle.boss.rewardGold,
            },
          });

          const nextBoss = await tx.boss.findFirst({
            where: { id: { not: activeBattle.bossId } },
            orderBy: { level: "asc" },
          });

          if (nextBoss) {
            await tx.userBossBattle.create({
              data: {
                userId,
                bossId: nextBoss.id,
                currentHp: nextBoss.maxHp,
                maxHp: nextBoss.maxHp,
              },
            });
          }
        }
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: "QUEST_COMPLETED",
          title: `Completed: ${quest.title}`,
          details: `Earned +${quest.xpReward} XP, +${finalGoldEarned} Gold, and +${quest.statReward} ${quest.category}!`,
          xpGained: quest.xpReward,
          goldGained: finalGoldEarned,
        },
      });

      if (xpProgression.didLevelUp) {
        await tx.activityLog.create({
          data: {
            userId,
            action: "LEVEL_UP",
            title: `Ascended to Level ${xpProgression.newLevel}!`,
            details: `Vitals fully restored! Max HP and Mana increased.`,
            xpGained: 0,
            goldGained: 0,
          },
        });
      }

      return {
        quest: updatedQuest,
        character: updatedCharacter,
        toggledOff: false,
        rewards: {
          xp: quest.xpReward,
          gold: finalGoldEarned,
          stat: quest.statReward,
          category: quest.category,
        },
        levelUp: {
          didLevelUp: xpProgression.didLevelUp,
          newLevel: xpProgression.newLevel,
          levelsGained: xpProgression.levelsGained,
        },
        bossCombat,
        streak: {
          count: streakResult.newStreak,
          extended: streakResult.streakExtended,
        },
      };
    });

    return res.json(result);
  } catch (error: unknown) {
    console.error("Error completing quest:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
