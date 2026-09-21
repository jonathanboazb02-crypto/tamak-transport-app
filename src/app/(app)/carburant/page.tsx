import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { AjoutCarburantForm } from "./AjoutCarburantForm";
import { CarburantActions } from "./CarburantActions";
import { Categorie, peutEcrire } from "@/lib/rbac";
import { format } from "date-fns";
import Link from "next/link";

export default async function CarburantPage({ searchParams }: { searchParams: { vehiculeId?: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorie, "carburant");

  const vehicules = await prisma.vehicule.findMany({ orderBy: { code: "asc" } });
  const enregistrements = await prisma.carburant.findMany({
    where: searchParams.vehiculeId ? { vehiculeId: searchParams.vehiculeId } : undefined,
    include: { vehicule: true, chauffeur: true },
    orderBy: { dateChargement: "desc" },
  });

  const optionsVehicules = vehicules.map((v) => ({ id: v.id, label: `${v.code} — ${v.matricule}` }));

  const totalLitres = enregistrements.reduce((s, e) => s + e.quantiteLitres, 0);
  const totalCout = enregistrements.reduce((s, e) => s + e.montantTotal, 0);
  const totalCourses = enregistrements.reduce((s, e) => s + e.nombreCourses, 0);
  const prixMoyen = totalLitres > 0 ? totalCout / totalLitres : 0;
  const consoMoyenneParCourse = totalCourses > 0 ? totalLitres / totalCourses : 0;
  const coutMoyenParCourse = totalCourses > 0 ? totalCout / totalCourses : 0;

  const lignes = enregistrements.map((e) => [
    e.vehicule.code,
    format(e.dateChargement, "dd/MM/yyyy"),
    e.dateFin ? format(e.dateFin, "dd/MM/yyyy") : "—",
    e.quantiteLitres.toFixed(1),
    e.prixLitre.toFixed(2),
    e.montantTotal.toFixed(2),
    e.nombreCourses,
    e.observations ?? "—",
    autorise ? (
      <CarburantActions
        key={e.id}
        enregistrement={{
          id: e.id,
          vehiculeId: e.vehiculeId,
          dateChargement: format(e.dateChargement, "yyyy-MM-dd"),
          dateFin: e.dateFin ? format(e.dateFin, "yyyy-MM-dd") : "",
          quantiteLitres: e.quantiteLitres,
          prixLitre: e.prixLitre,
          nombreCourses: e.nombreCourses,
          observations: e.observations ?? "",
        }}
        vehicules={optionsVehicules}
      />
    ) : "",
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-tamak-navy">Consommation de carburant</h1>
        <Link
          href={`/carburant/imprimer${searchParams.vehiculeId ? `?vehiculeId=${searchParams.vehiculeId}` : ""}`}
          target="_blank"
          className="text-sm bg-tamak-dark text-white rounded-lg px-3 py-2"
        >
          Exporter en PDF
        </Link>
      </div>

      <form className="flex items-center gap-2" method="get">
        <label className="text-sm text-gray-500">Filtrer par véhicule :</label>
        <select name="vehiculeId" defaultValue={searchParams.vehiculeId ?? ""} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tous les véhicules</option>
          {vehicules.map((v) => <option key={v.id} value={v.id}>{v.code} — {v.matricule}</option>)}
        </select>
        <button type="submit" className="text-sm bg-tamak-navy text-white rounded-lg px-3 py-2">Filtrer</button>
      </form>

      <AjoutCarburantForm peutEcrire={autorise} vehicules={optionsVehicules} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total consommé" value={totalLitres.toFixed(0)} suffix="L" />
        <StatCard label="Coût total" value={totalCout.toFixed(2)} suffix="USD" />
        <StatCard label="Prix moyen / litre" value={prixMoyen.toFixed(2)} suffix="USD" />
        <StatCard label="Nombre total de courses" value={totalCourses} />
        <StatCard label="Consommation moy. / course" value={consoMoyenneParCourse.toFixed(1)} suffix="L" />
        <StatCard label="Coût moyen / course" value={coutMoyenParCourse.toFixed(2)} suffix="USD" />
      </div>

      <DataTable
        colonnes={["Véhicule", "Date chargement", "Date fin", "Litres", "Prix/L", "Montant total", "Courses", "Observations", "Action"]}
        lignes={lignes}
      />
    </div>
  );
}