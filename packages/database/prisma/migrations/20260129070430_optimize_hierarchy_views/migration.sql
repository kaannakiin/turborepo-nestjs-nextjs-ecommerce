-- ============================================
-- Optimize Hierarchy Views
-- Replace bidirectional (ancestors + descendants) approach
-- with simple tree structure (root → children only)
-- ============================================

-- ============================================
-- Step 1: Drop existing views
-- ============================================

DROP VIEW IF EXISTS "CategoryHierarchyView";
DROP VIEW IF EXISTS "BrandHierarchyView";
DROP VIEW IF EXISTS "TagHierarchyView";

-- ============================================
-- Step 2: Create optimized CategoryHierarchyView
-- ============================================

CREATE VIEW "CategoryHierarchyView" AS
WITH RECURSIVE tree AS (
  -- Base case: Root nodes (depth = 0)
  SELECT
    c.id as node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    0 as depth
  FROM "Category" c
  WHERE c."parentCategoryId" IS NULL
  
  UNION ALL
  
  -- Recursive case: Children (depth + 1)
  SELECT
    c.id as node_id,
    c."parentCategoryId" as parent_id,
    c."imageId",
    t.depth + 1
  FROM "Category" c
  INNER JOIN tree t ON c."parentCategoryId" = t.node_id
)
-- Join with translations and assets for all locales
SELECT
  t.node_id as "nodeId",
  t.parent_id as "parentId",
  t.depth,
  ct.locale,
  ct.name,
  ct.slug,
  ct.description,
  ct."metaTitle",
  ct."metaDescription",
  a.url as "imageUrl",
  a.type as "imageType"
FROM tree t
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "CategoryTranslation" ct
  ON t.node_id = ct."categoryId"
  AND ct.locale = loc.locale
LEFT JOIN "Asset" a
  ON t."imageId" = a.id;

-- ============================================
-- Step 3: Create optimized BrandHierarchyView
-- ============================================

CREATE VIEW "BrandHierarchyView" AS
WITH RECURSIVE tree AS (
  -- Base case: Root nodes (depth = 0)
  SELECT
    b.id as node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    0 as depth
  FROM "Brand" b
  WHERE b."parentBrandId" IS NULL
    AND b."deletedAt" IS NULL
  
  UNION ALL
  
  -- Recursive case: Children (depth + 1)
  SELECT
    b.id as node_id,
    b."parentBrandId" as parent_id,
    b."imageId",
    t.depth + 1
  FROM "Brand" b
  INNER JOIN tree t ON b."parentBrandId" = t.node_id
  WHERE b."deletedAt" IS NULL
)
-- Join with translations and assets for all locales
SELECT
  t.node_id as "nodeId",
  t.parent_id as "parentId",
  t.depth,
  bt.locale,
  bt.name,
  bt.slug,
  bt.description,
  bt."metaTitle",
  bt."metaDescription",
  a.url as "imageUrl",
  a.type as "imageType"
FROM tree t
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "BrandTranslation" bt
  ON t.node_id = bt."brandId"
  AND bt.locale = loc.locale
LEFT JOIN "Asset" a
  ON t."imageId" = a.id;

-- ============================================
-- Step 4: Create optimized TagHierarchyView
-- ============================================

CREATE VIEW "TagHierarchyView" AS
WITH RECURSIVE tree AS (
  -- Base case: Root nodes (depth = 0)
  SELECT
    pt.id as node_id,
    pt."parentTagId" as parent_id,
    0 as depth,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt
  WHERE pt."parentTagId" IS NULL
  
  UNION ALL
  
  -- Recursive case: Children (depth + 1)
  SELECT
    pt.id as node_id,
    pt."parentTagId" as parent_id,
    t.depth + 1,
    pt.color,
    pt.icon,
    pt.priority
  FROM "ProductTag" pt
  INNER JOIN tree t ON pt."parentTagId" = t.node_id
)
-- Join with translations for all locales
SELECT
  t.node_id as "nodeId",
  t.parent_id as "parentId",
  t.depth,
  ptt.locale,
  ptt.name,
  ptt.slug,
  t.color,
  t.icon,
  t.priority
FROM tree t
CROSS JOIN (
  SELECT unnest(enum_range(NULL::"Locale")) as locale
) loc
LEFT JOIN "ProductTagTranslation" ptt
  ON t.node_id = ptt."productTagId"
  AND ptt.locale = loc.locale;