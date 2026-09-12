import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";

const router = Router();
router.use(requireAuth);

// GET /api/boss
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let activeBattle = await prisma.userBossBattle.findFirst({
      where: { userId, isDefeated: false },
      include: { boss: true },
    });

    if (!activeBattle) {
      const boss = await prisma.boss.findFirst({ where: { isActive: true } });
      if (boss) {
        activeBattle = await prisma.userBossBattle.create({
          data: {
            userId,
            bossId: boss.id,
            currentHp: boss.maxHp,
            maxHp: boss.maxHp,
          },
          include: { boss: true },
        });
      }
    }

    const defeatedCount = await prisma.userBossBattle.count({
      where: { userId, isDefeated: true },
    });

    return res.json({ battle: activeBattle, defeatedCount });
  } catch (error: unknown) {
    console.error("Error fetching boss:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
