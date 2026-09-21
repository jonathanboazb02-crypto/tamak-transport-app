import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default async function AccueilPage() {
  const parametres = await prisma.parametresEntreprise.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const accesRapide = [
    { href: "/dashboard", label: "Tableau de bord", emoji: "📊" },
    { href: "/courses", label: "Suivi des courses", emoji: "🚚" },
    { href: "/carburant", label: "Carburant", emoji: "⛽" },
    { href: "/vehicules", label: "Nos véhicules", emoji: "🚛" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.06)] p-8 text-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-tamak-navy via-tamak-gold to-tamak-navy" />
        <Logo className="h-20 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-tamak-navy">{parametres.nom}</h1>
        <p className="text-gray-600 mt-2">
          Transport de casiers de boissons Bralima vers les distributeurs — Kinshasa, RD. Congo
        </p>

        <div className="mt-4 text-sm text-gray-500 space-y-1">
          <p>{parametres.rccm} — {parametres.idNat} — NIF : {parametres.nif}</p>
          <p>{parametres.adresse}</p>
          <p>{parametres.email}</p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-3">Accès rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accesRapide.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(15,23,42,0.05)] p-5 text-center hover:shadow-[0_4px_16px_rgba(15,23,42,0.12)] hover:-translate-y-0.5 transition-all"
            >
              <span className="text-2xl block mb-2">{a.emoji}</span>
              <p className="font-semibold text-sm text-tamak-navy group-hover:text-tamak-gold transition-colors">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}