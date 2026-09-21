import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { AjoutCourseForm } from "./AjoutCourseForm";
import { CourseActions } from "./CourseActions";
import { Categorie, peutEcrire } from "@/lib/rbac";
import { format } from "date-fns";
import Link from "next/link";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorie, "courses");

  const [courses, vehicules, chauffeurs] = await Promise.all([
    prisma.course.findMany({ include: { chauffeur: true, vehicule: true }, orderBy: { date: "desc" }, take: 100 }),
    prisma.vehicule.findMany({ orderBy: { code: "asc" } }),
    prisma.employe.findMany({ where: { categorie: "CHAUFFEURS" }, orderBy: { nom: "asc" } }),
  ]);

  const optionsVehicules = vehicules.map((v) => ({ id: v.id, label: `${v.code} — ${v.matricule}`, chauffeurHabituelId: v.chauffeurHabituelId ?? "" }));
  const optionsChauffeurs = chauffeurs.map((c) => ({ id: c.id, label: `${c.prenom} ${c.nom}` }));

  const lignes = courses.map((c) => [
    c.codeCourse,
    c.description,
    format(c.date, "dd/MM/yyyy"),
    c.heure,
    c.statutChargement,
    `${c.chauffeur.prenom} ${c.chauffeur.nom}`,
    c.vehicule.code,
    c.tarifCdf ? c.tarifCdf.toLocaleString("fr-FR") : "—",
    c.tarifUsd ? c.tarifUsd.toFixed(2) : "—",
    c.signatureSuperviseur ? "Signée" : "En attente",
    autorise ? (
      <CourseActions
        key={c.id}
        course={{
          id: c.id,
          codeCourse: c.codeCourse,
          description: c.description,
          tarifCdf: c.tarifCdf ? String(c.tarifCdf) : "",
          tarifUsd: c.tarifUsd ? String(c.tarifUsd) : "",
          date: format(c.date, "yyyy-MM-dd"),
          heure: c.heure,
          statutChargement: c.statutChargement,
          vehiculeId: c.vehiculeId,
          chauffeurId: c.chauffeurId,
          signatureSuperviseur: c.signatureSuperviseur,
        }}
        vehicules={optionsVehicules}
        chauffeurs={optionsChauffeurs}
      />
    ) : "",
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-tamak-navy">Suivi des courses</h1>
        <Link href="/courses/imprimer" target="_blank" className="text-sm bg-tamak-dark text-white rounded-lg px-3 py-2">
          Exporter en PDF
        </Link>
      </div>
      <AjoutCourseForm
        peutEcrire={autorise}
        vehicules={optionsVehicules}
        chauffeurs={optionsChauffeurs}
      />
      <DataTable
        colonnes={["Code course", "Description", "Date", "Heure", "Vide/Plein", "Chauffeur", "Véhicule", "Tarif (CDF)", "Tarif (USD)", "Signature", "Action"]}
        lignes={lignes}
      />
    </div>
  );
}