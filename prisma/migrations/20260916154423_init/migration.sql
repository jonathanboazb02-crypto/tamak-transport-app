-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('DIRECTION', 'GESTION', 'CHAUFFEURS', 'TECHNICIENS');

-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "StatutVehicule" AS ENUM ('ACTIF', 'EN_ENTRETIEN', 'HORS_SERVICE');

-- CreateEnum
CREATE TYPE "StatutChargement" AS ENUM ('VIDE', 'PLEIN');

-- CreateEnum
CREATE TYPE "StatutCourse" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "categorie" "Categorie" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "employeId" TEXT,
    "derniereConnexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employe" (
    "id" TEXT NOT NULL,
    "photo" TEXT,
    "nom" TEXT NOT NULL,
    "postNom" TEXT,
    "prenom" TEXT NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "role" TEXT NOT NULL,
    "categorie" "Categorie" NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "dateEntree" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "marque" TEXT,
    "modele" TEXT,
    "capacite" INTEGER,
    "statut" "StatutVehicule" NOT NULL DEFAULT 'ACTIF',
    "gpsTerminalId" TEXT,
    "chauffeurHabituelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "codeCourse" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heure" TEXT NOT NULL,
    "statutChargement" "StatutChargement" NOT NULL,
    "statut" "StatutCourse" NOT NULL DEFAULT 'EN_ATTENTE',
    "chauffeurId" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "superviseurId" TEXT,
    "signatureSuperviseur" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carburant" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "chauffeurId" TEXT,
    "dateChargement" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "quantiteLitres" DOUBLE PRECISION NOT NULL,
    "prixLitre" DOUBLE PRECISION NOT NULL,
    "montantTotal" DOUBLE PRECISION NOT NULL,
    "nombreCourses" INTEGER NOT NULL DEFAULT 0,
    "observations" TEXT,
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carburant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PositionGps" (
    "id" TEXT NOT NULL,
    "vehiculeId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "vitesse" DOUBLE PRECISION,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PositionGps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAcces" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalAcces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_employeId_key" ON "Utilisateur"("employeId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_matricule_key" ON "Vehicule"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicule_code_key" ON "Vehicule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_codeCourse_key" ON "Course"("codeCourse");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_chauffeurHabituelId_fkey" FOREIGN KEY ("chauffeurHabituelId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Employe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_superviseurId_fkey" FOREIGN KEY ("superviseurId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carburant" ADD CONSTRAINT "Carburant_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carburant" ADD CONSTRAINT "Carburant_chauffeurId_fkey" FOREIGN KEY ("chauffeurId") REFERENCES "Employe"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PositionGps" ADD CONSTRAINT "PositionGps_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAcces" ADD CONSTRAINT "JournalAcces_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
