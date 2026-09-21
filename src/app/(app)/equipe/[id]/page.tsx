import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Categorie, peutEcrire } from "@/lib/rbac";
import { PhotoUploader } from "@/components/PhotoUploader";

export default async function EmployeDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorie, "equipe");

  const employe = await prisma.employe.findUnique({
    where: { id: params.id },
    include: { vehiculesAffectes: true },
  });

  if (!employe) notFound();

  return (
    <div className="space-y-6">
      <Link href="/equipe" className="text-sm text-tamak-navy underline">← Retour à l'équipe</Link>

      <div className="bg-white rounded-xl border p-6 flex flex-col sm:flex-row gap-6">
        {autorise ? (
          <PhotoUploader photoActuelle={employe.photo} urlApi={`/api/equipe/${employe.id}`} champ="photo" rond label="Photo" />
        ) : employe.photo ? (
          <img src={employe.photo} alt={employe.prenom} className="w-32 h-32 rounded-full object-cover border mx-auto sm:mx-0" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-tamak-navy text-white flex items-center justify-center text-3xl font-semibold mx-auto sm:mx-0">
            {employe.prenom.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-tamak-navy">{employe.prenom} {employe.postNom ?? ""} {employe.nom}</h1>
          <p className="text-gray-600">{employe.role} — {employe.categorie}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
            <p><span className="text-gray-500">Sexe :</span> {employe.sexe}</p>
            <p><span className="text-gray-500">Téléphone :</span> {employe.telephone ?? "—"}</p>
            <p><span className="text-gray-500">E-mail :</span> {employe.email ?? "—"}</p>
            {employe.categorie === "CHAUFFEURS" && (
              <>
                <p><span className="text-gray-500">N° permis :</span> {employe.numeroPermis ?? "—"}</p>
                <p className="col-span-2"><span className="text-gray-500">Catégories de permis :</span> {employe.categoriesPermis ?? "—"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {employe.categorie === "CHAUFFEURS" && (
        <div>
          <h2 className="font-semibold text-tamak-navy mb-2">Permis de conduire</h2>
          {autorise ? (
            <PhotoUploader photoActuelle={employe.photoPermis} urlApi={`/api/equipe/${employe.id}`} champ="photoPermis" tailleMax={600} label="Photo du permis" />
          ) : employe.photoPermis ? (
            <img src={employe.photoPermis} alt="Permis de conduire" className="w-full max-w-md rounded-lg border" />
          ) : (
            <p className="text-sm text-gray-400">Aucune photo de permis enregistrée.</p>
          )}
        </div>
      )}

      {employe.vehiculesAffectes.length > 0 && (
        <div>
          <h2 className="font-semibold text-tamak-navy mb-2">Véhicule(s) habituellement conduit(s)</h2>
          <div className="flex flex-wrap gap-3">
            {employe.vehiculesAffectes.map((v) => (
              <Link key={v.id} href={`/vehicules/${v.id}`} className="bg-white border rounded-xl px-4 py-3 hover:border-tamak-navy transition">
                <p className="font-semibold text-sm">{v.code}</p>
                <p className="text-xs text-gray-500">{v.matricule}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}