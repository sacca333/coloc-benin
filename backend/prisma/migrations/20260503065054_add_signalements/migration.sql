/*
  Warnings:

  - You are about to drop the column `placesRestantes` on the `annonces` table. All the data in the column will be lost.
  - You are about to drop the column `destinataireId` on the `demandes_colocation` table. All the data in the column will be lost.
  - You are about to drop the column `expediteurId` on the `demandes_colocation` table. All the data in the column will be lost.
  - The `statut` column on the `demandes_colocation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the `blocages` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[demandeurId,colocationId]` on the table `demandes_colocation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `demandeurId` to the `demandes_colocation` table without a default value. This is not possible if the table is not empty.
  - Made the column `colocationId` on table `demandes_colocation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `utilisateurId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "blocages" DROP CONSTRAINT "blocages_bloqueId_fkey";

-- DropForeignKey
ALTER TABLE "blocages" DROP CONSTRAINT "blocages_bloqueurId_fkey";

-- DropForeignKey
ALTER TABLE "demandes_colocation" DROP CONSTRAINT "demandes_colocation_destinataireId_fkey";

-- DropForeignKey
ALTER TABLE "demandes_colocation" DROP CONSTRAINT "demandes_colocation_expediteurId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- AlterTable
ALTER TABLE "annonces" DROP COLUMN "placesRestantes";

-- AlterTable
ALTER TABLE "demandes_colocation" DROP COLUMN "destinataireId",
DROP COLUMN "expediteurId",
ADD COLUMN     "demandeurId" TEXT NOT NULL,
DROP COLUMN "statut",
ADD COLUMN     "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
ALTER COLUMN "colocationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "userId",
ADD COLUMN     "utilisateurId" TEXT NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "blocages";

-- DropEnum
DROP TYPE "StatutDemandeColocation";

-- DropEnum
DROP TYPE "TypeNotification";

-- CreateTable
CREATE TABLE "signalements" (
    "id" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "signaleurId" TEXT NOT NULL,
    "raison" TEXT NOT NULL,
    "details" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signalements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "villes" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "villes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "signalements_annonceId_signaleurId_key" ON "signalements"("annonceId", "signaleurId");

-- CreateIndex
CREATE UNIQUE INDEX "villes_nom_key" ON "villes"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_colocation_demandeurId_colocationId_key" ON "demandes_colocation"("demandeurId", "colocationId");

-- AddForeignKey
ALTER TABLE "demandes_colocation" ADD CONSTRAINT "demandes_colocation_demandeurId_fkey" FOREIGN KEY ("demandeurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_colocation" ADD CONSTRAINT "demandes_colocation_colocationId_fkey" FOREIGN KEY ("colocationId") REFERENCES "colocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "annonces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signalements" ADD CONSTRAINT "signalements_signaleurId_fkey" FOREIGN KEY ("signaleurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
