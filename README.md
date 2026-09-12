# ⚔️ Life RPG — Realm of Progression

[![Next.js](https://img.shields.io/badge/Next.js-14.2.25-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-Zero--Docker-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)

A full-stack, deeply immersive **Life RPG** web application that bridges the delayed gratification problem of real-world productivity by translating mundane habits and tasks into a tactile fantasy role-playing adventure.

Unlike generic productivity dashboards or unstyled CRUD apps, **Life RPG** features a handcrafted dark-fantasy aesthetic, zero-dependency synthesized audio feedback via the Web Audio API, non-linear mathematical progression curves, equipment paperdolls, an active merchant economy, and world boss raids directly damaged through completed real-world endeavors.

---

## 🌟 Key Highlights & Design Philosophy

- **Alive & Tactile Micro-Interactions**: Real-time floating combat text (`+60 XP`, `+25 Gold`, `-45 Boss DMG!`), celebratory particle cannons (`canvas-confetti`), glowing vital bars, and spring animations.
- **Synthesized Web Audio Engine**: Pure browser Web Audio API oscillator synthesis—no missing MP3 files or external audio assets. Features crystal quest completion chimes, triumphant multi-chord level-up fanfares, metallic coin clinks, boss strike slashes, and equip clicks with a persistent master mute toggle.
- **Relational Integrity Without Docker**: Powered by an embedded SQLite database using Prisma ORM. Zero Docker containers or external daemon processes required. Provides full ACID transactions, foreign keys, and relational schema migrations.
- **Secure Authentication & Multi-Tenancy**: Built-in bcryptjs password hashing and JWT sessions (via httpOnly cookies). Strict tenant isolation ensures users can only read or mutate their own character data, quests, and inventory.
- **Zero Fake Persistence**: Every quest completion, item purchase, stat increase, and streak update persists directly to the database and survives browser reloads.

---

## 🎮 The RPG Progression Engine

### 1. Non-Linear Leveling Curve
Progression uses an exponential growth formula where each subsequent level requires significantly more effort:

$$\text{XP Required}(L) = \lfloor 100 \times L^{1.55} \rfloor$$

| Level | XP to Next Level | Total Cumulative XP |
|---|---|---|
| **Level 1** | 100 XP | 100 XP |
| **Level 2** | 292 XP | 392 XP |
| **Level 3** | 549 XP | 941 XP |
| **Level 4** | 860 XP | 1,801 XP |
| **Level 5** | 1,222 XP | 3,023 XP |
| **Level 10** | 3,548 XP | 15,280 XP |

Upon leveling up, the adventurer receives:
- Full Hit Points (HP) and Mana Points (MP) restoration.
- Permanent increases to maximum vital pools (+15 Max HP, +10 Max MP per level).
- Celebratory fanfare modal with golden ray particle burst.

### 2. Attribute-Driven Task Categorization
Real-world activities directly cultivate specific character attributes:

| Realm Category | Governing Attribute | Real-World Habits |
|---|---|---|
| 🏋️ **Strength** | `strength` | Gym workouts, weightlifting, pushups, running, martial arts |
| 🔮 **Intellect** | `intellect` | Coding, reading, technical architecture, study sessions |
| 🌿 **Vitality** | `vitality` | 8 hours of sleep, drinking 2L water, healthy meals, posture |
| ⚡ **Agility** | `agility` | Fast chores, desk decluttering, swift errands, inbox zero |
| ✨ **Charisma** | `charisma` | Networking, public speaking, meditation, journaling, empathy |

### 3. Difficulty Multipliers
Quests reward XP, Gold, and attribute points scaled to difficulty:
- **Trivial**: 15 XP, 5 Gold, +1 Attribute Point
- **Easy**: 30 XP, 10 Gold, +1 Attribute Point
- **Medium**: 60 XP, 25 Gold, +2 Attribute Points
- **Hard**: 120 XP, 50 Gold, +3 Attribute Points
- **Epic**: 250 XP, 120 Gold, +5 Attribute Points

### 4. Streak Multiplier Engine
- Tracks consecutive daily activity against timestamps.
- Active streaks grant an escalating Gold Bonus Multiplier:
  $$\text{Multiplier} = 1 + \min(0.5, (\text{Streak} - 1) \times 0.05)$$
  *(Earning up to **+50% bonus gold** on every quest completed!)*

### 5. Dungeon Boss Raids
- World bosses (e.g. *The Procrastination Behemoth*, *The Chimera of Distractions*, *The Burnout Dragon*) possess high HP pools.
- Every completed quest lands an offensive strike against the boss:
  $$\text{Boss Strike Damage} = \text{Difficulty Base} + \lfloor \text{Primary Attribute} \times 0.8 \rfloor$$
- Slaying a boss awards massive Gold and XP bounties and unlocks exclusive title badges!

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Audio**: Custom Web Audio API synthesizer (`src/lib/sound.ts`)
- **Backend**: Next.js API Route handlers (`src/app/api/*`)
- **Database & ORM**: SQLite (`dev.db`) + Prisma ORM
- **Authentication**: JWT (`jsonwebtoken`) + Password hashing (`bcryptjs`) + `httpOnly` secure cookies

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.17.0+ (Tested on Node v22)
- **npm**: v9+ (Included with Node)
- **No Docker required!**

### 1. Clone & Install Dependencies
```bash
git clone <your-repo-url>
cd "LIFE RPG"
npm install
```

### 2. Configure Environment Variables
Copy the template file `.env.example` into `.env`:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

The default `.env` contents:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="life-rpg-mystic-secret-token-key-super-secure-change-in-prod-2025"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize & Seed Database
Run Prisma migrations and populate the shop catalog and world bosses:
```bash
npx prisma db push
npm run seed
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Production Build & Deployment

To verify the production build locally:
```bash
npm run build
npm start
```

### Deploying to Cloud Providers (Vercel, Render, Railway)

#### Vercel Deployment
1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. Under Environment Variables, configure:
   - `JWT_SECRET`: A random secure 32+ character string.
   - `DATABASE_URL`: For standard Vercel serverless deployments, you can use **Prisma Postgres**, **Supabase**, or **Turso / LibSQL** by replacing `provider = "sqlite"` in `prisma/schema.prisma` with your target provider.
4. Set Build Command: `npm run build` (which automatically runs `prisma generate`).

#### Render / Railway Deployment (Self-Hosted Node + SQLite)
1. Deploy as a Web Service.
2. Set Build Command: `npm install && npx prisma db push && npm run seed && npm run build`
3. Set Start Command: `npm start`
4. Mount a persistent disk to `/app/prisma` to keep `dev.db` persistent across redeployments!

---

## 🎬 90–180 Second Illustration Video Script

If recording the required demonstration video, follow this optimal 2-minute walkthrough checklist:

| Timestamp | Action | Key Demonstration Point |
|---|---|---|
| **0:00 - 0:25** | Open home page $\rightarrow$ Click **"Forge Your Hero"** $\rightarrow$ Choose Class (e.g. *Warrior* or *Mage*) $\rightarrow$ Submit registration. | Show smooth user creation, password hashing, and starter quest population. |
| **0:25 - 0:50** | View Character Sheet $\rightarrow$ Click **"Summon New Quest"** $\rightarrow$ Add *"Master TypeScript Generics"* (Intellect, Medium). | Demonstrate full CRUD, form validation, and instant quest rendering. |
| **0:50 - 1:15** | Click the quest checkbox to complete it. | Highlight synthesized crystal chime, canvas confetti burst, floating combat text (`+60 XP`, `+25 Gold`), and HP strike on the Dungeon Boss. |
| **1:15 - 1:35** | Complete remaining starter quests to cross the XP threshold. | Trigger the celebratory **Level Up fanfare modal**, showing visual stats ascension and HP/Mana replenishment. |
| **1:35 - 1:55** | Navigate to **Armory & Shop** $\rightarrow$ Buy an Iron Sword $\rightarrow$ Open **Hero Backpack** $\rightarrow$ Equip the sword $\rightarrow$ Verify character Strength increases. | Demonstrate merchant economy, inventory management, and paperdoll equip slots. |
| **1:55 - 2:10** | **Hard Refresh the Browser (`Ctrl + F5`)**. | **Proves 100% database persistence**: character level, equipped items, gold, and completed quest states persist directly from SQLite. |

---

## 📜 Repository Commit History
This project strictly adheres to clean chronological commits:
1. `feat(core)`: Project scaffolding, relational SQLite schema, and catalog seed script.
2. `feat(backend)`: Authentication, RPG progression engine, synthesized audio engine, and API routes.
3. `feat(ui)`: Responsive dark-fantasy interface, quest board CRUD, merchant shop, boss raids, and character sheets.
4. `docs`: Setup documentation, environment templates, deployment guide, and illustration video script.
