/*
  Warnings:

  - You are about to drop the column `browser` on the `RefreshTokens` table. All the data in the column will be lost.
  - You are about to drop the column `browserVersion` on the `RefreshTokens` table. All the data in the column will be lost.
  - You are about to drop the column `deviceName` on the `RefreshTokens` table. All the data in the column will be lost.
  - You are about to drop the column `osVersion` on the `RefreshTokens` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `RefreshTokens` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[replacedByTokenId]` on the table `RefreshTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RefreshTokens_id_hashedRefreshToken_idx";

-- AlterTable
ALTER TABLE "RefreshTokens" DROP COLUMN "browser",
DROP COLUMN "browserVersion",
DROP COLUMN "deviceName",
DROP COLUMN "osVersion",
DROP COLUMN "updatedAt",
ADD COLUMN     "replacedByTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_replacedByTokenId_key" ON "RefreshTokens"("replacedByTokenId");

-- CreateIndex
CREATE INDEX "RefreshTokens_userId_idx" ON "RefreshTokens"("userId");

-- AddForeignKey
ALTER TABLE "RefreshTokens" ADD CONSTRAINT "RefreshTokens_replacedByTokenId_fkey" FOREIGN KEY ("replacedByTokenId") REFERENCES "RefreshTokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
