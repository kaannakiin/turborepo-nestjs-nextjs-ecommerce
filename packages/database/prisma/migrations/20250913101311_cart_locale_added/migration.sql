-- AlterTable
ALTER TABLE "public"."Cart" ADD COLUMN     "currency" "public"."Currency" NOT NULL DEFAULT 'TRY',
ADD COLUMN     "locale" "public"."Locale" NOT NULL DEFAULT 'TR';
