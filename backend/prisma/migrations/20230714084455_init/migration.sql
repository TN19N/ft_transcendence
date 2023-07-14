/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GameRecord" DROP CONSTRAINT "GameRecord_opponentId_fkey";

-- DropForeignKey
ALTER TABLE "GameRecord" DROP CONSTRAINT "GameRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "DM" (
    "id" TEXT NOT NULL,
    "cratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,

    CONSTRAINT "DM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDm" (
    "cratedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dmId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "MessageDm_pkey" PRIMARY KEY ("dmId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DM_user1Id_user2Id_key" ON "DM"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDm" ADD CONSTRAINT "MessageDm_dmId_fkey" FOREIGN KEY ("dmId") REFERENCES "DM"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecord" ADD CONSTRAINT "GameRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRecord" ADD CONSTRAINT "GameRecord_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
