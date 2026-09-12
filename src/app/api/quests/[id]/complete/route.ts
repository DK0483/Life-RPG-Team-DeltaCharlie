import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { processXpGain, calculateNewStreak, calculateBossDamage } from "@/lib/rpg";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = params.id;

    const result = await prisma.$transaction(async (tx) => {
      const quest = await tx.quest.findFirst({
        where: { id: questId, userId: auth.userId },
      });

      if (!quest) {
        throw new Error("Quest not found");
      }

      const character = await tx.character.findUnique({
        where: { userId: auth.userId },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      // If quest was already completed, allow toggling back (uncomplete)
      if (quest.isCompleted) {
        const revertedQuest = await tx.quest.update({
          where: { id: questId },
          data: {
            isCompleted: false,
            completedAt: null,
          },
        });

        // Revert rewards
        const newGold = Math.max(0, character.gold - quest.goldReward);
        const newXp = Math.max(0, character.currentXp - quest.xpReward);

        const updatedChar = await tx.character.update({
          where: { userId: auth.userId },
          data: {
            gold: newGold,
            currentXp: newXp,
          },
        });

        return {
          quest: revertedQuest,
          character: updatedChar,
          toggledOff: true,
          rewards: { xp: -quest.xpReward, gold: -quest.goldReward },
        };
      }

      // Quest being marked COMPLETED
      // 1. Streak update
      const streakResult = calculateNewStreak(
        character.lastActiveDate,
        character.streakCount,
        character.longestStreak
      );

      // Streak gold bonus: +5% per streak day up to +50%
      const streakBonusMultiplier = 1 + Math.min(0.5, (streakResult.newStreak - 1) * 0.05);
      const finalGoldEarned = Math.round(quest.goldReward * streakBonusMultiplier);

      // 2. XP & Leveling
      const xpProgression = processXpGain(
        character.level,
        character.currentXp,
        quest.xpReward
      );

      // 3. Stat progression mapping
      const statToIncrement = (
        quest.category.toLowerCase() === "strength" ? "strength" :
        quest.category.toLowerCase() === "intellect" ? "intellect" :
        quest.category.toLowerCase() === "vitality" ? "vitality" :
        quest.category.toLowerCase() === "agility" ? "agility" : "charisma"
      ) as "strength" | "intellect" | "vitality" | "agility" | "charisma";

      const currentStatVal = character[statToIncrement] || 10;
      const newStatVal = currentStatVal + quest.statReward;

      // Character updates
      const charUpdateData: Record<string, unknown> = {
        level: xpProgression.newLevel,
        currentXp: xpProgression.newXp,
        gold: character.gold + finalGoldEarned,
        streakCount: streakResult.newStreak,
        longestStreak: streakResult.newLongest,
        lastActiveDate: new Date(),
        [statToIncrement]: newStatVal,
      };

      // Full heal & mana recovery on level-up
      if (xpProgression.didLevelUp) {
        charUpdateData.maxHp = character.maxHp + xpProgression.levelsGained * 15;
        charUpdateData.currentHp = character.maxHp + xpProgression.levelsGained * 15;
        charUpdateData.maxMana = character.maxMana + xpProgression.levelsGained * 10;
        charUpdateData.currentMana = character.maxMana + xpProgression.levelsGained * 10;
      }

      const updatedCharacter = await tx.character.update({
        where: { userId: auth.userId },
        data: charUpdateData,
      });

      // 4. Update Quest
      const updatedQuest = await tx.quest.update({
        where: { id: questId },
        data: {
          isCompleted: true,
          completedAt: new Date(),
          streak: quest.streak + 1,
        },
      });

      // 5. Boss Encounter Damage
      let bossCombat = null;
      const activeBattle = await tx.userBossBattle.findFirst({
        where: { userId: auth.userId, isDefeated: false },
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

        // If boss was defeated, grant boss rewards
        if (bossDefeated) {
          const bossXpGain = processXpGain(
            updatedCharacter.level,
            updatedCharacter.currentXp,
            activeBattle.boss.rewardXp
          );

          await tx.character.update({
            where: { userId: auth.userId },
            data: {
              gold: updatedCharacter.gold + activeBattle.boss.rewardGold,
              level: bossXpGain.newLevel,
              currentXp: bossXpGain.newXp,
              activeBadge: activeBattle.boss.badgeReward || updatedCharacter.activeBadge,
            },
          });

          await tx.activityLog.create({
            data: {
              userId: auth.userId,
              action: "BOSS_DEFEATED",
              title: `Defeated ${activeBattle.boss.name}!`,
              details: `Claimed ${activeBattle.boss.rewardGold} Gold & ${activeBattle.boss.rewardXp} XP!`,
              xpGained: activeBattle.boss.rewardXp,
              goldGained: activeBattle.boss.rewardGold,
            },
          });

          // Spawn next boss if available
          const nextBoss = await tx.boss.findFirst({
            where: { id: { not: activeBattle.bossId } },
            orderBy: { level: "asc" },
          });

          if (nextBoss) {
            await tx.userBossBattle.create({
              data: {
                userId: auth.userId,
                bossId: nextBoss.id,
                currentHp: nextBoss.maxHp,
                maxHp: nextBoss.maxHp,
              },
            });
          }
        }
      }

      // 6. Log completion
      await tx.activityLog.create({
        data: {
          userId: auth.userId,
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
            userId: auth.userId,
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

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error completing quest:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
