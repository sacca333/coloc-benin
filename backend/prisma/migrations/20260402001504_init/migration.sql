-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('ETUDIANT', 'PROPRIETAIRE', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatutAbonnement" AS ENUM ('ACTIF', 'EXPIRE', 'EN_ATTENTE', 'ECHEC');

-- CreateEnum
CREATE TYPE "OperateurPaiement" AS ENUM ('MOMO', 'CCASH', 'MOOV_MONEY');

-- CreateEnum
CREATE TYPE "TypeAnnonce" AS ENUM ('LOGEMENT_DISPONIBLE', 'PLACE_EN_COLOCATION');

-- CreateEnum
CREATE TYPE "StatutAnnonce" AS ENUM ('ACTIVE', 'INACTIVE', 'MODEREE', 'SUPPRIMEE');

-- CreateEnum
CREATE TYPE "StatutColocation" AS ENUM ('ACTIVE', 'EN_ATTENTE', 'FERMEE');

-- CreateEnum
CREATE TYPE "StatutColocataire" AS ENUM ('ACTIF', 'EN_ATTENTE', 'PARTI');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "motDePasse" TEXT NOT NULL,
    "ville" TEXT,
    "universite" TEXT,
    "filiere" TEXT,
    "niveau" TEXT,
    "typeCompte" "TypeCompte" NOT NULL DEFAULT 'ETUDIANT',
    "photo" TEXT,
    "emailVerifie" BOOLEAN NOT NULL DEFAULT false,
    "tokenVerifEmail" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annonces" (
    "id" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "type" "TypeAnnonce" NOT NULL,
    "adresse" TEXT,
    "quartier" TEXT,
    "ville" TEXT NOT NULL,
    "loyerTotal" INTEGER NOT NULL,
    "nbPlaces" INTEGER NOT NULL,
    "nbColocataires" INTEGER,
    "caution" INTEGER,
    "description" TEXT,
    "equipements" TEXT[],
    "photos" TEXT[],
    "statut" "StatutAnnonce" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annonces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colocations" (
    "id" TEXT NOT NULL,
    "annonceId" TEXT,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT NOT NULL,
    "loyerTotal" INTEGER NOT NULL,
    "nbPlaces" INTEGER NOT NULL,
    "description" TEXT,
    "statut" "StatutColocation" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colocataires" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "colocId" TEXT NOT NULL,
    "partLoyer" INTEGER,
    "statut" "StatutColocataire" NOT NULL DEFAULT 'EN_ATTENTE',
    "loierConfirme" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "colocataires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abonnements" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "operateur" "OperateurPaiement" NOT NULL,
    "montant" INTEGER NOT NULL DEFAULT 300,
    "referenceOp" TEXT,
    "statut" "StatutAbonnement" NOT NULL DEFAULT 'EN_ATTENTE',
    "periodeDebut" TIMESTAMP(3),
    "periodeFin" TIMESTAMP(3),
    "datePaiement" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abonnements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "destinataireId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "colocations_annonceId_key" ON "colocations"("annonceId");

-- CreateIndex
CREATE UNIQUE INDEX "colocataires_utilisateurId_colocId_key" ON "colocataires"("utilisateurId", "colocId");

-- AddForeignKey
ALTER TABLE "annonces" ADD CONSTRAINT "annonces_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colocations" ADD CONSTRAINT "colocations_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "annonces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colocataires" ADD CONSTRAINT "colocataires_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "colocataires" ADD CONSTRAINT "colocataires_colocId_fkey" FOREIGN KEY ("colocId") REFERENCES "colocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abonnements" ADD CONSTRAINT "abonnements_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_destinataireId_fkey" FOREIGN KEY ("destinataireId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
