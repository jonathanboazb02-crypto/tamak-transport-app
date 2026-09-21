import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EnteteFiche } from "@/components/EnteteFiche";
import { AutoPrint } from "@/components/AutoPrint";
import { format } from "date-fns";

export default async function ImprimerCoursesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const courses = await prisma.course.findMany({
    include: { chauffeur: true, vehicule: true },
    orderBy: { date: "desc" },
    take: 200,
  });

  return (
    <div className="fiche-imprimable max-w-5xl mx-auto p-8 bg-white text-tamak-dark">
      <AutoPrint />
      <EnteteFiche titre="FICHE DES COURSES" />

      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-tamak-dark text-white">
            <th className="border border-gray-400 px-2 py-2 text-left">Code course</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Description</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Date</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Heure</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Vide / Plein</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Chauffeur</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Véhicule</th>
            <th className="border border-gray-400 px-2 py-2 text-left">Signature superviseur</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id}>
              <td className="border border-gray-400 px-2 py-1.5">{c.codeCourse}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.description}</td>
              <td className="border border-gray-400 px-2 py-1.5">{format(c.date, "dd/MM/yyyy")}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.heure}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.statutChargement}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.chauffeur.prenom} {c.chauffeur.nom}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.vehicule.code}</td>
              <td className="border border-gray-400 px-2 py-1.5">{c.signatureSuperviseur ? "Signée" : ""}</td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan={8} className="border border-gray-400 px-2 py-6 text-center text-gray-400">
                Aucune course enregistrée.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <p className="text-xs text-gray-400 mt-6 no-print">
        Document généré le {format(new Date(), "dd/MM/yyyy à HH:mm")} — TAMAK Transport
      </p>
    </div>
  );
}