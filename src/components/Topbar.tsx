"use client";

import { signOut } from "next-auth/react";
import { ToggleModeSombre } from "./ToggleModeSombre";
import { ToggleDevise } from "./ToggleDevise";

export function Topbar({ nom, role }: { nom: string; role: string }) {
  return (
    <header className="flex items-center justify-between bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 md:px-8 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sticky top-0 z-10">
      <div className="text-sm text-gray-400 hidden sm:flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-tamak-gold" />
        {role}
      </div>
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <ToggleDevise />
        <ToggleModeSombre />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tamak-navy to-[#2C4A80] text-white flex items-center justify-center text-xs font-semibold">
          {nom.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium hidden sm:inline">{nom}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-tamak-navy border border-tamak-navy/30 rounded-lg px-3 py-1.5 hover:bg-tamak-navy hover:text-white hover:shadow-md transition-all"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}