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

      if (!invItem.item.isEquippable) {
        throw new Error("This item cannot be equipped");
      }

      const willBeEquipped = !invItem.isEquipped;

      // If equipping, unequip any other item in the same category (e.g. only 1 weapon or 1 armor)
      if (willBeEquipped) {
        // Find all equipped items of this user with the same item category
        const sameCategoryItems = await tx.inventoryItem.findMany({
          where: {
            userId: auth.userId,
            isEquipped: true,
            item: { category: invItem.item.category },
          },
        });

        for (const other of sameCategoryItems) {
          await tx.inventoryItem.update({
            where: { id: other.id },
            data: { isEquipped: false },
          });
        }
      }

      // Update current item
      const updatedInv = await tx.inventoryItem.update({
        where: { id: inventoryId },
        data: { isEquipped: willBeEquipped },
        include: { item: true },
      });

      // If theme or badge, update character record
      if (invItem.item.category === "THEME") {
        await tx.character.update({
          where: { userId: auth.userId },
          data: {
            activeTheme: willBeEquipped ? invItem.item.name.toLowerCase().replace(/\s+/g, "-") : "dark-fantasy",
          },
        });
      } else if (invItem.item.category === "BADGE") {
        await tx.character.update({
          where: { userId: auth.userId },
          data: {
            activeBadge: willBeEquipped ? invItem.item.name.replace("Badge: ", "") : "Hero In Training",
          },
        });
      }

      // Log
      await tx.activityLog.create({
        data: {
          userId: auth.userId,
          action: "ITEM_EQUIPPED",
          title: willBeEquipped ? `Equipped ${invItem.item.name}` : `Unequipped ${invItem.item.name}`,
          details: willBeEquipped ? `Granted combat & attribute bonuses.` : `Removed attribute bonuses.`,
        },
      });

      // Return character with refreshed stats
      const character = await tx.character.findUnique({
        where: { userId: auth.userId },
      });

      return {
        inventoryItem: updatedInv,
        character,
        isEquipped: willBeEquipped,
      };
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error toggling equip:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
