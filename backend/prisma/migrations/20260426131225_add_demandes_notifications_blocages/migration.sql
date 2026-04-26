-- CreateEnum
CREATE TYPE "StatutDemandeColocation" AS ENUM ('EN_ATTENTE', 'ACCEPTEE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeNotification" AS ENUM ('DEMANDE_COLOCATION', 'COLOCATION_ACCEPTEE', 'COLOCATION_REJETEE', 'NOUVELLE_ANNONCE', 'BLOCAGE', 'DEBLOCAGE');

-- CreateTable
CREATE TABLE "demandes_colocation" (
    "id" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "statut" "StatutDemandeColocation" NOT NULL DEFAULT 'EN_ATTENTE',
    "colocationId" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demandes_colocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeNotification" NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocages" (
    "id" TEXT NOT NULL,
    "bloqueurId" TEXT NOT NULL,
    "bloqueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocages_bloqueurId_bloqueId_key" ON "blocages"("bloqueurId", "bloqueId");

-- AddForeignKey
ALTER TABLE "demandes_colocation" ADD CONSTRAINT "demandes_colocation_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demandes_colocation" ADD CONSTRAINT "demandes_colocation_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocages" ADD CONSTRAINT "blocages_bloqueurId_fkey" FOREIGN KEY ("bloqueurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocages" ADD CONSTRAINT "blocages_bloqueId_fkey" FOREIGN KEY ("bloqueId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
