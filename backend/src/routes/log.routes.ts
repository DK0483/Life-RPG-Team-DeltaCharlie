import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";

const router = Router();
router.use(requireAuth);

// GET /api/logs
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    return res.json({ logs });
  } catch (error: unknown) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
