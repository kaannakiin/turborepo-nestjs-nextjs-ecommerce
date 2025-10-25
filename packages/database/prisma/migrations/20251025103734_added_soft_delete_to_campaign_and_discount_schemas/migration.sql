-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "deletedAt" TIMESTAMP(3);
