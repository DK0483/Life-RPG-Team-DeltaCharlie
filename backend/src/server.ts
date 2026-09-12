import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/auth.routes";
import questRoutes from "./routes/quest.routes";
import shopRoutes from "./routes/shop.routes";
import inventoryRoutes from "./routes/inventory.routes";
import bossRoutes from "./routes/boss.routes";
import logRoutes from "./routes/log.routes";

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// CORS configuration for cross-origin authentication
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "Life RPG Backend API", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/quests", questRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/boss", bossRoutes);
app.use("/api/logs", logRoutes);

app.listen(PORT, () => {
  console.log(`⚔️ Life RPG Backend server listening on port ${PORT}`);
  console.log(`📡 Accepting requests from ${FRONTEND_URL}`);
});

export default app;
