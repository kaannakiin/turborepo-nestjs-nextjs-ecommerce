-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "categoryGridComponentId" TEXT;

-- AlterTable
ALTER TABLE "public"."LayoutComponent" ADD COLUMN     "categoryGridComponentId" TEXT;

-- CreateTable
CREATE TABLE "public"."CategoryGridComponent" (
    "id" TEXT NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryGridComponent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_categoryGridComponentId_fkey" FOREIGN KEY ("categoryGridComponentId") REFERENCES "public"."CategoryGridComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LayoutComponent" ADD CONSTRAINT "LayoutComponent_categoryGridComponentId_fkey" FOREIGN KEY ("categoryGridComponentId") REFERENCES "public"."CategoryGridComponent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
