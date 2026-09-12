import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, characterClass, characterName } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required." },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check existing
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A hero with that email or username already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const chosenClass = characterClass || "Warrior";
    const heroName = characterName || username;

    // Stat bonuses depending on starting class
    const classStats = {
      Warrior: { strength: 14, intellect: 9, vitality: 13, agility: 10, charisma: 9 },
      Mage: { strength: 8, intellect: 15, vitality: 10, agility: 9, charisma: 13 },
      Rogue: { strength: 10, intellect: 11, vitality: 9, agility: 15, charisma: 10 },
      Paladin: { strength: 12, intellect: 10, vitality: 14, agility: 8, charisma: 12 },
    }[chosenClass as "Warrior" | "Mage" | "Rogue" | "Paladin"] || {
      strength: 10,
      intellect: 10,
      vitality: 10,
      agility: 10,
      charisma: 10,
    };

    // Create user and related entities in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash,
        },
      });

      // Create character
      await tx.character.create({
        data: {
          userId: newUser.id,
          name: heroName,
          characterClass: chosenClass,
          title: `Novice ${chosenClass}`,
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

      // Create starter quests
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

      // Link active boss battle if boss exists
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

      // Initial log
      await tx.activityLog.create({
        data: {
          userId: newUser.id,
          action: "STREAK_EXTENDED",
          title: "Embark on Adventure",
          details: `${heroName} registered as a Level 1 ${chosenClass}!`,
          xpGained: 0,
          goldGained: 100,
        },
      });

      return newUser;
    });

    // Create session token
    const token = signToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Hero registered successfully!",
        user: { id: user.id, username: user.username, email: user.email },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Registration error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
