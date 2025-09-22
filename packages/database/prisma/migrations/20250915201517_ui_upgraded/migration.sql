/*
  Warnings:

  - Added the required column `sliderSettingsId` to the `SliderItemSchema` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."SliderItemSchema" ADD COLUMN     "sliderSettingsId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."SliderItemSchema" ADD CONSTRAINT "SliderItemSchema_sliderSettingsId_fkey" FOREIGN KEY ("sliderSettingsId") REFERENCES "public"."SliderSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
