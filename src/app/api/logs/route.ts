import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.activityLog.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
