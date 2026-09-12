import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);

    const items = await prisma.item.findMany({
      orderBy: [
        { category: "asc" },
        { cost: "asc" },
      ],
    });

    if (!auth) {
      return NextResponse.json({ items: items.map((i) => ({ ...i, owned: false, isEquipped: false })) });
    }

    const userInventory = await prisma.inventoryItem.findMany({
      where: { userId: auth.userId },
    });

    const inventoryMap = new Map(userInventory.map((inv) => [inv.itemId, inv]));

    const enrichedItems = items.map((item) => {
      const inv = inventoryMap.get(item.id);
      return {
        ...item,
        owned: !!inv,
        quantity: inv ? inv.quantity : 0,
        isEquipped: inv ? inv.isEquipped : false,
      };
    });

    return NextResponse.json({ items: enrichedItems });
  } catch (error: unknown) {
    console.error("Error fetching shop items:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
