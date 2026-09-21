import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnteteFiche } from "@/components/EnteteFiche";
import { AutoPrint } from "@/components/AutoPrint";
import { format } from "date-fns";

export default async function ImprimerAnalysePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [vehicules, tousLesCarburants] = await Promise.all([
    prisma.vehicule.findMany({ include: { carburant: true, courses: true }, orderBy: { code: "asc" } }),
    prisma.carburant.findMany({ orderBy: { dateChargement: "asc" } }),
  ]);

  const comparatif = vehicules.map((v) => {
    const litres = v.carburant.reduce((s, c) => s + c.quantiteLitres, 0);
    const cout = v.carburant.reduce((s, c) => s + c.montantTotal, 0);
    const nbCourses = v.courses.length;
    return { code: v.code, matricule: v.matricule, litres, cout, courses: nbCourses };
  });

  const parMois = new Map<string, { litres: number; cout: number }>();
  for (const c of tousLesCarburants) {
    const cle = format(c.dateChargement, "MM/yyyy");
    const existant = parMois.get(cle) ?? { litres: 0, cout: 0 };
    existant.litres += c.quantiteLitres;
    existant.cout += c.montantTotal;
    parMois.set(cle, existant);
  }
  const evolution = Array.from(parMois.entries());

  return (
    <div className="fiche-imprimable max-w-4xl mx-auto p-8 bg-white text-tamak-dark">
      <AutoPrint />
      <EnteteFiche titre="RAPPORT D'ANALYSE DE DONNÉES" />

      <h2 className="font-bold text-sm mb-2 mt-4">Comparatif par véhicule</h2>
      <table className="w-full text-xs border-collapse mb-6">
        <thead>
          <tr className="bg-tamak-dark text-white">
            <th className="border border-gray-400 px-2 py-2 text-left">Code</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Matricule</th>
            <th className="border border-gray-400 px-2 py-2">Courses réalisées</th>
            <th className="border border-gray-400 px-2 py-2">Litres consommés</th>
            <th className="border border-gray-400 px-2 py-2">Coût total (USD)</th>
            <th className="border border-gray-400 px-2 py-2">Coût moyen/course (USD)</th>
          </tr>
        </thead>
        <tbody>
          {comparatif.map((c) => (
            <tr key={c.code}>
              <td className="border border-gray-400 px-2 py-1.5">{c.code}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.matricule}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center">{c.courses}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{c.litres.toFixed(0)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{c.cout.toFixed(2)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{c.courses > 0 ? (c.cout / c.courses).toFixed(2) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="font-bold text-sm mb-2">Évolution mensuelle du carburant</h2>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-tamak-dark text-white">
            <th className="border border-gray-400 px-2 py-2 text-left">Mois</th>
            <th className="border border-gray-400 px-2 py-2">Litres consommés</th>
            <th className="border border-gray-400 px-2 py-2">Coût total (USD)</th>
          </tr>
        </thead>
        <tbody>
          {evolution.map(([mois, v]) => (
            <tr key={mois}>
              <td className="border border-gray-400 px-2 py-1.5">{mois}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{v.litres.toFixed(0)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{v.cout.toFixed(2)}</td>
            </tr>
          ))}
          {evolution.length === 0 && (
            <tr><td colSpan={3} className="border border-gray-400 px-2 py-6 text-center text-gray-400">Aucune donnée.</td></tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-gray-400 mt-6 no-print">
        Document généré le {format(new Date(), "dd/MM/yyyy à HH:mm")} — TAMAK Transport
      </p>
    </div>
  );
}