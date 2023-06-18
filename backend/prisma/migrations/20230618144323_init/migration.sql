-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'OFFLINE';
