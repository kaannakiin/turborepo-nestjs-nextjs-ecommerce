/*
  Warnings:

  - You are about to drop the column `routing` on the `StoreSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoreSettings" DROP COLUMN "routing";

-- DropEnum
DROP TYPE "RoutingStrategy";
