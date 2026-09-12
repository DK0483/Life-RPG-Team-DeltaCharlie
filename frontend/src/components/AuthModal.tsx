"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Swords,
  Shield,
  Wand2,
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Flame,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(initialMode);

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError("");
    }
  }, [isOpen, initialMode]);

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [characterName, setCharacterName] = useState("");
  const [characterClass, setCharacterClass] = useState<"Warrior" | "Mage" | "Rogue" | "Paladin">("Warrior");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const res = await login(identifier, password);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    const res = await register({
      username: username.trim(),
      email: email.trim(),
      password,
      characterClass,
      characterName: characterName.trim() || username.trim(),
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.error || "Registration failed");
    }
  };

  const handleQuickDemo = async () => {
    setIsSubmitting(true);
    setError("");
    const demoId = `hero_${Math.floor(1000 + Math.random() * 9000)}`;
    const res = await register({
      username: demoId,
      email: `${demoId}@guild.realm`,
      password: "password123",
      characterClass: "Warrior",
      characterName: `Champion ${demoId.slice(-4)}`,
    });
    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      // Fallback try login if exists
      await login(demoId, "password123");
      onClose();
    }
  };

  const classes = [
    {
      name: "Warrior",
      icon: Swords,
      desc: "Favors Strength & Vitality. Excels in workouts, physical grit, and relentless endurance.",
      color: "border-red-500/50 bg-red-500/10 text-red-300",
    },
    {
      name: "Mage",
      icon: Wand2,
      desc: "Favors Intellect. Channels immense focus into programming, research, and deep work.",
      color: "border-blue-500/50 bg-blue-500/10 text-blue-300",
    },
    {
      name: "Rogue",
      icon: Flame,
      desc: "Favors Agility. Masters swift task execution, lightning chores, and agile speed.",
      color: "border-amber-500/50 bg-amber-500/10 text-amber-300",
    },
    {
      name: "Paladin",
      icon: Shield,
      desc: "Favors Vitality & Charisma. Balances holistic wellness, discipline, and inspiring habits.",
      color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-rpg-card border border-rpg-border rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-rpg-cardHover transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 mx-auto mb-3">
            <Swords className="w-6 h-6 text-gray-950 stroke-[2.5]" />
          </div>
          <h3 className="font-cinzel text-2xl font-black bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {mode === "login" ? "Enter the Guildhall" : "Forge Your Hero"}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {mode === "login"
              ? "Sign in to synchronize your character, quests, and spoils."
              : "Begin your life RPG journey with a persistent character record."}
          </p>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div className="flex rounded-xl bg-rpg-bg p-1 border border-rpg-border mb-5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === "login"
                ? "bg-amber-500 text-gray-950 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign In (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === "register"
                ? "bg-amber-500 text-gray-950 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Sign Up (Create Hero)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Forms */}
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="hero@guild.realm or hero_tag"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Master Passphrase
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-98 mt-2 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "Authenticating..." : "Step Inside Guild (Sign In)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                New to the realm?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline transition"
                >
                  Create Hero Account (Sign Up)
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Hero Call-Sign (Username) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="DragonSlayer99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Dispatch Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="adventurer@guild.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1">
                Secret Passphrase *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-rpg-bg border border-rpg-border rounded-xl pl-9 pr-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Character Class Choice */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                Choose Archetype Class
              </label>
              <div className="grid grid-cols-2 gap-2">
                {classes.map((c) => {
                  const Icon = c.icon;
                  const isSelected = characterClass === c.name;
                  return (
                    <button
                      type="button"
                      key={c.name}
                      onClick={() => setCharacterClass(c.name as typeof characterClass)}
                      className={`p-2 rounded-xl border text-left transition ${
                        isSelected
                          ? c.color + " border-opacity-100 shadow-sm"
                          : "border-rpg-border bg-rpg-bg text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{c.name}</span>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1 line-clamp-2 leading-tight">
                        {c.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-98 mt-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? "Awakening Hero..." : "Inscribe Hero & Begin (Sign Up)"}</span>
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Already registered a hero?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline transition"
                >
                  Sign In (Login Here)
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Instant Demo Hero Option */}
        <div className="mt-5 pt-4 border-t border-rpg-border/60 text-center">
          <p className="text-[11px] text-gray-400 mb-2">Want to jump in immediately?</p>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={isSubmitting}
            className="w-full py-2 rounded-xl bg-rpg-cardHover hover:bg-rpg-border border border-rpg-border text-gray-300 hover:text-white text-xs font-bold transition"
          >
            ⚔️ Instant 1-Click Demo Hero
          </button>
        </div>
      </div>
    </div>
  );
}
