-- AddForeignKey
ALTER TABLE "GameRecord" ADD CONSTRAINT "GameRecord_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
