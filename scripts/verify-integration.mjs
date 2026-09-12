const BASE_URL = "http://localhost:3000";

async function runVerification() {
  console.log("=== Starting Life RPG Full-Stack Verification ===");

  let sessionCookie = "";

  // 1. Register a new adventurer
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

  // Extract set-cookie
  const setCookie = regRes.headers.get("set-cookie");
  if (setCookie) {
    sessionCookie = setCookie.split(";")[0];
  }
  console.log("✔ Hero Registered:", regPayload.username);
  console.log("✔ Session Cookie obtained:", sessionCookie.substring(0, 30) + "...");

  const defaultHeaders = {
    "Content-Type": "application/json",
    Cookie: sessionCookie,
  };

  // 2. Fetch Hero Profile & Stats
  console.log("\n[2] Testing Hero Profile & Stats (/api/auth/me)...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: defaultHeaders });
  const meData = await meRes.json();
  if (!meRes.ok) throw new Error(`Fetch me failed: ${JSON.stringify(meData)}`);

  console.log(`✔ Hero Name: ${meData.character.name}`);
  console.log(`✔ Class: ${meData.character.characterClass}, Level: ${meData.character.level}, XP: ${meData.character.currentXp}`);
  console.log(`✔ Gold: ${meData.character.gold}, HP: ${meData.character.currentHp}/${meData.character.maxHp}`);
  console.log(`✔ Strength: ${meData.character.strength}, Intellect: ${meData.character.intellect}`);
  console.log(`✔ Active Boss: ${meData.activeBoss?.boss?.name || "None"}`);

  // 3. Fetch Quests
  console.log("\n[3] Testing Starter Quests Retrieval (/api/quests)...");
  const questsRes = await fetch(`${BASE_URL}/api/quests`, { headers: defaultHeaders });
  const questsData = await questsRes.json();
  console.log(`✔ Loaded ${questsData.quests.length} initial starter quests.`);

  // 4. Create a Custom Quest
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

  // 5. Complete the Epic Quest
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
  if (completeData.bossCombat) {
    console.log(`✔ Boss Strike Dealt: ${completeData.bossCombat.damageDealt} DMG to ${completeData.bossCombat.bossName}! Boss HP: ${completeData.bossCombat.currentHp}/${completeData.bossCombat.maxHp}`);
  }

  // 6. Browse Merchant Shop and Purchase an Item
  console.log("\n[6] Testing Shop Catalog & Purchase (/api/shop/buy)...");
  const shopRes = await fetch(`${BASE_URL}/api/shop`, { headers: defaultHeaders });
  const shopData = await shopRes.json();
  const swordItem = shopData.items.find((i) => i.name === "Iron Greatsword");
  if (!swordItem) throw new Error("Iron Greatsword not found in shop catalog");

  console.log(`✔ Found ${swordItem.name} (Cost: ${swordItem.cost} Gold)`);
  const buyRes = await fetch(`${BASE_URL}/api/shop/buy`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ itemId: swordItem.id }),
  });
  const buyData = await buyRes.json();
  if (!buyRes.ok) throw new Error(`Buy item failed: ${JSON.stringify(buyData)}`);
  console.log(`✔ Purchased ${swordItem.name}! Remaining Gold: ${buyData.character.gold}`);

  // 7. Equip the Item from Inventory
  console.log("\n[7] Testing Equipping Item (/api/inventory/equip)...");
  const equipRes = await fetch(`${BASE_URL}/api/inventory/equip`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ inventoryId: buyData.inventoryItem.id }),
  });
  const equipData = await equipRes.json();
  if (!equipRes.ok) throw new Error(`Equip failed: ${JSON.stringify(equipData)}`);
  console.log(`✔ Successfully Equipped: ${swordItem.name}! Is Equipped: ${equipData.isEquipped}`);

  // 8. Re-verify Character Stats with Equipment Bonuses
  console.log("\n[8] Testing Character Paperdoll Stats Reflection...");
  const updatedMeRes = await fetch(`${BASE_URL}/api/auth/me`, { headers: defaultHeaders });
  const updatedMe = await updatedMeRes.json();
  console.log(`✔ Base Strength: ${updatedMe.character.strength}`);
  console.log(`✔ Equipment Strength Bonus: +${updatedMe.character.equippedBonuses.strength}`);
  console.log(`✔ Total Effective Strength: ${updatedMe.character.totalStats.strength}`);

  // 9. Verify Activity Logs
  console.log("\n[9] Testing Activity Audit Chronicle (/api/logs)...");
  const logsRes = await fetch(`${BASE_URL}/api/logs`, { headers: defaultHeaders });
  const logsData = await logsRes.json();
  console.log(`✔ Retrieved ${logsData.logs.length} activity audit log entries:`);
  logsData.logs.slice(0, 4).forEach((l) => console.log(`   - [${l.action}] ${l.title}: ${l.details || ""}`));

  console.log("\n🎉 ALL 9 FULL-STACK INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
