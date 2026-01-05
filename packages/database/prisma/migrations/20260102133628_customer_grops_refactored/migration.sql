/*
  Warnings:

  - You are about to drop the `CustomerSegment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('MANUAL', 'SMART');

-- AlterTable
ALTER TABLE "CustomerGroup" ADD COLUMN     "conditions" JSONB,
ADD COLUMN     "type" "GroupType" NOT NULL DEFAULT 'MANUAL';

-- DropTable
DROP TABLE "CustomerSegment";
