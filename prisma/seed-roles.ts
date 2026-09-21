// À exécuter une seule fois : npx tsx prisma/seed-roles.ts
// Insère dans la table Role les intitulés déjà utilisés dans l'application,
// pour que le module "Paramètres > Rôles" parte avec les bonnes valeurs.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ROLES: { nom: string; categorie: "DIRECTION" | "GESTION" | "CHAUFFEURS" | "TECHNICIENS" }[] = [
  { nom: "Responsable Administratif, RH et Financier", categorie: "DIRECTION" },
  { nom: "Gestionnaire Logistique et Approvisionnement", categorie: "DIRECTION" },
  { nom: "Superviseur des Opérations", categorie: "DIRECTION" },
  { nom: "Trésorerie", categorie: "DIRECTION" },
  { nom: "Comptable", categorie: "GESTION" },
  { nom: "Chargé d'Administration", categorie: "GESTION" },
  { nom: "Superviseur", categorie: "GESTION" },
  { nom: "Mécanicien", categorie: "TECHNICIENS" },
  { nom: "Chauffeur", categorie: "CHAUFFEURS" },
];

async function main() {
  for (const r of ROLES) {
    await prisma.role.upsert({
      where: { nom_categorie: { nom: r.nom, categorie: r.categorie } },
      update: {},
      create: r,
    });
    console.log(`Rôle prêt : ${r.nom} (${r.categorie})`);
  }
  console.log(`\n${ROLES.length} rôles vérifiés/créés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });