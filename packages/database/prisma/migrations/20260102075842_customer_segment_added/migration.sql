-- AlterTable
ALTER TABLE "CustomerSegment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastEvaluated" TIMESTAMP(3),
ADD COLUMN     "memberCount" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "FulfillmentConditionType";

-- DropEnum
DROP TYPE "FulfillmentRuleOperator";

-- CreateIndex
CREATE INDEX "CustomerSegment_isActive_idx" ON "CustomerSegment"("isActive");
