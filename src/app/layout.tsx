import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Life RPG — Gamified Real-World Productivity & Habit Tracker",
  description:
    "Transform daily habits, tasks, and productivity into an engaging virtual RPG progression system with non-linear leveling, attributes, merchant economy, and boss battles.",
  keywords: [
    "Life RPG",
    "Gamified Productivity",
    "Habit Tracker",
    "RPG To-Do List",
    "Gamification",
    "Quest Board",
    "Level Up",
  ],
  authors: [{ name: "Life RPG Guild" }],
};

export const viewport: Viewport = {
  themeColor: "#0B0F19",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-rpg-bg text-gray-100 antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
