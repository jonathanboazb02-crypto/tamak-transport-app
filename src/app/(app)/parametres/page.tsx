import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ParametresForm } from "./ParametresForm";
import { Categorie, peutEcrire } from "@/lib/rbac";
import Link from "next/link";

export default async function ParametresPage() {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;

  const parametres = await prisma.parametresEntreprise.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-tamak-navy">Paramètres</h1>

      {peutEcrire(categorie, "parametres") ? (
        <ParametresForm parametres={parametres} />
      ) : (
        <div className="bg-white rounded-xl border p-5 text-sm text-gray-500">
          Seule la Direction peut modifier les paramètres de l'entreprise.
          <p className="mt-2">
            <b>{parametres.nom}</b> — {parametres.adresse} — {parametres.email}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-1">Rôles</h2>
        <p className="text-sm text-gray-500 mb-2">
          Gère la liste des intitulés de rôles proposés dans le module Équipe, par catégorie.
        </p>
        {peutEcrire(categorie, "parametres") ? (
          <Link href="/parametres/roles" className="text-sm bg-tamak-navy text-white rounded-lg px-4 py-2 inline-block">
            Gérer les rôles
          </Link>
        ) : (
          <p className="text-xs text-gray-400">Réservé à la Direction.</p>
        )}
      </div>

    </div>
  );
}