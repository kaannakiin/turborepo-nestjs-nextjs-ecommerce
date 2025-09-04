-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "taxonomyCategoryId" TEXT;

-- CreateTable
CREATE TABLE "public"."TaxonomyCategory" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "parentId" TEXT,
    "path" TEXT,
    "pathNames" TEXT,
    "depth" INTEGER NOT NULL DEFAULT 0,
    "originalName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxonomyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyCategory_googleId_key" ON "public"."TaxonomyCategory"("googleId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_googleId_idx" ON "public"."TaxonomyCategory"("googleId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_parentId_idx" ON "public"."TaxonomyCategory"("parentId");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_path_idx" ON "public"."TaxonomyCategory"("path");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_depth_idx" ON "public"."TaxonomyCategory"("depth");

-- CreateIndex
CREATE INDEX "TaxonomyCategory_isActive_idx" ON "public"."TaxonomyCategory"("isActive");

-- AddForeignKey
ALTER TABLE "public"."TaxonomyCategory" ADD CONSTRAINT "TaxonomyCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."TaxonomyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_taxonomyCategoryId_fkey" FOREIGN KEY ("taxonomyCategoryId") REFERENCES "public"."TaxonomyCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
