import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { processXpGain } from "@/lib/rpg";

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inventoryId } = body;

    if (!inventoryId) {
      return NextResponse.json({ error: "Inventory item ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: inventoryId, userId: auth.userId },
        include: { item: true },
      });

      if (!invItem) {
        throw new Error("Item not found in inventory");
      }

      if (!invItem.item.isConsumable) {
        throw new Error("This item cannot be consumed");
      }

      if (invItem.quantity <= 0) {
        throw new Error("You have no more of this item");
      }

      const character = await tx.character.findUnique({
        where: { userId: auth.userId },
      });

      if (!character) {
        throw new Error("Character not found");
      }

      const item = invItem.item;
      const charUpdate: Record<string, unknown> = {};
      let effectDescription = "";

      if (item.statBonusType === "currentHp") {
        const healedHp = Math.min(character.maxHp, character.currentHp + item.statBonusValue);
        charUpdate.currentHp = healedHp;
        effectDescription = `Restored ${item.statBonusValue} HP!`;
      } else if (item.statBonusType === "currentMana") {
        const restoredMana = Math.min(character.maxMana, character.currentMana + item.statBonusValue);
        charUpdate.currentMana = restoredMana;
        effectDescription = `Restored ${item.statBonusValue} Mana!`;
      } else if (item.statBonusType === "currentXp") {
        const xpProgression = processXpGain(character.level, character.currentXp, item.statBonusValue);
        charUpdate.level = xpProgression.newLevel;
        charUpdate.currentXp = xpProgression.newXp;
        effectDescription = `Surged with ${item.statBonusValue} XP!`;
        if (xpProgression.didLevelUp) {
          effectDescription += ` Ascended to Level ${xpProgression.newLevel}!`;
        }
      }

      const updatedCharacter = await tx.character.update({
        where: { userId: auth.userId },
        data: charUpdate,
      });

      // Decrement inventory quantity
      let remainingInventory = null;
      if (invItem.quantity > 1) {
        remainingInventory = await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: { quantity: invItem.quantity - 1 },
          include: { item: true },
        });
      } else {
        await tx.inventoryItem.delete({
          where: { id: invItem.id },
        });
      }

      // Log
      await tx.activityLog.create({
        data: {
          userId: auth.userId,
          action: "ITEM_USED",
          title: `Consumed ${item.name}`,
          details: effectDescription,
        },
      });

      return {
        character: updatedCharacter,
        remainingInventory,
        effectDescription,
        item,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error using item:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
