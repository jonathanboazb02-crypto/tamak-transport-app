import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { StatCard } from "@/components/StatCard";
import { StatCardDevise } from "@/components/StatCardDevise";
import { MontantDevise } from "@/components/MontantDevise";
import { EvolutionCarburantChart } from "@/components/charts/EvolutionCarburantChart";
import { ComparatifVehiculesChart } from "@/components/charts/ComparatifVehiculesChart";
import { SelecteurPeriode } from "./SelecteurPeriode";
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import Link from "next/link";

type Recherche = { periode?: string; debut?: string; fin?: string };

function calculerPlage(recherche: Recherche) {
  const maintenant = new Date();
  const periode = recherche.periode || "month";

  if (periode === "today") {
    return { debut: startOfDay(maintenant), fin: endOfDay(maintenant), label: "Aujourd'hui" };
  }
  if (periode === "7days") {
    return { debut: startOfDay(subDays(maintenant, 6)), fin: endOfDay(maintenant), label: "7 derniers jours" };
  }
  if (periode === "week") {
    return {
      debut: startOfWeek(maintenant, { weekStartsOn: 1 }),
      fin: endOfWeek(maintenant, { weekStartsOn: 1 }),
      label: "Cette semaine",
    };
  }
  if (periode === "month") {
    return { debut: startOfMonth(maintenant), fin: endOfMonth(maintenant), label: "Ce mois" };
  }
  if (periode === "custom" && recherche.debut && recherche.fin) {
    const d = parseISO(recherche.debut);
    const f = parseISO(recherche.fin);
    if (isValid(d) && isValid(f)) {
      return { debut: startOfDay(d), fin: endOfDay(f), label: `${format(d, "dd/MM/yyyy")} → ${format(f, "dd/MM/yyyy")}` };
    }
  }
  // "all" ou repli par défaut : aucune borne
  return { debut: new Date(2000, 0, 1), fin: endOfDay(maintenant), label: "Toute la période" };
}

export default async function AnalysePage({ searchParams }: { searchParams: Recherche }) {
  const periodeActuelle = searchParams.periode || "month";
  const { debut, fin, label } = calculerPlage(searchParams);

  const [vehicules, tousLesCarburants] = await Promise.all([
    prisma.vehicule.findMany({
      include: {
        carburant: { where: { dateChargement: { gte: debut, lte: fin } } },
        courses: { where: { date: { gte: debut, lte: fin } } },
      },
      orderBy: { code: "asc" },
    }),
    prisma.carburant.findMany({
      where: { dateChargement: { gte: debut, lte: fin } },
      orderBy: { dateChargement: "asc" },
    }),
  ]);

  // Comparatif par véhicule (tableau + graphique) — sur la période sélectionnée
  const comparatif = vehicules.map((v) => {
    const litres = v.carburant.reduce((s, c) => s + c.quantiteLitres, 0);
    const coutCarburant = v.carburant.reduce((s, c) => s + c.montantTotal, 0);
    const nbCourses = v.courses.length;
    const revenu = v.courses.reduce((s, c) => s + (c.tarifUsd ?? 0), 0);
    return { vehicule: v.code, litres, cout: coutCarburant, courses: nbCourses, revenu, rendement: revenu - coutCarburant };
  });

  const lignes = comparatif.map((c, i) => [
    c.vehicule,
    c.courses,
    <MontantDevise key={`revenu-${i}`} valeurUsd={c.revenu} />,
    c.litres.toFixed(0),
    <MontantDevise key={`cout-${i}`} valeurUsd={c.cout} />,
    <MontantDevise key={`rendement-${i}`} valeurUsd={c.rendement} />,
    c.courses > 0 ? <MontantDevise key={`moy-${i}`} valeurUsd={c.cout / c.courses} /> : "—",
  ]);

  // Totaux globaux sur la période
  const revenuTotal = comparatif.reduce((s, c) => s + c.revenu, 0);
  const carburantTotal = comparatif.reduce((s, c) => s + c.cout, 0);
  const nombreCoursesTotal = comparatif.reduce((s, c) => s + c.courses, 0);
  const rendementBrutTotal = revenuTotal - carburantTotal;
  const pertes = rendementBrutTotal < 0 ? Math.abs(rendementBrutTotal) : 0;

  // Répartition théorique du revenu, selon la grille de l'étude de marché TAMAK
  const REPARTITION = [
    { rubrique: "Carburant", part: 0.26, note: "Dépend du tarif officiel (par litre)" },
    { rubrique: "Taxes et autres frais du personnel", part: 0.19, note: "Reste fixe" },
    { rubrique: "Pièces de rechange, pneus, amortissement et bénéfice", part: 0.55, note: "Dépend du taux de change (pour 1$ US)" },
  ];

  // Évolution mensuelle du carburant (toujours sur l'historique complet, pour garder la tendance)
  const tousLesCarburantsHistorique = await prisma.carburant.findMany({ orderBy: { dateChargement: "asc" } });
  const parMois = new Map<string, { litres: number; cout: number }>();
  for (const c of tousLesCarburantsHistorique) {
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

      <SelecteurPeriode periode={periodeActuelle} debut={searchParams.debut} fin={searchParams.fin} />
      <p className="text-sm text-gray-500">
        Période affichée : <span className="font-semibold text-tamak-navy">{label}</span>
      </p>

      {/* Dépenses et rendement sur la période */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCardDevise label="Revenu (courses)" valeurUsd={revenuTotal} />
        <StatCardDevise label="Dépense carburant" valeurUsd={carburantTotal} />
        <StatCard label="Courses valorisées" value={nombreCoursesTotal} />
        <StatCardDevise
          label={rendementBrutTotal < 0 ? "Perte nette" : "Rendement brut"}
          valeurUsd={rendementBrutTotal < 0 ? pertes : rendementBrutTotal}
        />
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Comparatif par véhicule — {label}</h2>
        {vehicules.length === 0 || nombreCoursesTotal + carburantTotal === 0 ? (
          <p className="text-sm text-gray-400 bg-white border rounded-xl p-5">Aucune donnée sur cette période.</p>
        ) : (
          <>
            <ComparatifVehiculesChart donnees={comparatif.map((c) => ({ vehicule: c.vehicule, courses: c.courses, litres: c.litres, cout: c.cout }))} />
            <div className="mt-3">
              <DataTable
                colonnes={["Code", "Courses", "Revenu (USD)", "Litres consommés", "Dépense carburant (USD)", "Rendement (USD)", "Coût moyen/course (USD)"]}
                lignes={lignes}
              />
            </div>
          </>
        )}
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Évolution mensuelle du carburant (historique complet)</h2>
        <EvolutionCarburantChart donnees={evolution} />
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Répartition théorique du revenu (grille TAMAK)</h2>
        <p className="text-xs text-gray-500 mb-2">
          Appliquée au revenu de la période sélectionnée (<MontantDevise valeurUsd={revenuTotal} />).
        </p>
        <DataTable
          colonnes={["Rubrique", "Part", "Montant estimé", "Remarque"]}
          lignes={REPARTITION.map((r, i) => [
            r.rubrique,
            `${(r.part * 100).toFixed(0)}%`,
            <MontantDevise key={`repartition-${i}`} valeurUsd={revenuTotal * r.part} />,
            r.note,
          ])}
        />
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-2">Repères de l'étude de marché (prévisionnel)</h2>
        <p className="text-xs text-gray-500 mb-2">
          Chiffres de référence issus de l'étude de marché TAMAK — objectif de 2 véhicules, 100 courses/mois.
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