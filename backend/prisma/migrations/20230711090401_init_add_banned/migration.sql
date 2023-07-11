-- CreateTable
CREATE TABLE "Ban" (
    "craetedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "bannedUserId" TEXT NOT NULL,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("userId","bannedUserId")
);

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_bannedUserId_fkey" FOREIGN KEY ("bannedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
