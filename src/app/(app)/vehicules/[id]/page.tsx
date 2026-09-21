import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Categorie, peutEcrire } from "@/lib/rbac";
import { PhotoUploader } from "@/components/PhotoUploader";

export default async function VehiculeDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const categorie = (session?.user?.categorie ?? "CHAUFFEURS") as Categorie;
  const autorise = peutEcrire(categorie, "vehicules");
  const autoriseEquipe = peutEcrire(categorie, "equipe");

  const vehicule = await prisma.vehicule.findUnique({
    where: { id: params.id },
    include: { chauffeurHabituel: true },
  });

  if (!vehicule) notFound();

  const chauffeur = vehicule.chauffeurHabituel;

  return (
    <div className="space-y-6">
      <Link href="/vehicules" className="text-sm text-tamak-navy underline">← Retour aux véhicules</Link>

      <div className="bg-white rounded-xl border p-6 flex flex-col sm:flex-row gap-6">
        {autorise ? (
          <PhotoUploader photoActuelle={vehicule.photo} urlApi={`/api/vehicules/${vehicule.id}`} champ="photo" tailleMax={600} label="Photo du véhicule" />
        ) : vehicule.photo ? (
          <img src={vehicule.photo} alt={vehicule.code} className="w-full sm:w-56 h-40 object-cover rounded-lg border" />
        ) : (
          <div className="w-full sm:w-56 h-40 bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400 text-sm">
            Pas de photo
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-tamak-navy">{vehicule.code}</h1>
          <p className="text-gray-600">{vehicule.marque} {vehicule.modele}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
            <p><span className="text-gray-500">Matricule :</span> {vehicule.matricule}</p>
            <p><span className="text-gray-500">Statut :</span> {vehicule.statut}</p>
            <p><span className="text-gray-500">Capacité :</span> {vehicule.capacite ?? "—"} casiers</p>
            <p><span className="text-gray-500">Traceur GPS :</span> {vehicule.gpsTerminalId ?? "Non relié"}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-tamak-navy mb-3">Chauffeur habituel</h2>
        {!chauffeur ? (
          <p className="text-sm text-gray-500 bg-white border rounded-xl p-5">
            Aucun chauffeur habituel n'est assigné à ce véhicule. Tu peux en choisir un depuis le bouton « Modifier » sur la liste des véhicules.
          </p>
        ) : (
          <div className="bg-white rounded-xl border p-6 flex flex-col sm:flex-row gap-6">
            {autoriseEquipe ? (
              <PhotoUploader photoActuelle={chauffeur.photo} urlApi={`/api/equipe/${chauffeur.id}`} champ="photo" rond label="Photo" />
            ) : chauffeur.photo ? (
              <img src={chauffeur.photo} alt={chauffeur.prenom} className="w-28 h-28 rounded-full object-cover border mx-auto sm:mx-0" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-tamak-navy text-white flex items-center justify-center text-2xl font-semibold mx-auto sm:mx-0">
                {chauffeur.prenom.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <Link href={`/equipe/${chauffeur.id}`} className="text-lg font-bold text-tamak-navy hover:underline">
                {chauffeur.prenom} {chauffeur.postNom ?? ""} {chauffeur.nom}
              </Link>
              <p className="text-gray-600 text-sm">{chauffeur.role}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                <p><span className="text-gray-500">Téléphone :</span> {chauffeur.telephone ?? "—"}</p>
                <p><span className="text-gray-500">E-mail :</span> {chauffeur.email ?? "—"}</p>
                <p><span className="text-gray-500">N° permis :</span> {chauffeur.numeroPermis ?? "—"}</p>
                <p><span className="text-gray-500">Catégories :</span> {chauffeur.categoriesPermis ?? "—"}</p>
              </div>
            </div>
            {autoriseEquipe ? (
              <PhotoUploader photoActuelle={chauffeur.photoPermis} urlApi={`/api/equipe/${chauffeur.id}`} champ="photoPermis" tailleMax={600} label="Photo du permis" />
            ) : chauffeur.photoPermis ? (
              <div>
                <p className="text-xs text-gray-500 mb-1">Permis de conduire</p>
                <img src={chauffeur.photoPermis} alt="Permis de conduire" className="w-56 rounded-lg border" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}