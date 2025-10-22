-- AlterEnum
ALTER TYPE "DiscountConditionType" ADD VALUE 'VARIANT';

-- AlterTable
ALTER TABLE "DiscountConditionGroup" ADD COLUMN     "type" "DiscountConditionType" NOT NULL DEFAULT 'PRODUCT';
