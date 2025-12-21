
CREATE OR REPLACE VIEW "ProductListingView" AS
SELECT p.id AS "productId", pvc.id AS "variantId", pp.currency,


COALESCE(pp."discountedPrice", pp.price) AS "finalPrice",
  
  CASE 
    WHEN pp."discountedPrice" IS NOT NULL AND pp.price > 0 
    THEN ROUND(((pp.price - pp."discountedPrice") / pp.price * 100)::numeric, 2)
    ELSE 0 
  END AS "discountPercentage",
  
  p."createdAt",


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