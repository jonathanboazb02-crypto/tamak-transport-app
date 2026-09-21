// Script à exécuter UNE SEULE FOIS : npx tsx prisma/seed-reel.ts
//
// - Supprime les véhicules de démo (s'ils n'ont pas de courses/carburant liés)
// - Crée les 3 vrais chauffeurs (fiche "IDENTIFICATIONS ATTRIBUTION DES CHAUFFEURS")
// - Crée les 3 vrais véhicules (DAF BLANC, DAF ROUGE, VOLVO GRIS)
// - Relie automatiquement chaque véhicule à son traceur Navixy, en cherchant
//   par libellé (TAM_9812 BB01, TAM_5383 AL 01, TAM_3163 BC 01)

import { PrismaClient } from "@prisma/client";
import { listerTraceurs } from "../src/lib/navixy";

const prisma = new PrismaClient();

const CHAUFFEURS = [
  { nom: "Reagan", prenom: "Kiendo", telephone: "+243 906 309 829" },
  { nom: "Espoir", prenom: "Buenie", telephone: "+243 897 705 686" },
  { nom: "Matondo", prenom: "Ngenga Gaby", telephone: "+243 970 427 136" },
];

const VEHICULES = [
  { matricule: "9812 BB 01", code: "DAF-BLANC", marque: "DAF", labelGps: "TAM_9812 BB01", chauffeurTel: "+243 906 309 829" },
  { matricule: "5383 AL 01", code: "DAF-ROUGE", marque: "DAF", labelGps: "TAM_5383 AL 01", chauffeurTel: "+243 897 705 686" },
  { matricule: "3163 BC 01", code: "VOLVO-GRIS", marque: "Volvo", labelGps: "TAM_3163 BC 01", chauffeurTel: "+243 970 427 136" },
];

async function main() {
  // 1. Supprimer les véhicules de démo (ignore l'erreur si des courses/carburant y sont liés)
  for (const matricule of ["CD-1234-KIN", "CD-5678-KIN"]) {
    try {
      await prisma.vehicule.delete({ where: { matricule } });
      console.log(`Véhicule de démo supprimé : ${matricule}`);
    } catch {
      console.log(`Véhicule de démo ${matricule} non supprimé (introuvable ou données liées) — ignoré.`);
    }
  }

  // 2. Créer les chauffeurs (s'ils n'existent pas déjà, recherche par téléphone)
  const chauffeursCrees: Record<string, string> = {};
  for (const c of CHAUFFEURS) {
    let employe = await prisma.employe.findFirst({ where: { telephone: c.telephone } });
    if (!employe) {
      employe = await prisma.employe.create({
        data: {
          nom: c.nom,
          prenom: c.prenom,
          sexe: "M",
          role: "Chauffeur",
          categorie: "CHAUFFEURS",
          telephone: c.telephone,
        },
      });
      console.log(`Chauffeur créé : ${c.prenom} ${c.nom}`);
    } else {
      console.log(`Chauffeur déjà existant : ${c.prenom} ${c.nom}`);
    }
    chauffeursCrees[c.telephone] = employe.id;
  }

  // 3. Récupérer la liste des traceurs Navixy pour faire la correspondance par libellé
  let traceurs: { id: number; label: string }[] = [];
  try {
    traceurs = await listerTraceurs();
  } catch (e) {
    console.warn("Impossible de contacter Navixy pour l'instant — les véhicules seront créés sans liaison GPS.", e);
  }

  // 4. Créer les véhicules réels, avec liaison GPS et chauffeur habituel si trouvés
  for (const v of VEHICULES) {
    const traceur = traceurs.find((t) => t.label === v.labelGps);
    if (!traceur) {
      console.warn(`Aucun traceur Navixy trouvé pour le libellé "${v.labelGps}" — vérifie l'orthographe exacte.`);
    }

    await prisma.vehicule.upsert({
      where: { matricule: v.matricule },
      update: {
        code: v.code,
        marque: v.marque,
        gpsTerminalId: traceur ? String(traceur.id) : undefined,
        chauffeurHabituelId: chauffeursCrees[v.chauffeurTel],
      },
      create: {
        matricule: v.matricule,
        code: v.code,
        marque: v.marque,
        gpsTerminalId: traceur ? String(traceur.id) : null,
        chauffeurHabituelId: chauffeursCrees[v.chauffeurTel],
      },
    });
    console.log(`Véhicule créé/mis à jour : ${v.code}${traceur ? ` (relié au traceur #${traceur.id})` : " (sans GPS)"}`);
  }

  console.log("\nTerminé. Va sur /vehicules et /equipe pour vérifier le résultat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });