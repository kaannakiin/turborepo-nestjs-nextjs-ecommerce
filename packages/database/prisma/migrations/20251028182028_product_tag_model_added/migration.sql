-- CreateTable
CREATE TABLE "ProductTagTranslation" (
    "id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL DEFAULT 'TR',
    "name" TEXT NOT NULL,
    "productTagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTagTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTag" (
    "id" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "priority" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTagOnProduct" (
    "productId" TEXT NOT NULL,
    "productTagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTagOnProduct_pkey" PRIMARY KEY ("productId","productTagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTagTranslation_locale_productTagId_key" ON "ProductTagTranslation"("locale", "productTagId");

-- CreateIndex
CREATE INDEX "ProductTagOnProduct_productId_idx" ON "ProductTagOnProduct"("productId");

-- CreateIndex
CREATE INDEX "ProductTagOnProduct_productTagId_idx" ON "ProductTagOnProduct"("productTagId");

-- AddForeignKey
ALTER TABLE "ProductTagTranslation" ADD CONSTRAINT "ProductTagTranslation_productTagId_fkey" FOREIGN KEY ("productTagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagOnProduct" ADD CONSTRAINT "ProductTagOnProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTagOnProduct" ADD CONSTRAINT "ProductTagOnProduct_productTagId_fkey" FOREIGN KEY ("productTagId") REFERENCES "ProductTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
