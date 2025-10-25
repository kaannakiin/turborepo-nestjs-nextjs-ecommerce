/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Discount` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SCHEDULED', 'ARCHIVED');

-- DropIndex
DROP INDEX "public"."Discount_isActive_startDate_endDate_idx";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "deletedAt",
DROP COLUMN "isActive",
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "deletedAt",
DROP COLUMN "isActive",
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Discount_startDate_endDate_idx" ON "Discount"("startDate", "endDate");
