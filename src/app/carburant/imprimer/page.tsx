import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnteteFiche } from "@/components/EnteteFiche";
import { AutoPrint } from "@/components/AutoPrint";
import { format } from "date-fns";

export default async function ImprimerCarburantPage({ searchParams }: { searchParams: { vehiculeId?: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const vehicule = searchParams.vehiculeId
    ? await prisma.vehicule.findUnique({ where: { id: searchParams.vehiculeId } })
    : null;

  const enregistrements = await prisma.carburant.findMany({
    where: searchParams.vehiculeId ? { vehiculeId: searchParams.vehiculeId } : undefined,
    include: { vehicule: true, chauffeur: true },
    orderBy: { dateChargement: "asc" },
  });

  const totalLitres = enregistrements.reduce((s, e) => s + e.quantiteLitres, 0);
  const totalCout = enregistrements.reduce((s, e) => s + e.montantTotal, 0);
  const totalCourses = enregistrements.reduce((s, e) => s + e.nombreCourses, 0);
  const prixMoyen = totalLitres > 0 ? totalCout / totalLitres : 0;
  const consoMoyenneParCourse = totalCourses > 0 ? totalLitres / totalCourses : 0;
  const coutMoyenParCourse = totalCourses > 0 ? totalCout / totalCourses : 0;

  return (
    <div className="fiche-imprimable max-w-5xl mx-auto p-8 bg-white text-tamak-dark">
      <AutoPrint />
      <EnteteFiche titre="FICHE DE SUIVI ET DE CONSOMMATION DE CARBURANT" />

      <div className="grid grid-cols-2 gap-4 text-xs mb-4 border border-gray-400">
        <div className="border-b sm:border-b-0 sm:border-r border-gray-400 p-2">
          <span className="font-bold">SOCIÉTÉ : </span>Établissement TAMAK
        </div>
        <div className="p-2"><span className="font-bold">N° DE FICHE : </span>—</div>
        <div className="border-t border-gray-400 sm:border-r p-2">
          <span className="font-bold">VÉHICULE / IMMATRICULATION : </span>
          {vehicule ? `${vehicule.code} — ${vehicule.matricule}` : "Tous véhicules"}
        </div>
        <div className="border-t border-gray-400 p-2">
          <span className="font-bold">CHAUFFEUR : </span>
          {vehicule?.chauffeurHabituelId ?? "—"}
        </div>
      </div>

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-tamak-dark text-white">
            <th className="border border-gray-400 px-2 py-2">N°</th>
            <th className="border border-gray-400 px-2 py-2">Véhicule</th>
            <th className="border border-gray-400 px-2 py-2">Date chargement</th>
            <th className="border border-gray-400 px-2 py-2">Date fin</th>
            <th className="border border-gray-400 px-2 py-2">Quantité (litres)</th>
            <th className="border border-gray-400 px-2 py-2">Prix / litre</th>
            <th className="border border-gray-400 px-2 py-2">Montant total</th>
            <th className="border border-gray-400 px-2 py-2">Nombre de courses</th>
            <th className="border border-gray-400 px-2 py-2">Observations</th>
          </tr>
        </thead>
        <tbody>
          {enregistrements.map((e, i) => (
            <tr key={e.id}>
              <td className="border border-gray-400 px-2 py-1.5 text-center">{String(i + 1).padStart(2, "0")}</td>
              <td className="border border-gray-400 px-2 py-1.5">{e.vehicule.code}</td>
              <td className="border border-gray-400 px-2 py-1.5">{format(e.dateChargement, "dd/MM/yyyy")}</td>
              <td className="border border-gray-400 px-2 py-1.5">{e.dateFin ? format(e.dateFin, "dd/MM/yyyy") : ""}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{e.quantiteLitres.toFixed(1)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{e.prixLitre.toFixed(2)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{e.montantTotal.toFixed(2)}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-center">{e.nombreCourses}</td>
              <td className="border border-gray-400 px-2 py-1.5">{e.observations ?? ""}</td>
            </tr>
          ))}
          {enregistrements.length === 0 && (
            <tr>
              <td colSpan={9} className="border border-gray-400 px-2 py-6 text-center text-gray-400">
                Aucun enregistrement.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 border border-gray-400 text-xs">
        <div className="bg-tamak-dark text-white px-2 py-1.5 font-bold">RÉCAPITULATIF</div>
        <div className="grid grid-cols-2">
          <div className="border-t border-r border-gray-400 px-2 py-1.5">Total carburant consommé : <b>{totalLitres.toFixed(1)} litres</b></div>
          <div className="border-t border-gray-400 px-2 py-1.5">Nombre total de courses : <b>{totalCourses}</b></div>
          <div className="border-t border-r border-gray-400 px-2 py-1.5">Coût total carburant : <b>{totalCout.toFixed(2)} USD</b></div>
          <div className="border-t border-gray-400 px-2 py-1.5">Consommation moyenne/course : <b>{consoMoyenneParCourse.toFixed(2)} L/course</b></div>
          <div className="border-t border-r border-gray-400 px-2 py-1.5">Prix moyen du litre : <b>{prixMoyen.toFixed(2)} USD</b></div>
          <div className="border-t border-gray-400 px-2 py-1.5">Coût moyen par course : <b>{coutMoyenParCourse.toFixed(2)} USD</b></div>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-6 no-print">
        Document généré le {format(new Date(), "dd/MM/yyyy à HH:mm")} — TAMAK Transport
      </p>
    </div>
  );
}