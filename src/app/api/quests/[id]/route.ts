import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { DIFFICULTY_CONFIG } from "@/lib/rpg";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = params.id;
    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, category, difficulty, priority, recurrence, dueDate } = body;

    const updateData: {
      title?: string;
      description?: string | null;
      category?: string;
      difficulty?: string;
      priority?: string;
      recurrence?: string;
      dueDate?: Date | null;
      xpReward?: number;
      goldReward?: number;
      statReward?: number;
    } = {};

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

    return NextResponse.json({ quest: updated });
  } catch (error: unknown) {
    console.error("Error updating quest:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const questId = params.id;
    const existing = await prisma.quest.findFirst({
      where: { id: questId, userId: auth.userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    await prisma.quest.delete({
      where: { id: questId },
    });

    return NextResponse.json({ message: "Quest banished from log" });
  } catch (error: unknown) {
    console.error("Error deleting quest:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
