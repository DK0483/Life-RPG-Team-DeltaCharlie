import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";

const router = Router();

// GET /api/shop
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      orderBy: [{ category: "asc" }, { cost: "asc" }],
    });

    let inventoryMap = new Map();
    if (req.user) {
      const userInventory = await prisma.inventoryItem.findMany({
        where: { userId: req.user.userId },
      });
      inventoryMap = new Map(userInventory.map((inv) => [inv.itemId, inv]));
    }

    const enrichedItems = items.map((item) => {
      const inv = inventoryMap.get(item.id);
      return {
        ...item,
        owned: !!inv,
        quantity: inv ? inv.quantity : 0,
        isEquipped: inv ? inv.isEquipped : false,
      };
    });

    return res.json({ items: enrichedItems });
  } catch (error: unknown) {
    console.error("Error fetching shop items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/shop/buy
router.post("/buy", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) throw new Error("Item not found in catalog");

      const character = await tx.character.findUnique({ where: { userId } });
      if (!character) throw new Error("Character not found");

      if (character.gold < item.cost) {
        throw new Error(`Insufficient gold! You need ${item.cost} Gold, but currently hold ${character.gold} Gold.`);
      }

      const existingInventory = await tx.inventoryItem.findFirst({
        where: { userId, itemId: item.id },
      });

      if (!item.isConsumable && existingInventory) {
        throw new Error("You already possess this unique relic or equipment!");
      }

      const updatedCharacter = await tx.character.update({
        where: { userId },
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
            userId,
            itemId: item.id,
            quantity: 1,
            isEquipped: false,
          },
          include: { item: true },
        });
      }

      await tx.activityLog.create({
        data: {
          userId,
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

    return res.json(result);
  } catch (error: unknown) {
    console.error("Error buying item:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return res.status(400).json({ error: msg });
  }
});

export default router;
