/*
  Warnings:

  - A unique constraint covering the columns `[defaultAddressId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "defaultAddressId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_defaultAddressId_key" ON "public"."User"("defaultAddressId");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_defaultAddressId_fkey" FOREIGN KEY ("defaultAddressId") REFERENCES "public"."AddressSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;
