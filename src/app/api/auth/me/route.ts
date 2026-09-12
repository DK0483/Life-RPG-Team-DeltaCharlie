import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { calculateLevelInfo } from "@/lib/rpg";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        character: true,
        inventory: {
          include: {
            item: true,
          },
        },
        bossBattles: {
          where: { isDefeated: false },
          include: {
            boss: true,
          },
          take: 1,
        },
      },
    });

    if (!user || !user.character) {
      return NextResponse.json({ error: "Hero character not found." }, { status: 404 });
    }

    const levelInfo = calculateLevelInfo(user.character.level, user.character.currentXp);

    // Calculate item bonus stats
    const equippedBonuses = {
      strength: 0,
      intellect: 0,
      vitality: 0,
      agility: 0,
      charisma: 0,
    };

    user.inventory.forEach((inv) => {
      if (inv.isEquipped && inv.item.statBonusType) {
        const type = inv.item.statBonusType as keyof typeof equippedBonuses;
        if (type in equippedBonuses) {
          equippedBonuses[type] += inv.item.statBonusValue;
        }
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      character: {
        ...user.character,
        levelInfo,
        equippedBonuses,
        totalStats: {
          strength: user.character.strength + equippedBonuses.strength,
          intellect: user.character.intellect + equippedBonuses.intellect,
          vitality: user.character.vitality + equippedBonuses.vitality,
          agility: user.character.agility + equippedBonuses.agility,
          charisma: user.character.charisma + equippedBonuses.charisma,
        },
      },
      activeBoss: user.bossBattles[0] || null,
    });
  } catch (error: unknown) {
    console.error("Error fetching current hero:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
