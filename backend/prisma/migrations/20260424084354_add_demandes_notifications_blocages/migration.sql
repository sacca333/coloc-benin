/*
  Warnings:

  - You are about to drop the column `loierConfirme` on the `colocataires` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "colocataires" DROP COLUMN "loierConfirme",
ADD COLUMN     "loyerConfirme" BOOLEAN NOT NULL DEFAULT false;
