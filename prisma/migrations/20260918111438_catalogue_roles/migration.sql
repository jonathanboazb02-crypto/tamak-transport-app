-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "Categorie" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_nom_categorie_key" ON "Role"("nom", "categorie");
