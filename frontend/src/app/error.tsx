"use client";

import React, { useEffect } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Hero encountered a rift exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-xl shadow-red-500/10 animate-bounce">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-red-400 font-cinzel">
        Realm Anomaly
      </span>

      <h1 className="font-cinzel text-3xl font-black text-gray-100 mt-1 mb-2">
        A Critical Rift Occurred
      </h1>

      <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
        The weave of reality experienced a temporary disturbance: {error.message || "Unknown anomaly"}.
        Cast a recovery spell to continue your journey.
      </p>

      <button
        onClick={() => reset()}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:brightness-110 text-gray-950 font-black text-xs shadow-lg shadow-red-500/20 transition active:scale-95"
      >
        <RefreshCw className="w-4 h-4 stroke-[2.5]" />
        <span>Cast Recovery Spell (Retry)</span>
      </button>
    </div>
  );
}
