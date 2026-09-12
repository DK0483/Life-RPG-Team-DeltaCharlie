import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { DIFFICULTY_CONFIG } from "@/lib/rpg";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const recurrence = searchParams.get("recurrence");

    const whereClause: { userId: string; category?: string; recurrence?: string } = {
      userId: auth.userId,
    };

    if (category && category !== "ALL") {
      whereClause.category = category;
    }
    if (recurrence && recurrence !== "ALL") {
      whereClause.recurrence = recurrence;
    }

    const quests = await prisma.quest.findMany({
      where: whereClause,
      orderBy: [
        { isCompleted: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ quests });
  } catch (error: unknown) {
    console.error("Error fetching quests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category = "Intellect", difficulty = "Medium", priority = "Normal", recurrence = "ONCE", dueDate } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Quest title is required." }, { status: 400 });
    }

    const diffSetting = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Medium;

    const newQuest = await prisma.quest.create({
      data: {
        userId: auth.userId,
        title: title.trim(),
        description: description?.trim() || null,
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

    return NextResponse.json({ quest: newQuest }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating quest:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
