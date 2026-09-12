const BASE_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function runVerification() {
  console.log("=== Starting Life RPG Backend API Verification ===");
  console.log("Target:", BASE_URL);

  let sessionCookie = "";

  // 1. Health check
  console.log("\n[0] Testing Health Endpoint...");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) throw new Error("Health check failed");
  console.log("✔ Health check OK!");

  // 2. Register
  console.log("\n[1] Testing Hero Registration...");
  const uniqueId = Date.now();
  const regPayload = {
    username: `valerius_${uniqueId}`,
    email: `valerius_${uniqueId}@realm.guild`,
    password: "HeroicPassword123!",
    characterClass: "Warrior",
    characterName: "Valerius Sunshield",
  };

  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(regPayload),
  });

  if (!regRes.ok) {
    throw new Error(`Registration failed: ${await regRes.text()}`);
  }

  const setCookie = regRes.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = setCookie.split(";")[0];
  }
  const regData = await regRes.json();
  const token = regData.token;

  console.log("✔ Hero Registered:", regPayload.username);

  const defaultHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Cookie: sessionCookie,
  };

  // 3. Me
  console.log("\n[2] Testing Hero Profile & Stats (/api/auth/me)...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: defaultHeaders });
  const meData = await meRes.json();
  if (!meRes.ok) throw new Error(`Fetch me failed: ${JSON.stringify(meData)}`);
  console.log(`✔ Hero Name: ${meData.character.name}`);
  console.log(`✔ Level: ${meData.character.level}, XP: ${meData.character.currentXp}, Gold: ${meData.character.gold}`);

  // 4. Starter Quests
  console.log("\n[3] Testing Starter Quests Retrieval (/api/quests)...");
  const questsRes = await fetch(`${BASE_URL}/api/quests`, { headers: defaultHeaders });
  const questsData = await questsRes.json();
  console.log(`✔ Loaded ${questsData.quests.length} initial starter quests.`);

  // 5. Create Epic Quest
  console.log("\n[4] Testing Quest Creation (POST /api/quests)...");
  const createQuestRes = await fetch(`${BASE_URL}/api/quests`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      title: "Conquer Database Architecture Refactor",
      description: "Design optimized relational models and indexes.",
      category: "Intellect",
      difficulty: "Epic",
      priority: "High",
      recurrence: "ONCE",
    }),
  });
  const createdData = await createQuestRes.json();
  if (!createQuestRes.ok) throw new Error(`Create quest failed: ${JSON.stringify(createdData)}`);
  const newQuest = createdData.quest;
  console.log(`✔ Created Epic Quest: "${newQuest.title}" (+${newQuest.xpReward} XP, +${newQuest.goldReward} Gold)`);

  // 6. Complete Quest
  console.log("\n[5] Testing Quest Completion & Level-Up Loop...");
  const completeRes = await fetch(`${BASE_URL}/api/quests/${newQuest.id}/complete`, {
    method: "POST",
    headers: defaultHeaders,
  });
  const completeData = await completeRes.json();
  if (!completeRes.ok) throw new Error(`Complete quest failed: ${JSON.stringify(completeData)}`);

  console.log(`✔ Quest Completed: ${completeData.quest.title}`);
  console.log(`✔ Rewards Earned: +${completeData.rewards.xp} XP, +${completeData.rewards.gold} Gold`);
  console.log(`✔ Level-Up Status: Did Level Up = ${completeData.levelUp.didLevelUp}, New Level = ${completeData.character.level}`);

  // 7. Shop & Buy
  console.log("\n[6] Testing Shop Catalog & Purchase (/api/shop/buy)...");
  const shopRes = await fetch(`${BASE_URL}/api/shop`, { headers: defaultHeaders });
  const shopData = await shopRes.json();
  const swordItem = shopData.items.find((i) => i.name === "Iron Greatsword");
  if (!swordItem) throw new Error("Iron Greatsword not found in shop catalog");

  const buyRes = await fetch(`${BASE_URL}/api/shop/buy`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ itemId: swordItem.id }),
  });
  const buyData = await buyRes.json();
  if (!buyRes.ok) throw new Error(`Buy item failed: ${JSON.stringify(buyData)}`);
  console.log(`✔ Purchased ${swordItem.name}! Remaining Gold: ${buyData.character.gold}`);

  // 8. Equip
  console.log("\n[7] Testing Equipping Item (/api/inventory/equip)...");
  const equipRes = await fetch(`${BASE_URL}/api/inventory/equip`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ inventoryId: buyData.inventoryItem.id }),
  });
  const equipData = await equipRes.json();
  if (!equipRes.ok) throw new Error(`Equip failed: ${JSON.stringify(equipData)}`);
  console.log(`✔ Successfully Equipped: ${swordItem.name}!`);

  // 9. Stats
  console.log("\n[8] Testing Character Paperdoll Stats Reflection...");
  const updatedMeRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: defaultHeaders });
  const updatedMe = await updatedMeRes.json();
  console.log(`✔ Effective Strength: ${updatedMe.character.totalStats.strength}`);

  // 10. Logs
  console.log("\n[9] Testing Activity Audit Chronicle (/api/logs)...");
  const logsRes = await fetch(`${BASE_URL}/api/logs`, { headers: defaultHeaders });
  const logsData = await logsRes.json();
  console.log(`✔ Retrieved ${logsData.logs.length} activity audit log entries.`);

  console.log("\n🎉 ALL BACKEND API INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
}

runVerification().catch((err) => {
  console.error("Backend verification failed:", err);
  process.exit(1);
});
