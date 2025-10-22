WITH base_products AS (
  SELECT
    p.id,
    p.id AS "productId",
    NULL :: text AS "combinationId",
    'PRODUCT' :: text AS "entryType",
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
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pp.id,
            'currency',
            pp.currency,
            'price',
            pp.price,
            'buyedPrice',
            pp."buyedPrice",
            'discountedPrice',
            pp."discountedPrice"
          )
        ) AS jsonb_agg
      FROM
        "ProductPrice" pp
      WHERE
        (pp."productId" = p.id)
    ) AS prices,
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pt.id,
            'locale',
            pt.locale,
            'name',
            pt.name,
            'slug',
            pt.slug,
            'description',
            pt.description
          )
        ) AS jsonb_agg
      FROM
        "ProductTranslation" pt
      WHERE
        (pt."productId" = p.id)
    ) AS "productTranslations",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pa.id,
            'order',
            pa."order",
            'url',
            a.url,
            'type',
            a.type
          )
          ORDER BY
            pa."order"
        ) AS jsonb_agg
      FROM
        (
          "ProductAsset" pa
          JOIN "Asset" a ON ((pa."assetId" = a.id))
        )
      WHERE
        (pa."productId" = p.id)
    ) AS "productAssets",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object('id', c.id, 'name', ct.name, 'slug', ct.slug)
        ) AS jsonb_agg
      FROM
        (
          (
            "ProductCategory" pc
            JOIN "Category" c ON ((pc."categoryId" = c.id))
          )
          LEFT JOIN "CategoryTranslation" ct ON (
            (
              (c.id = ct."categoryId")
              AND (ct.locale = 'TR' :: "Locale")
            )
          )
        )
      WHERE
        (pc."productId" = p.id)
    ) AS categories,
    NULL :: jsonb AS "variantTranslation",
    NULL :: jsonb AS "variantAssets",
    NULL :: jsonb AS "variantOptions"
  FROM
    "Product" p
  WHERE
    (p."isVariant" = false)
),
variant_products AS (
  SELECT
    pvc.id,
    p.id AS "productId",
    pvc.id AS "combinationId",
    'VARIANT' :: text AS "entryType",
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
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pp.id,
            'currency',
            pp.currency,
            'price',
            pp.price,
            'buyedPrice',
            pp."buyedPrice",
            'discountedPrice',
            pp."discountedPrice"
          )
        ) AS jsonb_agg
      FROM
        "ProductPrice" pp
      WHERE
        (pp."combinationId" = pvc.id)
    ) AS prices,
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pt.id,
            'locale',
            pt.locale,
            'name',
            pt.name,
            'slug',
            pt.slug,
            'description',
            pt.description
          )
        ) AS jsonb_agg
      FROM
        "ProductTranslation" pt
      WHERE
        (pt."productId" = p.id)
    ) AS "productTranslations",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pa.id,
            'order',
            pa."order",
            'url',
            a.url,
            'type',
            a.type
          )
          ORDER BY
            pa."order"
        ) AS jsonb_agg
      FROM
        (
          "ProductAsset" pa
          JOIN "Asset" a ON ((pa."assetId" = a.id))
        )
      WHERE
        (pa."productId" = p.id)
    ) AS "productAssets",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object('id', c.id, 'name', ct.name, 'slug', ct.slug)
        ) AS jsonb_agg
      FROM
        (
          (
            "ProductCategory" pc
            JOIN "Category" c ON ((pc."categoryId" = c.id))
          )
          LEFT JOIN "CategoryTranslation" ct ON (
            (
              (c.id = ct."categoryId")
              AND (ct.locale = 'TR' :: "Locale")
            )
          )
        )
      WHERE
        (pc."productId" = p.id)
    ) AS categories,
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pvt.id,
            'locale',
            pvt.locale,
            'description',
            pvt.description
          )
        ) AS jsonb_agg
      FROM
        "ProductVariantTranslation" pvt
      WHERE
        (pvt."combinationId" = pvc.id)
    ) AS "variantTranslation",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'id',
            pa.id,
            'order',
            pa."order",
            'url',
            a.url,
            'type',
            a.type
          )
          ORDER BY
            pa."order"
        ) AS jsonb_agg
      FROM
        (
          "ProductAsset" pa
          JOIN "Asset" a ON ((pa."assetId" = a.id))
        )
      WHERE
        (pa."combinationId" = pvc.id)
    ) AS "variantAssets",
    (
      SELECT
        jsonb_agg(
          jsonb_build_object(
            'variantGroupSlug',
            vgt.slug,
            'variantOptionSlug',
            vot.slug,
            'groupName',
            vgt.name,
            'optionName',
            vot.name,
            'hexValue',
            vo."hexValue"
          )
          ORDER BY
            pvg."order",
            pvo."order"
        ) AS jsonb_agg
      FROM
        (
          (
            (
              (
                (
                  (
                    "ProductVariantCombinationOption" pvco
                    JOIN "ProductVariantOption" pvo ON ((pvco."productVariantOptionId" = pvo.id))
                  )
                  JOIN "ProductVariantGroup" pvg ON ((pvo."productVariantGroupId" = pvg.id))
                )
                JOIN "VariantOption" vo ON ((pvo."variantOptionId" = vo.id))
              )
              JOIN "VariantGroup" vg ON ((vo."variantGroupId" = vg.id))
            )
            LEFT JOIN "VariantGroupTranslation" vgt ON (
              (
                (vg.id = vgt."variantGroupId")
                AND (vgt.locale = 'TR' :: "Locale")
              )
            )
          )
          LEFT JOIN "VariantOptionTranslation" vot ON (
            (
              (vo.id = vot."variantOptionId")
              AND (vot.locale = 'TR' :: "Locale")
            )
          )
        )
      WHERE
        (pvco."combinationId" = pvc.id)
    ) AS "variantOptions"
  FROM
    (
      "ProductVariantCombination" pvc
      JOIN "Product" p ON ((pvc."productId" = p.id))
    )
)
SELECT
  base_products.id,
  base_products."productId",
  base_products."combinationId",
  base_products."entryType",
  base_products.sku,
  base_products.barcode,
  base_products.type,
  base_products.stock,
  base_products.active,
  base_products."isProductActive",
  base_products."visibleAllCombinations",
  base_products."brandId",
  base_products."taxonomyCategoryId",
  base_products."createdAt",
  base_products."updatedAt",
  base_products.prices,
  base_products."productTranslations",
  base_products."productAssets",
  base_products.categories,
  base_products."variantTranslation",
  base_products."variantAssets",
  base_products."variantOptions"
FROM
  base_products
UNION
ALL
SELECT
  variant_products.id,
  variant_products."productId",
  variant_products."combinationId",
  variant_products."entryType",
  variant_products.sku,
  variant_products.barcode,
  variant_products.type,
  variant_products.stock,
  variant_products.active,
  variant_products."isProductActive",
  variant_products."visibleAllCombinations",
  variant_products."brandId",
  variant_products."taxonomyCategoryId",
  variant_products."createdAt",
  variant_products."updatedAt",
  variant_products.prices,
  variant_products."productTranslations",
  variant_products."productAssets",
  variant_products.categories,
  variant_products."variantTranslation",
  variant_products."variantAssets",
  variant_products."variantOptions"
FROM
  variant_products;