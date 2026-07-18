/*
  Warnings:

  - The values [PROPRIETAIRE] on the enum `TypeCompte` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeCompte_new" AS ENUM ('ETUDIANT', 'AUTRE', 'ADMIN');
ALTER TABLE "utilisateurs" ALTER COLUMN "typeCompte" DROP DEFAULT;
ALTER TABLE "utilisateurs" ALTER COLUMN "typeCompte" TYPE "TypeCompte_new" USING ("typeCompte"::text::"TypeCompte_new");
ALTER TYPE "TypeCompte" RENAME TO "TypeCompte_old";
ALTER TYPE "TypeCompte_new" RENAME TO "TypeCompte";
DROP TYPE "TypeCompte_old";
ALTER TABLE "utilisateurs" ALTER COLUMN "typeCompte" SET DEFAULT 'ETUDIANT';
COMMIT;
