-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE INDEX "User_id_refreshToken_email_phone_idx" ON "public"."User"("id", "refreshToken", "email", "phone");
