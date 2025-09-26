-- AlterTable
ALTER TABLE "public"."CargoRule" ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "price" DROP DEFAULT;
