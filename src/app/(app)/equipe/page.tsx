import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { AjoutEmployeForm } from "./AjoutEmployeForm";
import { EmployeActions } from "./EmployeActions";
import { Categorie, peutEcrire } from "@/lib/rbac";
import Link from "next/link";

const LIBELLES: Record<string, string> = {
  DIRECTION: "Équipe de direction",
  GESTION: "Équipe des gérants",
  CHAUFFEURS: "Chauffeurs",
  TECHNICIENS: "Techniciens",
};

function Avatar({ photo, prenom }: { photo: string | null; prenom: string }) {
  if (photo) {
    return <img src={photo} alt={prenom} className="w-10 h-10 rounded-full object-cover" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-tamak-navy text-white flex items-center justify-center text-sm font-semibold">
      {prenom.charAt(0).toUpperCase()}
    </div>
  );
}

export default async function EquipePage() {
  const session = await getServerSession(authOptions);
  const categorieUtilisateur = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorieUtilisateur, "equipe");

  const [employes, roles] = await Promise.all([
    prisma.employe.findMany({ orderBy: [{ categorie: "asc" }, { nom: "asc" }] }),
    prisma.role.findMany({ orderBy: { nom: "asc" } }),
  ]);
  const groupes = ["DIRECTION", "GESTION", "CHAUFFEURS", "TECHNICIENS"] as const;

  const rolesParCategorie: Record<string, string[]> = { DIRECTION: [], GESTION: [], CHAUFFEURS: [], TECHNICIENS: [] };
  for (const r of roles) rolesParCategorie[r.categorie]?.push(r.nom);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-tamak-navy">Équipe</h1>
      <AjoutEmployeForm peutEcrire={autorise} rolesParCategorie={rolesParCategorie} />

      {groupes.map((groupe) => {
        const membres = employes.filter((e) => e.categorie === groupe);
        return (
          <div key={groupe}>
            <h2 className="font-semibold text-tamak-navy mb-2">{LIBELLES[groupe]}</h2>
            <DataTable
              colonnes={["Photo", "Nom complet", "Sexe", "Rôle", "E-mail", "Téléphone", "Action"]}
              lignes={membres.map((m) => [
                <Avatar key={`avatar-${m.id}`} photo={m.photo} prenom={m.prenom} />,
                <Link key={`lien-${m.id}`} href={`/equipe/${m.id}`} className="text-tamak-navy font-semibold hover:underline">
                  {`${m.prenom} ${m.postNom ?? ""} ${m.nom}`.replace(/\s+/g, " ").trim()}
                </Link>,
                m.sexe,
                m.role,
                m.email ?? "—",
                m.telephone ?? "—",
                autorise ? (
                  <EmployeActions
                    key={m.id}
                    rolesParCategorie={rolesParCategorie}
                    employe={{
                      id: m.id,
                      nom: m.nom,
                      postNom: m.postNom ?? "",
                      prenom: m.prenom,
                      sexe: m.sexe,
                      role: m.role,
                      categorie: m.categorie,
                      email: m.email ?? "",
                      telephone: m.telephone ?? "",
                      photo: m.photo ?? "",
                      numeroPermis: m.numeroPermis ?? "",
                      categoriesPermis: m.categoriesPermis ?? "",
                      photoPermis: m.photoPermis ?? "",
                    }}
                  />
                ) : "",
              ])}
            />
          </div>
        );
      })}
    </div>
  );
}