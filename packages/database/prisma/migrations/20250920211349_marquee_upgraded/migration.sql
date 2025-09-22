/*
  Warnings:

  - You are about to drop the column `duration` on the `MarqueeSchema` table. All the data in the column will be lost.
  - You are about to drop the column `pauseOnHover` on the `MarqueeSchema` table. All the data in the column will be lost.
  - You are about to drop the column `xaxisDirection` on the `MarqueeSchema` table. All the data in the column will be lost.
  - You are about to drop the column `yaxisDirection` on the `MarqueeSchema` table. All the data in the column will be lost.
  - You are about to drop the `MarqueeItemSchema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MarqueeItemSchema" DROP CONSTRAINT "MarqueeItemSchema_marqueeSchemaId_fkey";

-- AlterTable
ALTER TABLE "public"."MarqueeSchema" DROP COLUMN "duration",
DROP COLUMN "pauseOnHover",
DROP COLUMN "xaxisDirection",
DROP COLUMN "yaxisDirection",
ADD COLUMN     "options" JSONB;

-- DropTable
DROP TABLE "public"."MarqueeItemSchema";

-- DropEnum
DROP TYPE "public"."XAXISDIRECTION";

-- DropEnum
DROP TYPE "public"."YAXISDIRECTION";
