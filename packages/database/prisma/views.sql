CREATE OR REPLACE VIEW "ProductUnifiedView" AS
WITH base_products AS (
  SELECT
    p.id,
    p.id AS "productId",
    NULL AS "combinationId",
    'PRODUCT' AS "entryType",
    p.sku,
    p.barcode,
    p.type,
    p.stock,
    p.active,
    p.active AS "isProductActive",
    p."visibleAllCombinations",
    p."brandId",
    p."taxonomyCategoryId",
    p."createdAt",
    p."updatedAt",
    (SELECT jsonb_agg(jsonb_build_object('id', pp.id, 'currency', pp.currency, 'price', pp.price, 'buyedPrice', pp."buyedPrice", 'discountedPrice', pp."discountedPrice")) FROM "ProductPrice" AS pp WHERE pp."productId" = p.id) AS prices,
    (SELECT jsonb_agg(jsonb_build_object('id', pt.id, 'locale', pt.locale, 'name', pt.name, 'slug', pt.slug, 'description', pt.description)) FROM "ProductTranslation" AS pt WHERE pt."productId" = p.id) AS "productTranslations",
    (SELECT jsonb_agg(jsonb_build_object('id', pa.id, 'order', pa.order, 'url', a.url, 'type', a.type) ORDER BY pa.order ASC) FROM "ProductAsset" AS pa JOIN "Asset" AS a ON pa."assetId" = a.id WHERE pa."productId" = p.id) AS "productAssets",
    (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', ct.name, 'slug', ct.slug)) FROM "ProductCategory" pc JOIN "Category" c ON pc."categoryId" = c.id LEFT JOIN "CategoryTranslation" ct ON c.id = ct."categoryId" AND ct.locale = 'TR' WHERE pc."productId" = p.id) as categories,
    NULL::jsonb AS "variantTranslation",
    NULL::jsonb AS "variantAssets",
    NULL::jsonb AS "variantOptions"
  FROM
    "Product" AS p
  WHERE
    p."isVariant" = false
),
variant_products AS (
  SELECT
    pvc.id,
    p.id AS "productId",
    pvc.id AS "combinationId",
    'VARIANT' AS "entryType",
    pvc.sku,
    pvc.barcode,
    p.type,
    pvc.stock,
    pvc.active,
    p.active AS "isProductActive",
    p."visibleAllCombinations",
    p."brandId",
    p."taxonomyCategoryId",
    pvc."createdAt",
    pvc."updatedAt",
    (SELECT jsonb_agg(jsonb_build_object('id', pp.id, 'currency', pp.currency, 'price', pp.price, 'buyedPrice', pp."buyedPrice", 'discountedPrice', pp."discountedPrice")) FROM "ProductPrice" AS pp WHERE pp."combinationId" = pvc.id) AS prices,
    (SELECT jsonb_agg(jsonb_build_object('id', pt.id, 'locale', pt.locale, 'name', pt.name, 'slug', pt.slug, 'description', pt.description)) FROM "ProductTranslation" AS pt WHERE pt."productId" = p.id) AS "productTranslations",
    (SELECT jsonb_agg(jsonb_build_object('id', pa.id, 'order', pa.order, 'url', a.url, 'type', a.type) ORDER BY pa.order ASC) FROM "ProductAsset" AS pa JOIN "Asset" AS a ON pa."assetId" = a.id WHERE pa."productId" = p.id) AS "productAssets",
    (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', ct.name, 'slug', ct.slug)) FROM "ProductCategory" pc JOIN "Category" c ON pc."categoryId" = c.id LEFT JOIN "CategoryTranslation" ct ON c.id = ct."categoryId" AND ct.locale = 'TR' WHERE pc."productId" = p.id) as categories,
    (SELECT jsonb_agg(jsonb_build_object('id', pvt.id, 'locale', pvt.locale, 'description', pvt.description)) FROM "ProductVariantTranslation" AS pvt WHERE pvt."combinationId" = pvc.id) AS "variantTranslation",
    (SELECT jsonb_agg(jsonb_build_object('id', pa.id, 'order', pa.order, 'url', a.url, 'type', a.type) ORDER BY pa.order ASC) FROM "ProductAsset" AS pa JOIN "Asset" AS a ON pa."assetId" = a.id WHERE pa."combinationId" = pvc.id) AS "variantAssets",
    (SELECT 
        jsonb_agg(
            jsonb_build_object(
                'variantGroupSlug', vgt.slug,
                'variantOptionSlug', vot.slug,
                'groupName', vgt.name, 
                'optionName', vot.name, 
                'hexValue', vo."hexValue"
            ) ORDER BY pvg."order" ASC, pvo."order" ASC
        ) 
    FROM "ProductVariantCombinationOption" pvco 
    JOIN "ProductVariantOption" pvo ON pvco."productVariantOptionId" = pvo.id 
    JOIN "ProductVariantGroup" pvg ON pvo."productVariantGroupId" = pvg.id 
    JOIN "VariantOption" vo ON pvo."variantOptionId" = vo.id 
    JOIN "VariantGroup" vg ON vo."variantGroupId" = vg.id 
    LEFT JOIN "VariantGroupTranslation" vgt ON vg.id = vgt."variantGroupId" AND vgt.locale = 'TR' 
    LEFT JOIN "VariantOptionTranslation" vot ON vo.id = vot."variantOptionId" AND vot.locale = 'TR' 
    WHERE pvco."combinationId" = pvc.id) AS "variantOptions"
  FROM
    "ProductVariantCombination" AS pvc JOIN "Product" AS p ON pvc."productId" = p.id
)
SELECT * FROM base_products
UNION ALL
SELECT * FROM variant_products;