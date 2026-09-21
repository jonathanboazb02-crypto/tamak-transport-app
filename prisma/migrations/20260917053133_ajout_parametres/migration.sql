-- CreateTable
CREATE TABLE "ParametresEntreprise" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "nom" TEXT NOT NULL DEFAULT 'Établissement TAMAK',
    "rccm" TEXT NOT NULL DEFAULT 'CD/KIN/RCCM 14 A – 7808',
    "idNat" TEXT NOT NULL DEFAULT 'Id.nat.01-93-N94301-S',
    "nif" TEXT NOT NULL DEFAULT 'A0700219X',
    "adresse" TEXT NOT NULL DEFAULT 'Av. Landu 172, Commune de Bumbu – Kinshasa / RD. Congo',
    "email" TEXT NOT NULL DEFAULT 'distributeurtamak@gmail.com',
    "devise" TEXT NOT NULL DEFAULT 'USD',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParametresEntreprise_pkey" PRIMARY KEY ("id")
);
