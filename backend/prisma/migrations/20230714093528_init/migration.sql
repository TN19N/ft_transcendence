/*
  Warnings:

  - You are about to drop the column `craetedAt` on the `Ban` table. All the data in the column will be lost.
  - You are about to drop the column `cratedAt` on the `GameRecord` table. All the data in the column will be lost.
  - You are about to drop the column `cratedAt` on the `MessageDm` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ban" DROP COLUMN "craetedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "GameRecord" DROP COLUMN "cratedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "MessageDm" DROP COLUMN "cratedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
