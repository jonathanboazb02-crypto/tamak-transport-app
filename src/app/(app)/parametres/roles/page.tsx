import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { peutEcrire, Categorie } from "@/lib/rbac";
import { GestionRoles } from "./GestionRoles";
import Link from "next/link";

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  if (!peutEcrire(categorie, "parametres")) redirect("/parametres");

  const roles = await prisma.role.findMany({ orderBy: [{ categorie: "asc" }, { nom: "asc" }] });

  return (
    <div className="space-y-4">
      <Link href="/parametres" className="text-sm text-tamak-navy underline">← Retour aux paramètres</Link>
      <h1 className="text-2xl font-bold text-tamak-navy">Rôles</h1>
      <p className="text-sm text-gray-500">
        Ces intitulés apparaissent dans les listes déroulantes du module Équipe. Renommer ou supprimer un rôle ici
        ne change pas le rôle des personnes qui l'ont déjà — seulement les nouveaux choix proposés.
      </p>
      <GestionRoles roles={roles} />
    </div>
  );
}