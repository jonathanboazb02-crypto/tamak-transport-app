"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Categorie, Module, peutLire } from "@/lib/rbac";
import { Logo } from "./Logo";

const LIENS: { href: string; label: string; module: Module; icone: string }[] = [
  { href: "/accueil", label: "Accueil", module: "accueil", icone: "🏠" },
  { href: "/dashboard", label: "Tableau de bord", module: "dashboard", icone: "📊" },
  { href: "/vehicules", label: "Nos véhicules", module: "vehicules", icone: "🚛" },
  { href: "/carburant", label: "Carburant", module: "carburant", icone: "⛽" },
  { href: "/courses", label: "Courses", module: "courses", icone: "🧾" },
  { href: "/equipe", label: "Équipe", module: "equipe", icone: "👥" },
  { href: "/analyse", label: "Analyse de données", module: "analyse", icone: "📈" },
  { href: "/utilisateurs", label: "Utilisateurs", module: "utilisateurs", icone: "🔐" },
  { href: "/parametres", label: "Paramètres", module: "parametres", icone: "⚙️" },
];

export function Sidebar({ categorie }: { categorie: Categorie }) {
  const pathname = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const liensAutorises = LIENS.filter((l) => peutLire(categorie, l.module));

  // Empêche le contenu derrière de défiler quand le tiroir mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = ouvert ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [ouvert]);

  // Ferme automatiquement le tiroir quand on change de page
  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  return (
    <>
      {/* Barre mobile en haut, avec bouton menu */}
      <div className="md:hidden flex items-center justify-between bg-gradient-to-r from-tamak-navy to-[#16294D] text-white px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <Logo className="h-8" />
          <span className="font-bold">TAMAK Transport</span>
        </div>
        <button
          aria-label="Ouvrir le menu"
          onClick={() => setOuvert(true)}
          className="text-2xl leading-none w-10 h-10 flex items-center justify-center -mr-2"
        >
          ☰
        </button>
      </div>

      {/* Fond assombri derrière le tiroir mobile */}
      <div
        onClick={() => setOuvert(false)}
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          ouvert ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panneau de navigation : colonne fixe sur desktop, tiroir glissant sur mobile */}
      <nav
        className={`bg-gradient-to-b from-tamak-navy to-[#152238] text-white w-72 md:w-64
        fixed md:static top-0 left-0 h-full md:h-auto md:min-h-screen md:sticky md:top-0
        z-[100] md:z-30 shadow-xl transition-transform duration-300 ease-out
        ${ouvert ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        overflow-y-auto`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white/95 rounded-xl p-1.5 shadow-sm">
              <Logo className="h-8" />
            </div>
            <div>
              <p className="font-bold text-lg leading-tight">TAMAK Transport</p>
              <p className="text-xs text-white/50">Application de suivi</p>
            </div>
          </div>
          <button
            aria-label="Fermer le menu"
            onClick={() => setOuvert(false)}
            className="md:hidden text-2xl leading-none w-9 h-9 flex items-center justify-center text-white/70"
          >
            ✕
          </button>
        </div>
        <ul className="py-3 px-2">
          {liensAutorises.map((lien) => {
            const actif = pathname.startsWith(lien.href);
            return (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className={`flex items-center gap-3 px-4 py-3.5 md:py-2.5 mb-0.5 text-base md:text-sm rounded-lg transition active:scale-[0.98] ${
                    actif
                      ? "bg-gradient-to-r from-white/15 to-white/5 text-white font-semibold shadow-inner"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-lg md:text-base leading-none">{lien.icone}</span>
                  {lien.label}
                  {actif && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-tamak-gold" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}