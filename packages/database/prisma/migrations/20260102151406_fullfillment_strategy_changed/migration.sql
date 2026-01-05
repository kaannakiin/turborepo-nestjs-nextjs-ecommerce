/*
  Warnings:

  - You are about to drop the column `ruleId` on the `FulfillmentDecision` table. All the data in the column will be lost.
  - The `type` column on the `FulfillmentStrategy` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `FulfillmentRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FulfillmentRuleAction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FulfillmentRuleCondition` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FulfillmentRule" DROP CONSTRAINT "FulfillmentRule_strategyId_fkey";

-- DropForeignKey
ALTER TABLE "FulfillmentRuleAction" DROP CONSTRAINT "FulfillmentRuleAction_ruleId_fkey";

-- DropForeignKey
ALTER TABLE "FulfillmentRuleCondition" DROP CONSTRAINT "FulfillmentRuleCondition_ruleId_fkey";

-- AlterTable
ALTER TABLE "FulfillmentDecision" DROP COLUMN "ruleId",
ADD COLUMN     "matchedRuleId" TEXT;

-- AlterTable
ALTER TABLE "FulfillmentStrategy" ADD COLUMN     "rules" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PROXIMITY';

-- DropTable
DROP TABLE "FulfillmentRule";

-- DropTable
DROP TABLE "FulfillmentRuleAction";

-- DropTable
DROP TABLE "FulfillmentRuleCondition";

-- DropEnum
DROP TYPE "ConditionOperator";

-- DropEnum
DROP TYPE "CustomerSegmentField";

-- DropEnum
DROP TYPE "DiscountConditionField";

-- DropEnum
DROP TYPE "FulfillmentActionType";

-- DropEnum
DROP TYPE "FulfillmentConditionField";

-- DropEnum
DROP TYPE "FulfillmentStrategyType";

-- DropEnum
DROP TYPE "TimeUnit";

-- CreateIndex
CREATE INDEX "FulfillmentDecision_strategyId_idx" ON "FulfillmentDecision"("strategyId");

-- AddForeignKey
ALTER TABLE "FulfillmentDecision" ADD CONSTRAINT "FulfillmentDecision_strategyId_fkey" FOREIGN KEY ("strategyId") REFERENCES "FulfillmentStrategy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
