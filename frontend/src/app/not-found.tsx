import Link from "next/link";
import { Compass, Swords } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-rpg-bg flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-xl shadow-amber-500/10">
        <Compass className="w-8 h-8 animate-spin" style={{ animationDuration: "12s" }} />
      </div>

      <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-cinzel">
        Error 404
      </span>

      <h1 className="font-cinzel text-3xl sm:text-4xl font-black text-gray-100 mt-1 mb-2">
        Lost in the Astral Void
      </h1>

      <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-6 leading-relaxed">
        The parchment you seek does not exist in this plane. Turn back before the void fiends take notice of your presence.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-black text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
      >
        <Swords className="w-4 h-4 stroke-[2.5]" />
        <span>Return to Guildhall</span>
      </Link>
    </div>
  );
}
