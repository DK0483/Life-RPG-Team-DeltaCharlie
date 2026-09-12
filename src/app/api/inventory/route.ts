import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: { userId: auth.userId },
      include: { item: true },
      orderBy: [
        { isEquipped: "desc" },
        { acquiredAt: "desc" },
      ],
    });

    return NextResponse.json({ inventory });
  } catch (error: unknown) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
