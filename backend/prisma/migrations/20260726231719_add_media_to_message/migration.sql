/*
  Warnings:

  - You are about to drop the `demandes_colocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "StatutAnnonce" ADD VALUE 'COMPLET';

-- DropForeignKey
ALTER TABLE "demandes_colocation" DROP CONSTRAINT "demandes_colocation_colocationId_fkey";

-- DropForeignKey
ALTER TABLE "demandes_colocation" DROP CONSTRAINT "demandes_colocation_demandeurId_fkey";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "media" TEXT;

-- DropTable
DROP TABLE "demandes_colocation";

-- CreateTable
CREATE TABLE "blocages" (
    "id" TEXT NOT NULL,
    "bloqueurId" TEXT NOT NULL,
    "bloqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demandes" (
    "id" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "message" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'PENDING',
    "requesterConfirme" BOOLEAN NOT NULL DEFAULT false,
    "auteurConfirme" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocages_bloqueurId_bloqueId_key" ON "blocages"("bloqueurId", "bloqueId");

-- CreateIndex
CREATE UNIQUE INDEX "demandes_annonceId_requesterId_key" ON "demandes"("annonceId", "requesterId");

-- AddForeignKey
ALTER TABLE "blocages" ADD CONSTRAINT "blocages_bloqueurId_fkey" FOREIGN KEY ("bloqueurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocages" ADD CONSTRAINT "blocages_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "annonces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes" ADD CONSTRAINT "demandes_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
