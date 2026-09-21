import { PrismaClient, Categorie, Sexe, StatutVehicule } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Employé Direction + compte utilisateur admin
  const directeur = await prisma.employe.upsert({
    where: { id: "seed-directeur" },
    update: {},
    create: {
      id: "seed-directeur",
      nom: "Bulala",
      prenom: "Jonathan",
      sexe: Sexe.M,
      role: "Superviseur des Opérations",
      categorie: Categorie.DIRECTION,
      email: "distributeurtamak@gmail.com",
    },
  });

  const motDePasseHash = await bcrypt.hash("ChangeMoi123!", 10);

  await prisma.utilisateur.upsert({
    where: { email: "admin@tamak-transport.cd" },
    update: {},
    create: {
      email: "admin@tamak-transport.cd",
      motDePasse: motDePasseHash,
      role: "SUPERVISEUR_OPERATIONS",
      categorie: Categorie.DIRECTION,
      employeId: directeur.id,
    },
  });

  // 2. Deux véhicules de démonstration
  await prisma.vehicule.upsert({
    where: { matricule: "CD-1234-KIN" },
    update: {},
    create: {
      matricule: "CD-1234-KIN",
      code: "VH-001",
      marque: "Isuzu",
      modele: "FRR",
      capacite: 400,
      statut: StatutVehicule.ACTIF,
    },
  });

  await prisma.vehicule.upsert({
    where: { matricule: "CD-5678-KIN" },
    update: {},
    create: {
      matricule: "CD-5678-KIN",
      code: "VH-002",
      marque: "Mitsubishi",
      modele: "Fuso",
      capacite: 350,
      statut: StatutVehicule.ACTIF,
    },
  });

  console.log("Données de démonstration insérées.");
  console.log("Connexion : admin@tamak-transport.cd / ChangeMoi123!  (à changer immédiatement)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
