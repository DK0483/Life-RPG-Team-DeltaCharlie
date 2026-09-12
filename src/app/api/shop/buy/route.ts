import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new Error("Item not found in catalog");
      }

      const character = await tx.character.findUnique({ where: { userId: auth.userId } });
      if (!character) {
        throw new Error("Character not found");
      }

      if (character.gold < item.cost) {
        throw new Error(`Insufficient gold! You need ${item.cost} Gold, but currently hold ${character.gold} Gold.`);
      }

      // Check if user already owns non-consumable item
      const existingInventory = await tx.inventoryItem.findFirst({
        where: { userId: auth.userId, itemId: item.id },
      });

      if (!item.isConsumable && existingInventory) {
        throw new Error("You already possess this unique relic or equipment!");
      }

      // Deduct gold
      const updatedCharacter = await tx.character.update({
        where: { userId: auth.userId },
        data: { gold: character.gold - item.cost },
      });

      let updatedInventory;
      if (existingInventory && item.isConsumable) {
        updatedInventory = await tx.inventoryItem.update({
          where: { id: existingInventory.id },
          data: { quantity: existingInventory.quantity + 1 },
          include: { item: true },
        });
      } else {
        updatedInventory = await tx.inventoryItem.create({
          data: {
            userId: auth.userId,
            itemId: item.id,
            quantity: 1,
            isEquipped: false,
          },
          include: { item: true },
        });
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: auth.userId,
          action: "ITEM_BOUGHT",
          title: `Acquired ${item.name}`,
          details: `Purchased from guild merchant for ${item.cost} Gold.`,
          xpGained: 0,
          goldGained: -item.cost,
        },
      });

      return {
        character: updatedCharacter,
        inventoryItem: updatedInventory,
        item,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error buying item:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
