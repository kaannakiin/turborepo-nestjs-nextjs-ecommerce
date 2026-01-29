-- ============================================
-- Step 1: Add hierarchy field to ProductTag
-- ============================================

ALTER TABLE "ProductTag" ADD COLUMN "parentTagId" TEXT;

ALTER TABLE "ProductTag"
  ADD CONSTRAINT "ProductTag_parentTagId_fkey"
  FOREIGN KEY ("parentTagId")
  REFERENCES "ProductTag"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE INDEX "ProductTag_parentTagId_idx" ON "ProductTag"("parentTagId");

-- ============================================
-- Step 2: Create CategoryHierarchyView
-- ============================================

DROP VIEW IF EXISTS "CategoryHierarchyView";

CREATE VIEW "CategoryHierarchyView" AS
WITH RECURSIVE
-- Ancestors: Parent'ları topla (yukarı doğru)
ancestors AS (
  SELECT
    c.id as node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    0 as depth
  FROM "Category" c

  UNION ALL

  SELECT
    a.node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    a.depth - 1
  FROM "Category" c
  INNER JOIN ancestors a ON c.id = a.parent_id
),
-- Descendants: Child'ları topla (aşağı doğru)
descendants AS (
  SELECT
    c.id as node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    0 as depth
  FROM "Category" c

  UNION ALL

  SELECT
    c.id as node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    d.depth + 1
  FROM "Category" c
  INNER JOIN descendants d ON c."parentCategoryId" = d.node_id
),
-- Tüm node'ları birleştir
all_nodes AS (
  SELECT * FROM ancestors
  UNION
  SELECT * FROM descendants
)
-- Final SELECT: Tüm locale'ler için satır üret
SELECT
  an.node_id as "nodeId",
  an.parent_id as "parentId",
  an.depth,
  ct.locale,
  ct.name,
  ct.slug,
  ct.description,
  ct."metaTitle",
  ct."metaDescription",
  a.url as "imageUrl",
  a.type as "imageType"
FROM all_nodes an
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "CategoryTranslation" ct
  ON an.node_id = ct."categoryId"
  AND ct.locale = loc.locale
LEFT JOIN "Asset" a
  ON an."imageId" = a.id;

-- ============================================
-- Step 3: Create BrandHierarchyView
-- ============================================

DROP VIEW IF EXISTS "BrandHierarchyView";

CREATE VIEW "BrandHierarchyView" AS
WITH RECURSIVE
ancestors AS (
  SELECT
    b.id as node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    0 as depth
  FROM "Brand" b
  WHERE b."deletedAt" IS NULL

  UNION ALL

  SELECT
    a.node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    a.depth - 1
  FROM "Brand" b
  INNER JOIN ancestors a ON b.id = a.parent_id
  WHERE b."deletedAt" IS NULL
),
descendants AS (
  SELECT
    b.id as node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    0 as depth
  FROM "Brand" b
  WHERE b."deletedAt" IS NULL

  UNION ALL

  SELECT
    b.id as node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    d.depth + 1
  FROM "Brand" b
  INNER JOIN descendants d ON b."parentBrandId" = d.node_id
  WHERE b."deletedAt" IS NULL
),
all_nodes AS (
  SELECT * FROM ancestors
  UNION
  SELECT * FROM descendants
)
-- Tüm locale'ler için satır üret
SELECT
  an.node_id as "nodeId",
  an.parent_id as "parentId",
  an.depth,
  bt.locale,
  bt.name,
  bt.slug,
  bt.description,
  bt."metaTitle",
  bt."metaDescription",
  a.url as "imageUrl",
  a.type as "imageType"
FROM all_nodes an
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "BrandTranslation" bt
  ON an.node_id = bt."brandId"
  AND bt.locale = loc.locale
LEFT JOIN "Asset" a
  ON an."imageId" = a.id;

-- ============================================
-- Step 4: Create TagHierarchyView
-- ============================================

DROP VIEW IF EXISTS "TagHierarchyView";

CREATE VIEW "TagHierarchyView" AS
WITH RECURSIVE
ancestors AS (
  SELECT
    pt.id as node_id,
    pt."parentTagId" as parent_id,
    0 as depth,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt

  UNION ALL

  SELECT
    a.node_id,
    pt."parentTagId" as parent_id,
    a.depth - 1,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt
  INNER JOIN ancestors a ON pt.id = a.parent_id
),
descendants AS (
  SELECT
    pt.id as node_id,
    pt."parentTagId" as parent_id,
    0 as depth,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt

  UNION ALL

  SELECT
    pt.id as node_id,
    pt."parentTagId" as parent_id,
    d.depth + 1,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt
  INNER JOIN descendants d ON pt."parentTagId" = d.node_id
),
all_nodes AS (
  SELECT * FROM ancestors
  UNION
  SELECT * FROM descendants
)
-- Tüm locale'ler için satır üret
SELECT
  an.node_id as "nodeId",
  an.parent_id as "parentId",
  an.depth,
  ptt.locale,
  ptt.name,
  ptt.slug,
  an.color,
  an.icon,
  an.priority
FROM all_nodes an
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "ProductTagTranslation" ptt
  ON an.node_id = ptt."productTagId"
  AND ptt.locale = loc.locale;
