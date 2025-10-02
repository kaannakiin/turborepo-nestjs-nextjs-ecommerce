/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_id_refreshToken_email_phone_idx";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "refreshToken";

-- CreateTable
CREATE TABLE "public"."RefreshTokens" (
    "id" TEXT NOT NULL,
    "hashedRefreshToken" TEXT NOT NULL,
    "userAgent" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "deviceName" TEXT,
    "ipAddress" TEXT,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_hashedRefreshToken_key" ON "public"."RefreshTokens"("hashedRefreshToken");

-- CreateIndex
CREATE INDEX "RefreshTokens_id_hashedRefreshToken_idx" ON "public"."RefreshTokens"("id", "hashedRefreshToken");

-- CreateIndex
CREATE INDEX "User_id_email_phone_idx" ON "public"."User"("id", "email", "phone");

-- AddForeignKey
ALTER TABLE "public"."RefreshTokens" ADD CONSTRAINT "RefreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
