import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { processXpGain } from "../lib/rpg";

const router = Router();
router.use(requireAuth);

// GET /api/inventory
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const inventory = await prisma.inventoryItem.findMany({
      where: { userId },
      include: { item: true },
      orderBy: [{ isEquipped: "desc" }, { acquiredAt: "desc" }],
    });

    return res.json({ inventory });
  } catch (error: unknown) {
    console.error("Error fetching inventory:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/inventory/equip
router.post("/equip", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { inventoryId } = req.body;

    if (!inventoryId) {
      return res.status(400).json({ error: "Inventory item ID is required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: inventoryId, userId },
        include: { item: true },
      });

      if (!invItem) throw new Error("Item not found in inventory");
      if (!invItem.item.isEquippable) throw new Error("This item cannot be equipped");

      const willBeEquipped = !invItem.isEquipped;

      if (willBeEquipped) {
        const sameCategoryItems = await tx.inventoryItem.findMany({
          where: {
            userId,
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

      const updatedInv = await tx.inventoryItem.update({
        where: { id: inventoryId },
        data: { isEquipped: willBeEquipped },
        include: { item: true },
      });

      if (invItem.item.category === "THEME") {
        await tx.character.update({
          where: { userId },
          data: {
            activeTheme: willBeEquipped ? invItem.item.name.toLowerCase().replace(/\s+/g, "-") : "dark-fantasy",
          },
        });
      } else if (invItem.item.category === "BADGE") {
        await tx.character.update({
          where: { userId },
          data: {
            activeBadge: willBeEquipped ? invItem.item.name.replace("Badge: ", "") : "Hero In Training",
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId,
          action: "ITEM_EQUIPPED",
          title: willBeEquipped ? `Equipped ${invItem.item.name}` : `Unequipped ${invItem.item.name}`,
          details: willBeEquipped ? `Granted combat & attribute bonuses.` : `Removed attribute bonuses.`,
        },
      });

      const character = await tx.character.findUnique({ where: { userId } });
      return { inventoryItem: updatedInv, character, isEquipped: willBeEquipped };
    });

    return res.json(result);
  } catch (error: unknown) {
    console.error("Error toggling equip:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return res.status(400).json({ error: msg });
  }
});

// POST /api/inventory/use
router.post("/use", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { inventoryId } = req.body;

    if (!inventoryId) {
      return res.status(400).json({ error: "Inventory item ID is required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const invItem = await tx.inventoryItem.findFirst({
        where: { id: inventoryId, userId },
        include: { item: true },
      });

      if (!invItem) throw new Error("Item not found in inventory");
      if (!invItem.item.isConsumable) throw new Error("This item cannot be consumed");
      if (invItem.quantity <= 0) throw new Error("You have no more of this item");

      const character = await tx.character.findUnique({ where: { userId } });
      if (!character) throw new Error("Character not found");

      const item = invItem.item;
      const charUpdate: Record<string, unknown> = {};
      let effectDescription = "";

      if (item.statBonusType === "currentHp") {
        charUpdate.currentHp = Math.min(character.maxHp, character.currentHp + item.statBonusValue);
        effectDescription = `Restored ${item.statBonusValue} HP!`;
      } else if (item.statBonusType === "currentMana") {
        charUpdate.currentMana = Math.min(character.maxMana, character.currentMana + item.statBonusValue);
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
        where: { userId },
        data: charUpdate,
      });

      let remainingInventory = null;
      if (invItem.quantity > 1) {
        remainingInventory = await tx.inventoryItem.update({
          where: { id: invItem.id },
          data: { quantity: invItem.quantity - 1 },
          include: { item: true },
        });
      } else {
        await tx.inventoryItem.delete({ where: { id: invItem.id } });
      }

      await tx.activityLog.create({
        data: {
          userId,
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

    return res.json(result);
  } catch (error: unknown) {
    console.error("Error using item:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return res.status(400).json({ error: msg });
  }
});

export default router;
