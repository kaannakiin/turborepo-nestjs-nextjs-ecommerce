-- =========================================================
-- 0. ENGELLEYİCİLERİ KALDIR
-- =========================================================
DROP VIEW IF EXISTS "ProductUnifiedView";

-- =========================================================
-- 1. CONSTRAINTS VE INDEXLERİ KALDIR
-- =========================================================
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

ALTER TABLE "OrderItemSchema"
DROP CONSTRAINT "OrderItemSchema_productId_fkey";

ALTER TABLE "OrderItemSchema"
DROP CONSTRAINT "OrderItemSchema_variantId_fkey";

ALTER TABLE "ProductAsset"
DROP CONSTRAINT "ProductAsset_combinationId_fkey";

ALTER TABLE "ProductListCarouselItem"
DROP CONSTRAINT "ProductListCarouselItem_productId_fkey";

ALTER TABLE "ProductPrice"
DROP CONSTRAINT "ProductPrice_combinationId_fkey";

ALTER TABLE "ProductPrice"
DROP CONSTRAINT "ProductPrice_productId_fkey";

DROP INDEX IF EXISTS "CartItem_cartId_productId_variantId_idx";

DROP INDEX IF EXISTS "CartItem_cartId_productId_variantId_key";

DROP INDEX IF EXISTS "OrderItemSchema_orderId_productId_variantId_key";

DROP INDEX IF EXISTS "Product_barcode_idx";

DROP INDEX IF EXISTS "Product_barcode_key";

DROP INDEX IF EXISTS "Product_sku_idx";

DROP INDEX IF EXISTS "Product_sku_key";

DROP INDEX IF EXISTS "ProductAsset_combinationId_order_idx";

DROP INDEX IF EXISTS "ProductListCarouselItem_productListCarouselId_productId_var_key";

DROP INDEX IF EXISTS "ProductPrice_combinationId_currency_idx";

DROP INDEX IF EXISTS "ProductPrice_combinationId_currency_key";

DROP INDEX IF EXISTS "ProductPrice_productId_currency_idx";

DROP INDEX IF EXISTS "ProductPrice_productId_currency_key";

DROP INDEX IF EXISTS "ProductVariantCombination_productId_barcode_key";

DROP INDEX IF EXISTS "ProductVariantCombination_productId_sku_key";

-- =========================================================
-- 2. YENİ KOLONLARI EKLE (NULLABLE)
-- =========================================================
ALTER TABLE "ProductVariantCombination"
ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ProductPrice" ADD COLUMN IF NOT EXISTS "variantId" TEXT;

ALTER TABLE "ProductAsset" ADD COLUMN IF NOT EXISTS "variantId" TEXT;

-- =========================================================
-- 3. VERİ TAŞIMA (MIGRATION SCRIPT)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- !!! BURASI ÇOK ÖNEMLİ: ESKİ VARYANT VERİLERİNİ KURTARMA !!!
-- combinationId olanların verisini variantId'ye kopyalıyoruz ki silinmesin.
UPDATE "ProductPrice"
SET
    "variantId" = "combinationId"
WHERE
    "combinationId" IS NOT NULL;

UPDATE "ProductAsset"
SET
    "variantId" = "combinationId"
WHERE
    "combinationId" IS NOT NULL;

-- A) Hiç varyantı olmayan (Eski Product yapısı) ürünler için Default Varyant Oluşturma
INSERT INTO "ProductVariantCombination" (
  "id", "productId", "sku", "barcode", "stock", "active", "isDefault", "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  p."id",
  p."sku",
  p."barcode",
  COALESCE(p."stock", 0),
  p."active",
  true,
  NOW(),
  NOW()
FROM "Product" p
WHERE NOT EXISTS (
  SELECT 1 FROM "ProductVariantCombination" pvc WHERE pvc."productId" = p."id"
);

-- B) Eski Product fiyatlarını, yeni oluşturulan Default Varyantlara taşıma
UPDATE "ProductPrice" pp
SET "variantId" = pvc."id"
FROM "ProductVariantCombination" pvc
WHERE pp."productId" = pvc."productId"
  AND pvc."isDefault" = true
  AND (pp."variantId" IS NULL OR pp."variantId" = '');

-- C) Sepetleri Taşıma
UPDATE "CartItem" ci
SET "variantId" = pvc."id"
FROM "ProductVariantCombination" pvc
WHERE ci."productId" = pvc."productId"
  AND pvc."isDefault" = true
  AND (ci."variantId" IS NULL OR ci."variantId" = '');

-- D) Siparişleri Taşıma
UPDATE "OrderItemSchema" ois
SET "variantId" = pvc."id"
FROM "ProductVariantCombination" pvc
WHERE ois."productId" = pvc."productId"
  AND pvc."isDefault" = true
  AND (ois."variantId" IS NULL OR ois."variantId" = '');

-- E) Assets Taşıma (Sadece Product'a bağlı olanlar)
UPDATE "ProductAsset" pa
SET "variantId" = pvc."id"
FROM "ProductVariantCombination" pvc
WHERE pa."productId" = pvc."productId"
  AND pvc."isDefault" = true
  AND (pa."variantId" IS NULL OR pa."variantId" = '');

-- F) Carousel Taşıma
UPDATE "ProductListCarouselItem" plci
SET "variantId" = pvc."id"
FROM "ProductVariantCombination" pvc
WHERE plci."productId" = pvc."productId"
  AND pvc."isDefault" = true
  AND (plci."variantId" IS NULL OR plci."variantId" = '');

-- =========================================================
-- 4. ÇÖP VERİ TEMİZLİĞİ
-- =========================================================

DELETE FROM "CartItem" WHERE "variantId" IS NULL;

DELETE FROM "OrderItemSchema" WHERE "variantId" IS NULL;

DELETE FROM "ProductListCarouselItem" WHERE "variantId" IS NULL;

DELETE FROM "ProductPrice" WHERE "variantId" IS NULL;
-- Artık burada dolu olanlar silinmeyecek

-- =========================================================
-- 4.1 DEDUPLICATION (TEKRARLAYAN SKU/BARKOD DÜZELTME)
-- =========================================================

UPDATE "ProductVariantCombination" pvc
SET sku = pvc.sku || '-' || (sub.rn - 1)::text
FROM (
  SELECT id, ROW_NUMBER() OVER(PARTITION BY sku ORDER BY "createdAt") as rn
  FROM "ProductVariantCombination"
  WHERE sku IS NOT NULL
) sub
WHERE pvc.id = sub.id
AND sub.rn > 1;

UPDATE "ProductVariantCombination" pvc
SET barcode = pvc.barcode || '-' || (sub.rn - 1)::text
FROM (
  SELECT id, ROW_NUMBER() OVER(PARTITION BY barcode ORDER BY "createdAt") as rn
  FROM "ProductVariantCombination"
  WHERE barcode IS NOT NULL
) sub
WHERE pvc.id = sub.id
AND sub.rn > 1;

-- =========================================================
-- 5. ESKİ KOLONLARI SİL VE CONSTRAINTLERİ EKLE
-- =========================================================

ALTER TABLE "CampaignOffer"
DROP COLUMN IF EXISTS "showPrroductIfInCart",
ADD COLUMN IF NOT EXISTS "applyToAllVariants" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "showProductIfInCart" BOOLEAN NOT NULL DEFAULT false;

-- CartItem
ALTER TABLE "CartItem" DROP COLUMN IF EXISTS "productId";

ALTER TABLE "CartItem" ALTER COLUMN "variantId" SET NOT NULL;

-- OrderItem
ALTER TABLE "OrderItemSchema" DROP COLUMN IF EXISTS "productId";

ALTER TABLE "OrderItemSchema"
DROP COLUMN IF EXISTS "productSnapshot";

ALTER TABLE "OrderItemSchema"
ALTER COLUMN "variantSnapshot"
SET
    NOT NULL;

ALTER TABLE "OrderItemSchema" ALTER COLUMN "variantId" SET NOT NULL;

-- Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS "barcode";

ALTER TABLE "Product" DROP COLUMN IF EXISTS "isVariant";

ALTER TABLE "Product" DROP COLUMN IF EXISTS "sku";

ALTER TABLE "Product" DROP COLUMN IF EXISTS "stock";

-- ProductAsset
ALTER TABLE "ProductAsset" DROP COLUMN IF EXISTS "combinationId";

-- Carousel
ALTER TABLE "ProductListCarouselItem"
DROP COLUMN IF EXISTS "productId";

ALTER TABLE "ProductListCarouselItem"
ALTER COLUMN "variantId"
SET
    NOT NULL;

-- ProductPrice
ALTER TABLE "ProductPrice" DROP COLUMN IF EXISTS "combinationId";

ALTER TABLE "ProductPrice" DROP COLUMN IF EXISTS "productId";

ALTER TABLE "ProductPrice" ALTER COLUMN "variantId" SET NOT NULL;

-- Indexler
CREATE INDEX IF NOT EXISTS "CartItem_cartId_variantId_idx" ON "CartItem" ("cartId", "variantId");

CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_variantId_key" ON "CartItem" ("cartId", "variantId");

CREATE UNIQUE INDEX IF NOT EXISTS "OrderItemSchema_orderId_variantId_key" ON "OrderItemSchema" ("orderId", "variantId");

CREATE INDEX IF NOT EXISTS "ProductAsset_variantId_order_idx" ON "ProductAsset" ("variantId", "order");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductListCarouselItem_productListCarouselId_variantId_key" ON "ProductListCarouselItem" (
    "productListCarouselId",
    "variantId"
);

CREATE INDEX IF NOT EXISTS "ProductPrice_variantId_currency_idx" ON "ProductPrice" ("variantId", "currency");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductPrice_variantId_currency_key" ON "ProductPrice" ("variantId", "currency");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariantCombination_sku_key" ON "ProductVariantCombination" ("sku");

CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariantCombination_barcode_key" ON "ProductVariantCombination" ("barcode");

CREATE INDEX IF NOT EXISTS "ProductVariantCombination_sku_idx" ON "ProductVariantCombination" ("sku");

CREATE INDEX IF NOT EXISTS "ProductVariantCombination_barcode_idx" ON "ProductVariantCombination" ("barcode");

CREATE INDEX IF NOT EXISTS "ProductVariantCombination_productId_isDefault_idx" ON "ProductVariantCombination" ("productId", "isDefault");

-- Foreign Keys
ALTER TABLE "ProductPrice"
ADD CONSTRAINT "ProductPrice_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProductAsset"
ADD CONSTRAINT "ProductAsset_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderItemSchema"
ADD CONSTRAINT "OrderItemSchema_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariantCombination" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;