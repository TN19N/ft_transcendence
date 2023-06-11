/*
  Warnings:

  - You are about to drop the column `isTwoFactorAuthonticationEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorAuthonticationSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isTwoFactorAuthonticationEnabled",
DROP COLUMN "twoFactorAuthonticationSecret",
ADD COLUMN     "isTwoFactorAuthenticationEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorAuthenticationSecret" TEXT;
