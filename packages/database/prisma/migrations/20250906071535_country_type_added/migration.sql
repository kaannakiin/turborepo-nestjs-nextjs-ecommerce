-- CreateEnum
CREATE TYPE "public"."CountryType" AS ENUM ('STATE', 'CITY');

-- AlterTable
ALTER TABLE "public"."Country" ADD COLUMN     "type" "public"."CountryType" NOT NULL DEFAULT 'STATE';
