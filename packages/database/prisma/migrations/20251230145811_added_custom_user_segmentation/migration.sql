-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PASSIVE', 'BANNED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "RegistrationSource" AS ENUM ('WEB_REGISTER', 'ADMIN_PANEL', 'IMPORT_EXCEL', 'API', 'CHECKOUT_GUEST', 'PROVIDER_OAUTH');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'PENDING');

-- CreateEnum
CREATE TYPE "PriceListType" AS ENUM ('OVERRIDE', 'DISCOUNT', 'INCREASE');

-- DropIndex
DROP INDEX "User_id_email_phone_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "customAttributes" JSONB,
ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "firstOrderDate" TIMESTAMP(3),
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastOrderDate" TIMESTAMP(3),
ADD COLUMN     "note" TEXT,
ADD COLUMN     "orderCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "priceListId" TEXT,
ADD COLUMN     "registrationSource" "RegistrationSource" NOT NULL DEFAULT 'WEB_REGISTER',
ADD COLUMN     "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'UNSUBSCRIBED',
ADD COLUMN     "totalSpent" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CustomerTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CustomerTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'TRY',
    "type" "PriceListType" NOT NULL DEFAULT 'OVERRIDE',
    "adjustmentValue" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPriceListPrice" (
    "id" TEXT NOT NULL,
    "priceListId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductPriceListPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSegment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CustomerTagToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerTagToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CustomerGroupToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerGroupToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CustomerGroupToPriceList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CustomerGroupToPriceList_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerTag_name_key" ON "CustomerTag"("name");

-- CreateIndex
CREATE INDEX "ProductPriceListPrice_variantId_idx" ON "ProductPriceListPrice"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductPriceListPrice_priceListId_variantId_minQuantity_key" ON "ProductPriceListPrice"("priceListId", "variantId", "minQuantity");

-- CreateIndex
CREATE INDEX "_CustomerTagToUser_B_index" ON "_CustomerTagToUser"("B");

-- CreateIndex
CREATE INDEX "_CustomerGroupToUser_B_index" ON "_CustomerGroupToUser"("B");

-- CreateIndex
CREATE INDEX "_CustomerGroupToPriceList_B_index" ON "_CustomerGroupToPriceList"("B");

-- CreateIndex
CREATE INDEX "User_email_phone_idx" ON "User"("email", "phone");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "User_totalSpent_idx" ON "User"("totalSpent");

-- CreateIndex
CREATE INDEX "User_orderCount_idx" ON "User"("orderCount");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceListPrice" ADD CONSTRAINT "ProductPriceListPrice_priceListId_fkey" FOREIGN KEY ("priceListId") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPriceListPrice" ADD CONSTRAINT "ProductPriceListPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerTagToUser" ADD CONSTRAINT "_CustomerTagToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerTagToUser" ADD CONSTRAINT "_CustomerTagToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroupToUser" ADD CONSTRAINT "_CustomerGroupToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroupToUser" ADD CONSTRAINT "_CustomerGroupToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroupToPriceList" ADD CONSTRAINT "_CustomerGroupToPriceList_A_fkey" FOREIGN KEY ("A") REFERENCES "CustomerGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CustomerGroupToPriceList" ADD CONSTRAINT "_CustomerGroupToPriceList_B_fkey" FOREIGN KEY ("B") REFERENCES "PriceList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
