-- CreateTable
CREATE TABLE "sauvegardes" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "annonceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sauvegardes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sauvegardes_utilisateurId_annonceId_key" ON "sauvegardes"("utilisateurId", "annonceId");

-- AddForeignKey
ALTER TABLE "sauvegardes" ADD CONSTRAINT "sauvegardes_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sauvegardes" ADD CONSTRAINT "sauvegardes_annonceId_fkey" FOREIGN KEY ("annonceId") REFERENCES "annonces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
