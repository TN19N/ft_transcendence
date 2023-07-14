/*
  Warnings:

  - The primary key for the `MessageDm` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dmId` on the `MessageDm` table. All the data in the column will be lost.
  - You are about to drop the `DM` table. If the table is not empty, all the data it contains will be lost.
  - The required column `id` was added to the `MessageDm` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `receiverId` to the `MessageDm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DM" DROP CONSTRAINT "DM_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "DM" DROP CONSTRAINT "DM_user2Id_fkey";

-- DropForeignKey
ALTER TABLE "MessageDm" DROP CONSTRAINT "MessageDm_dmId_fkey";

-- AlterTable
ALTER TABLE "MessageDm" DROP CONSTRAINT "MessageDm_pkey",
DROP COLUMN "dmId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD CONSTRAINT "MessageDm_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "DM";

-- AddForeignKey
ALTER TABLE "MessageDm" ADD CONSTRAINT "MessageDm_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDm" ADD CONSTRAINT "MessageDm_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
