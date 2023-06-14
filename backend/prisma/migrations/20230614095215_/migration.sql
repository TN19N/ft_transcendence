/*
  Warnings:

  - You are about to drop the column `intraId` on the `UserSensitiveData` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[intraId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `intraId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UserSensitiveData_intraId_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "intraId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserSensitiveData" DROP COLUMN "intraId";

-- CreateIndex
CREATE UNIQUE INDEX "User_intraId_key" ON "User"("intraId");
