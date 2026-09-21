-- DropIndex
DROP INDEX "Course_codeCourse_key";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "tarifCdf" DOUBLE PRECISION,
ADD COLUMN     "tarifUsd" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "TarifCourse" (
    "id" TEXT NOT NULL,
    "codeCourse" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tarifCdf" DOUBLE PRECISION NOT NULL,
    "tarifUsd" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TarifCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TarifCourse_codeCourse_key" ON "TarifCourse"("codeCourse");
