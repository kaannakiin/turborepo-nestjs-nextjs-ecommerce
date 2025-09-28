-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "cargoRuleId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Cart" ADD CONSTRAINT "Cart_cargoRuleId_fkey" FOREIGN KEY ("cargoRuleId") REFERENCES "public"."CargoRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
