/*
  Warnings:

  - You are about to drop the column `rules` on the `FulfillmentStrategy` table. All the data in the column will be lost.
  - Added the required column `decisionTree` to the `FulfillmentStrategy` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FulfillmentStrategy" DROP COLUMN "rules",
ADD COLUMN     "decisionTree" JSONB NOT NULL,
ADD COLUMN     "defaultLeadTimeDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "processOnHolidays" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "FulfillmentStrategy_isDefault_idx" ON "FulfillmentStrategy"("isDefault");
