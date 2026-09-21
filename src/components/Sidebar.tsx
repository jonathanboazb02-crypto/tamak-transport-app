"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Categorie, Module, peutLire } from "@/lib/rbac";
import { Logo } from "./Logo";

const LIENS: { href: string; label: string; module: Module }[] = [
  { href: "/accueil", label: "Accueil", module: "accueil" },
  { href: "/dashboard", label: "Tableau de bord", module: "dashboard" },
  { href: "/vehicules", label: "Nos véhicules", module: "vehicules" },
  { href: "/carburant", label: "Carburant", module: "carburant" },
  { href: "/courses", label: "Courses", module: "courses" },
  { href: "/equipe", label: "Équipe", module: "equipe" },
  { href: "/analyse", label: "Analyse de données", module: "analyse" },
  { href: "/utilisateurs", label: "Utilisateurs", module: "utilisateurs" },
  { href: "/parametres", label: "Paramètres", module: "parametres" },
];

export function Sidebar({ categorie }: { categorie: Categorie }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const liensAutorises = LIENS.filter((l) => peutLire(categorie, l.module));

  return (
    <>
      {/* Barre mobile en haut, avec bouton menu */}
      <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-tamak-navy to-[#16294D] text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Logo className="h-8" />
          <span className="font-bold">TAMAK Transport</span>
        </div>
        <button aria-label="Ouvrir le menu" onClick={() => setOuvert(!ouvert)} className="text-2xl leading-none">
          {ouvert ? "✕" : "☰"}
        </button>
      </div>

      {/* Panneau de navigation : colonne fixe sur desktop, tiroir sur mobile */}
      <nav
        className={`bg-gradient-to-b from-tamak-navy to-[#152238] text-white w-64 md:min-h-screen md:sticky md:top-0 z-20 shadow-xl
        ${ouvert ? "block" : "hidden"} md:block`}
      >
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="bg-white/95 rounded-xl p-1.5 shadow-sm">
            <Logo className="h-8" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">TAMAK Transport</p>
            <p className="text-xs text-white/50">Application de suivi</p>
          </div>
        </div>
        <ul className="py-3 px-2">
          {liensAutorises.map((lien) => {
            const actif = pathname.startsWith(lien.href);
            return (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  onClick={() => setOuvert(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 mb-0.5 text-sm rounded-lg transition ${
                    actif
                      ? "bg-gradient-to-r from-white/15 to-white/5 text-white font-semibold shadow-inner"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${actif ? "bg-tamak-gold" : "bg-transparent"}`} />
                  {lien.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}