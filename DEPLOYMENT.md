# 🚀 Life RPG — Live Deployment Guide

This guide walks you through deploying **Life RPG** online for **free** with zero Docker requirements.

---

## 🌟 Recommended Architecture (Fastest & 100% Free)

- **Backend API**: Hosted on **[Render.com](https://render.com)** (Free Node.js Web Service + SQLite).
- **Frontend App**: Hosted on **[Vercel.com](https://vercel.com)** (Free Next.js Edge Hosting + Free SSL).

---

## ⚡ Step 1: Deploy Backend to Render (2 Minutes)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in with GitHub.
2. Click **New +** $\rightarrow$ **Web Service**.
3. Choose **Build and deploy from a Git repository**, then select:
   ```text
   https://github.com/DK0483/Life-RPG-Team-DeltaCharlie.git
   ```
4. Configure the service settings:
   - **Name**: `life-rpg-backend` (or any unique name)
   - **Region**: Closest to you (e.g., Singapore, Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npx prisma db push && node scripts/seed.mjs && npx tsc
     ```
   - **Start Command**:
     ```bash
     npm run start
     ```
   - **Instance Type**: `Free`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `life-rpg-production-secret-token-key-2025` (or click generate)
   - `PORT`: `10000`
6. Click **Create Web Service**.
7. Wait ~2 minutes until Render prints:
   ```text
   ⚔️ Life RPG Backend server listening on port 10000
   ```
8. **Copy your Backend URL** (e.g. `https://life-rpg-backend.onrender.com`).

---

## ⚡ Step 2: Deploy Frontend to Vercel (1 Minute)

1. Go to **[vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import your repository:
   ```text
   DK0483/Life-RPG-Team-DeltaCharlie
   ```
4. In the project configuration:
   - **Framework Preset**: `Next.js` (automatically detected)
   - **Root Directory**: Click **Edit** and select `frontend`
5. Expand **Environment Variables** and add:
   - **Key**: `BACKEND_INTERNAL_URL`
   - **Value**: `https://your-backend-name.onrender.com` (Paste the Render URL from Step 1)
   - *(Optional)* **Key**: `NEXT_PUBLIC_API_URL`
   - *(Optional)* **Value**: `https://your-backend-name.onrender.com`
6. Click **Deploy**.
7. In ~60 seconds, Vercel will present you with your live URL:
   ```text
   https://life-rpg-team-deltacharlie.vercel.app
   ```

---

## ⚡ Step 3: Link Backend CORS to Frontend (30 Seconds)

1. Go back to your Render Dashboard $\rightarrow$ `life-rpg-backend` $\rightarrow$ **Environment**.
2. Add or update the variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://life-rpg-team-deltacharlie.vercel.app` (Your Vercel URL)
3. Click **Save Changes** (Render will automatically redeploy).

🎉 **Congratulations! Your Life RPG hackathon project is fully live and globally accessible!**

---

## 🧪 Post-Deployment Verification

1. Open your Vercel URL in your browser or phone.
2. Click **Sign Up** to create your hero.
3. Test creating a quest, marking it completed, hearing the level-up chime, and striking the boss!
