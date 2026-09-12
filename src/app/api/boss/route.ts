import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current active boss battle
    let activeBattle = await prisma.userBossBattle.findFirst({
      where: { userId: auth.userId, isDefeated: false },
      include: { boss: true },
    });

    // If no active battle, assign the first active boss
    if (!activeBattle) {
      const boss = await prisma.boss.findFirst({
        where: { isActive: true },
      });

      if (boss) {
        activeBattle = await prisma.userBossBattle.create({
          data: {
            userId: auth.userId,
            bossId: boss.id,
            currentHp: boss.maxHp,
            maxHp: boss.maxHp,
          },
          include: { boss: true },
        });
      }
    }

    // Get defeated bosses count
    const defeatedCount = await prisma.userBossBattle.count({
      where: { userId: auth.userId, isDefeated: true },
    });

    return NextResponse.json({
      battle: activeBattle,
      defeatedCount,
    });
  } catch (error: unknown) {
    console.error("Error fetching boss info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
