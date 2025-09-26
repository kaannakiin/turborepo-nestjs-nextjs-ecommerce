-- AlterEnum
ALTER TYPE "public"."CountryType" ADD VALUE 'NONE';

-- AlterTable
ALTER TABLE "public"."AddressSchema" ADD COLUMN     "addressTitle" TEXT;
