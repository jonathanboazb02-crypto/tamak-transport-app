import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { EvolutionCarburantChart } from "@/components/charts/EvolutionCarburantChart";
import { ComparatifVehiculesChart } from "@/components/charts/ComparatifVehiculesChart";
import { format } from "date-fns";
import Link from "next/link";

// Accès déjà filtré par le middleware (section 5 : Analyse de données = Direction uniquement)
export default async function AnalysePage() {
  const [vehicules, tousLesCarburants] = await Promise.all([
    prisma.vehicule.findMany({ include: { carburant: true, courses: true }, orderBy: { code: "asc" } }),
    prisma.carburant.findMany({ orderBy: { dateChargement: "asc" } }),
  ]);

  // Comparatif par véhicule (tableau + graphique) — inclut désormais le revenu et le rendement
  const comparatif = vehicules.map((v) => {
    const litres = v.carburant.reduce((s, c) => s + c.quantiteLitres, 0);
    const coutCarburant = v.carburant.reduce((s, c) => s + c.montantTotal, 0);
    const nbCourses = v.courses.length;
    const revenu = v.courses.reduce((s, c) => s + (c.tarifUsd ?? 0), 0);
    return { vehicule: v.code, litres, cout: coutCarburant, courses: nbCourses, revenu, rendement: revenu - coutCarburant };
  });

  const lignes = comparatif.map((c) => [
    c.vehicule,
    c.courses,
    c.revenu.toFixed(2),
    c.litres.toFixed(0),
    c.cout.toFixed(2),
    c.rendement.toFixed(2),
    c.courses > 0 ? (c.cout / c.courses).toFixed(2) : "—",
  ]);

  // Totaux globaux (dépenses et revenu réellement enregistrés)
  const revenuTotal = comparatif.reduce((s, c) => s + c.revenu, 0);
  const carburantTotal = comparatif.reduce((s, c) => s + c.cout, 0);
  const nombreCoursesTotal = comparatif.reduce((s, c) => s + c.courses, 0);
  const rendementBrutTotal = revenuTotal - carburantTotal;

  // Répartition théorique du revenu, selon la grille de l'étude de marché TAMAK
  const REPARTITION = [
    { rubrique: "Carburant", part: 0.26, note: "Dépend du tarif officiel (par litre)" },
    { rubrique: "Taxes et autres frais du personnel", part: 0.19, note: "Reste fixe" },
    { rubrique: "Pièces de rechange, pneus, amortissement et bénéfice", part: 0.55, note: "Dépend du taux de change (pour 1$ US)" },
  ];

  // Évolution mensuelle du carburant (regroupement par mois)
  const parMois = new Map<string, { litres: number; cout: number }>();
  for (const c of tousLesCarburants) {
    const cle = format(c.dateChargement, "MM/yyyy");
    const existant = parMois.get(cle) ?? { litres: 0, cout: 0 };
    existant.litres += c.quantiteLitres;
    existant.cout += c.montantTotal;
    parMois.set(cle, existant);
  }
  const evolution = Array.from(parMois.entries()).map(([mois, v]) => ({
    mois,
    litres: Number(v.litres.toFixed(0)),
    cout: Number(v.cout.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-tamak-navy">Analyse de données</h1>
        <Link href="/analyse/imprimer" target="_blank" className="text-sm bg-tamak-dark text-white rounded-lg px-3 py-2">
          Exporter en PDF
        </Link>
      </div>
      <p className="text-sm text-gray-500">Comparatif par véhicule — revenus, dépenses carburant et rendement.</p>

      {/* Dépenses et rendement réels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Revenu total (courses)" value={revenuTotal.toFixed(2)} suffix="USD" />
        <StatCard label="Dépense carburant totale" value={carburantTotal.toFixed(2)} suffix="USD" />
        <StatCard label="Courses valorisées" value={nombreCoursesTotal} />
        <StatCard label="Rendement brut (revenu - carburant)" value={rendementBrutTotal.toFixed(2)} suffix="USD" />
      </div>

      <EvolutionCarburantChart donnees={evolution} />
      <ComparatifVehiculesChart donnees={comparatif.map((c) => ({ vehicule: c.vehicule, courses: c.courses, litres: c.litres, cout: c.cout }))} />

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Comparatif par véhicule</h2>
        <DataTable
          colonnes={["Code", "Courses", "Revenu (USD)", "Litres consommés", "Dépense carburant (USD)", "Rendement (USD)", "Coût moyen/course (USD)"]}
          lignes={lignes}
        />
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Répartition théorique du revenu (grille TAMAK)</h2>
        <p className="text-xs text-gray-500 mb-2">
          Appliquée au revenu total réellement enregistré ci-dessus ({revenuTotal.toFixed(2)} USD).
        </p>
        <DataTable
          colonnes={["Rubrique", "Part", "Montant estimé (USD)", "Remarque"]}
          lignes={REPARTITION.map((r) => [
            r.rubrique,
            `${(r.part * 100).toFixed(0)}%`,
            (revenuTotal * r.part).toFixed(2),
            r.note,
          ])}
        />
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Repères de l'étude de marché (prévisionnel)</h2>
        <p className="text-xs text-gray-500 mb-2">
          Chiffres de référence issus de l'étude de marché TAMAK, pour comparaison avec les résultats réels ci-dessus — objectif de 2 véhicules, 100 courses/mois.
        </p>
        <DataTable
          colonnes={["Indicateur", "Valeur de référence"]}
          lignes={[
            ["Consommation estimée par course", "25 L"],
            ["Consommation estimée par véhicule / mois", "1 250 L"],
            ["Chiffre d'affaires prévisionnel (100 courses/mois)", "14 583 USD"],
            ["Carburant prévisionnel", "3 250 USD"],
            ["Salaire prévisionnel", "2 500 USD"],
            ["Taxe prévisionnelle", "2 917 USD"],
            ["Bénéfice prévisionnel", "-583 USD"],
          ]}
        />
      </div>
    </div>
  );
}