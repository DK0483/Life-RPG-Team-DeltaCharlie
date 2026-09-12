import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  hashPassword,
  verifyPassword,
  signToken,
  requireAuth,
  AuthenticatedRequest,
  AUTH_COOKIE_NAME,
} from "../lib/auth";
import { calculateLevelInfo } from "../lib/rpg";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { username, email, password, characterClass = "Warrior", characterName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required." });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "A hero with that email or username already exists." });
    }

    const passwordHash = await hashPassword(password);
    const heroName = characterName || username;

    const classStats = {
      Warrior: { strength: 14, intellect: 9, vitality: 13, agility: 10, charisma: 9 },
      Mage: { strength: 8, intellect: 15, vitality: 10, agility: 9, charisma: 13 },
      Rogue: { strength: 10, intellect: 11, vitality: 9, agility: 15, charisma: 10 },
      Paladin: { strength: 12, intellect: 10, vitality: 14, agility: 8, charisma: 12 },
    }[characterClass as "Warrior" | "Mage" | "Rogue" | "Paladin"] || {
      strength: 10, intellect: 10, vitality: 10, agility: 10, charisma: 10,
    };

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash,
        },
      });

      await tx.character.create({
        data: {
          userId: newUser.id,
          name: heroName,
          characterClass,
          title: `Novice ${characterClass}`,
          level: 1,
          currentXp: 0,
          gold: 100,
          currentHp: 100,
          maxHp: 100,
          currentMana: 50,
          maxMana: 50,
          ...classStats,
          streakCount: 1,
          longestStreak: 1,
          lastActiveDate: new Date(),
        },
      });

      await tx.quest.createMany({
        data: [
          {
            userId: newUser.id,
            title: "Morning Physical Drill",
            description: "Complete 25 pushups or a 20-minute morning workout.",
            category: "Strength",
            difficulty: "Medium",
            priority: "High",
            recurrence: "DAILY",
            xpReward: 60,
            goldReward: 25,
            statReward: 2,
          },
          {
            userId: newUser.id,
            title: "Master Arcane Tomes",
            description: "Read 15 pages of technical documentation or a non-fiction book.",
            category: "Intellect",
            difficulty: "Medium",
            priority: "Normal",
            recurrence: "DAILY",
            xpReward: 60,
            goldReward: 25,
            statReward: 2,
          },
          {
            userId: newUser.id,
            title: "Elixir of Vital Hydration",
            description: "Drink at least 2 liters of pure water throughout the day.",
            category: "Vitality",
            difficulty: "Easy",
            priority: "Normal",
            recurrence: "DAILY",
            xpReward: 30,
            goldReward: 10,
            statReward: 1,
          },
          {
            userId: newUser.id,
            title: "Cleanse Sanctuary Grounds",
            description: "Organize desk and declutter room for maximum focus aura.",
            category: "Agility",
            difficulty: "Easy",
            priority: "Normal",
            recurrence: "ONCE",
            xpReward: 30,
            goldReward: 10,
            statReward: 1,
          },
        ],
      });

      const activeBoss = await tx.boss.findFirst({ where: { isActive: true } });
      if (activeBoss) {
        await tx.userBossBattle.create({
          data: {
            userId: newUser.id,
            bossId: activeBoss.id,
            currentHp: activeBoss.maxHp,
            maxHp: activeBoss.maxHp,
          },
        });
      }

      await tx.activityLog.create({
        data: {
          userId: newUser.id,
          action: "STREAK_EXTENDED",
          title: "Embark on Adventure",
          details: `${heroName} registered as a Level 1 ${characterClass}!`,
          xpGained: 0,
          goldGained: 100,
        },
      });

      return newUser;
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "Hero registered successfully!",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return res.status(500).json({ error: msg });
  }
});

// POST /api/auth/login
router.post("/login", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Username/email and password are required." });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
      include: { character: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials. No such adventurer found." });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials. Incorrect password." });
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Welcome back, adventurer!",
      token,
      user: { id: user.id, username: user.username, email: user.email },
      character: user.character,
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout
router.post("/logout", (_req: AuthenticatedRequest, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  return res.json({ message: "Departed camp safely." });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        character: true,
        inventory: {
          include: { item: true },
        },
        bossBattles: {
          where: { isDefeated: false },
          include: { boss: true },
          take: 1,
        },
      },
    });

    if (!user || !user.character) {
      return res.status(404).json({ error: "Hero character not found." });
    }

    const levelInfo = calculateLevelInfo(user.character.level, user.character.currentXp);

    const equippedBonuses = {
      strength: 0,
      intellect: 0,
      vitality: 0,
      agility: 0,
      charisma: 0,
    };

    user.inventory.forEach((inv) => {
      if (inv.isEquipped && inv.item.statBonusType) {
        const type = inv.item.statBonusType as keyof typeof equippedBonuses;
        if (type in equippedBonuses) {
          equippedBonuses[type] += inv.item.statBonusValue;
        }
      }
    });

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
      character: {
        ...user.character,
        levelInfo,
        equippedBonuses,
        totalStats: {
          strength: user.character.strength + equippedBonuses.strength,
          intellect: user.character.intellect + equippedBonuses.intellect,
          vitality: user.character.vitality + equippedBonuses.vitality,
          agility: user.character.agility + equippedBonuses.agility,
          charisma: user.character.charisma + equippedBonuses.charisma,
        },
      },
      activeBoss: user.bossBattles[0] || null,
    });
  } catch (error: unknown) {
    console.error("Error in me route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
