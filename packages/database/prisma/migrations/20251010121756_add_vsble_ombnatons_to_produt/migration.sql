-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('PRODUCT', 'VARIANT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "visibleAllCombinations" BOOLEAN NOT NULL DEFAULT false;
