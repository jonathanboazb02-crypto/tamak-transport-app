import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { AjoutVehiculeForm } from "./AjoutVehiculeForm";
import { AssocierGpsForm } from "./AssocierGpsForm";
import { SupprimerVehiculeButton } from "./SupprimerVehiculeButton";
import { ModifierVehiculeButton } from "./ModifierVehiculeButton";
import { Categorie, peutEcrire } from "@/lib/rbac";
import Link from "next/link";

export default async function VehiculesPage() {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorie, "vehicules");

  const [vehicules, chauffeurs] = await Promise.all([
    prisma.vehicule.findMany({ include: { chauffeurHabituel: true }, orderBy: { code: "asc" } }),
    prisma.employe.findMany({ where: { categorie: "CHAUFFEURS" }, orderBy: { nom: "asc" } }),
  ]);

  const optionsChauffeurs = chauffeurs.map((c) => ({ id: c.id, label: `${c.prenom} ${c.nom}` }));

  const lignes = vehicules.map((v) => [
    <Link key={`lien-${v.id}`} href={`/vehicules/${v.id}`} className="text-tamak-navy font-semibold hover:underline">
      {v.code}
    </Link>,
    v.matricule,
    `${v.marque ?? "—"} ${v.modele ?? ""}`.trim(),
    v.capacite ?? "—",
    v.statut,
    v.chauffeurHabituel ? (
      <Link key={`chauffeur-${v.id}`} href={`/equipe/${v.chauffeurHabituel.id}`} className="text-tamak-navy hover:underline">
        {v.chauffeurHabituel.prenom} {v.chauffeurHabituel.nom}
      </Link>
    ) : "—",
    autorise
      ? <AssocierGpsForm key={`gps-${v.id}`} vehiculeId={v.id} gpsTerminalIdActuel={v.gpsTerminalId} />
      : (v.gpsTerminalId ? "Relié" : "—"),
    autorise ? (
      <div key={`actions-${v.id}`} className="flex gap-2">
        <ModifierVehiculeButton
          vehicule={{
            id: v.id,
            matricule: v.matricule,
            code: v.code,
            marque: v.marque ?? "",
            modele: v.modele ?? "",
            capacite: v.capacite ? String(v.capacite) : "",
            statut: v.statut,
            chauffeurHabituelId: v.chauffeurHabituelId ?? "",
            photo: v.photo ?? "",
          }}
          chauffeurs={optionsChauffeurs}
        />
        <SupprimerVehiculeButton id={v.id} code={v.code} />
      </div>
    ) : "",
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-tamak-navy">Nos véhicules</h1>
      <AjoutVehiculeForm peutEcrire={autorise} />
      <DataTable
        colonnes={["Code", "Matricule", "Marque / Modèle", "Capacité", "Statut", "Chauffeur habituel", "Traceur GPS Navixy", "Action"]}
        lignes={lignes}
      />
    </div>
  );
}