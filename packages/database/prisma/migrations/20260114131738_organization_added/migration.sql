/*
  Warnings:

  - Added the required column `organizationId` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
