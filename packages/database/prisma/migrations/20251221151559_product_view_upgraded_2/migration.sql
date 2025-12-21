-- Migration dosyası
DROP VIEW IF EXISTS "ProductListingView";


CREATE VIEW "ProductListingView" AS
SELECT 
  p.id AS "productId",
  pvc.id AS "variantId",
  pp.currency,
  COALESCE(pp."discountedPrice", pp.price) AS "finalPrice",
  pp.price AS "originalPrice",
  CASE 
    WHEN pp."discountedPrice" IS NOT NULL AND pp.price > 0 
    THEN ROUND(((pp.price - pp."discountedPrice") / pp.price * 100)::numeric, 2)
    ELSE 0 
  END AS "discountPercentage",
  p."brandId",
  p."createdAt",
  pvc.stock,
  pvc.sku,
  
  ARRAY(
    SELECT pc."categoryId" 
    FROM "ProductCategory" pc 
    WHERE pc."productId" = p.id
  ) AS "categoryIds",
  
  ARRAY(
    SELECT ct.slug
    FROM "ProductCategory" pc
    INNER JOIN "CategoryTranslation" ct ON ct."categoryId" = pc."categoryId"
    WHERE pc."productId" = p.id
  ) AS "categorySlugs",
  
  ARRAY(
    SELECT ptop."productTagId"
    FROM "ProductTagOnProduct" ptop
    WHERE ptop."productId" = p.id
  ) AS "tagIds",
  
  ARRAY(
    SELECT ptt.name
    FROM "ProductTagOnProduct" ptop
    INNER JOIN "ProductTagTranslation" ptt ON ptt."productTagId" = ptop."productTagId"
    WHERE ptop."productId" = p.id
  ) AS "tagSlugs",

  ARRAY(
    SELECT pvco."productVariantOptionId"
    FROM "ProductVariantCombinationOption" pvco
    WHERE pvco."combinationId" = pvc.id
  ) AS "variantOptionIds",

  ARRAY(
    SELECT bt.slug
    FROM "BrandTranslation" bt
    WHERE bt."brandId" = p."brandId"
  ) AS "brandSlugs",

  ARRAY(
    SELECT vot.slug
    FROM "ProductVariantCombinationOption" pvco
    INNER JOIN "ProductVariantOption" pvo ON pvo.id = pvco."productVariantOptionId"
    INNER JOIN "VariantOptionTranslation" vot ON vot."variantOptionId" = pvo."variantOptionId"
    WHERE pvco."combinationId" = pvc.id
  ) AS "variantOptionSlugs",

  ARRAY(
    SELECT vgt.slug || ':' || vot.slug
    FROM "ProductVariantCombinationOption" pvco
    INNER JOIN "ProductVariantOption" pvo ON pvo.id = pvco."productVariantOptionId"
    INNER JOIN "ProductVariantGroup" pvg ON pvg.id = pvo."productVariantGroupId"
    INNER JOIN "VariantGroup" vg ON vg.id = pvg."variantGroupId"
    INNER JOIN "VariantGroupTranslation" vgt ON vgt."variantGroupId" = vg.id
    INNER JOIN "VariantOptionTranslation" vot ON vot."variantOptionId" = pvo."variantOptionId"
    WHERE pvco."combinationId" = pvc.id
    AND vgt.locale = vot.locale
  ) AS "variantGroupOptionSlugs",

  ROW_NUMBER() OVER (
    PARTITION BY p.id, pp.currency
    ORDER BY COALESCE(pp."discountedPrice", pp.price) ASC
  ) AS "priceRank"

FROM "Product" p
INNER JOIN "ProductVariantCombination" pvc 
  ON pvc."productId" = p.id 
  AND pvc.active = true 
  AND pvc.stock > 0
  AND pvc."deletedAt" IS NULL
INNER JOIN "ProductPrice" pp 
  ON pp."variantId" = pvc.id
WHERE p.active = true 
  AND p."deletedAt" IS NULL;