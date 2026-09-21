-- AlterTable
ALTER TABLE "Employe" ADD COLUMN     "categoriesPermis" TEXT,
ADD COLUMN     "numeroPermis" TEXT,
ADD COLUMN     "permisCategories" TEXT,
ADD COLUMN     "permisNumero" TEXT,
ADD COLUMN     "permisPhoto" TEXT,
ADD COLUMN     "photoPermis" TEXT;

-- AlterTable
ALTER TABLE "Vehicule" ADD COLUMN     "photo" TEXT;
