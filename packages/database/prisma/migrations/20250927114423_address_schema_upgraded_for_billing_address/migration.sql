-- AlterTable
ALTER TABLE "public"."AddressSchema" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyRegistrationAddress" TEXT,
ADD COLUMN     "isBillingAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCorporateInvoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "taxNumber" TEXT;
