-- CreateTable
CREATE TABLE "public"."FooterLinks" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB,
    "productId" TEXT,
    "categoryId" TEXT,
    "brandId" TEXT,
    "footerLinkGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FooterLinkGroups" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "options" JSONB,
    "footerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterLinkGroups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Footer" (
    "id" TEXT NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Footer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FooterLinks" ADD CONSTRAINT "FooterLinks_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FooterLinks" ADD CONSTRAINT "FooterLinks_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FooterLinks" ADD CONSTRAINT "FooterLinks_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FooterLinks" ADD CONSTRAINT "FooterLinks_footerLinkGroupId_fkey" FOREIGN KEY ("footerLinkGroupId") REFERENCES "public"."FooterLinkGroups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FooterLinkGroups" ADD CONSTRAINT "FooterLinkGroups_footerId_fkey" FOREIGN KEY ("footerId") REFERENCES "public"."Footer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
