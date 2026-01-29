---
trigger: always_on
---

# Prisma Type Patterns

## Pattern 1: Query Object + GetPayload

Define reusable query objects and derive types automatically:

```typescript
import { Prisma } from "@repo/database/client";

export const adminProductQuery = {
  assets: {
    orderBy: { order: "asc" },
    select: { asset: { select: { url: true, type: true } } },
  },
  translations: true,
  variants: { include: { prices: true } },
} as const satisfies Prisma.ProductInclude;

export type AdminProductType = Prisma.ProductGetPayload<{
  include: typeof adminProductQuery;
}>;
```

---

## Pattern 2: Function-Based Query Builder

Use functions for dynamic queries:

```typescript
import { Prisma, Locale, Currency } from "@repo/database/client";

export const productDetailInclude = (locale: Locale, currency: Currency) =>
  ({
    translations: { where: { locale } },
    prices: { where: { currency } },
    variants: {
      where: { active: true },
      include: {
        prices: { where: { currency } },
        translations: { where: { locale } },
      },
    },
  }) as const satisfies Prisma.ProductInclude;

export type ProductDetailType = Prisma.ProductGetPayload<{
  include: ReturnType<typeof productDetailInclude>;
}>;
```

---

## Pattern 3: Nested Type Extraction

Extract nested types from complex payloads:

```typescript
export type ProductVariant = AdminProductType["variants"][number];
export type VariantPrice = ProductVariant["prices"][number];
export type ProductAsset = AdminProductType["assets"][number]["asset"];
```

---

## Pattern 4: Lightweight Types with Select

Select only required fields:

```typescript
export const productListSelect = {
  id: true,
  slug: true,
  translations: {
    where: { locale: "tr" },
    select: { name: true },
  },
  assets: {
    take: 1,
    orderBy: { order: "asc" },
    select: { asset: { select: { url: true } } },
  },
} as const satisfies Prisma.ProductSelect;

export type ProductListItem = Prisma.ProductGetPayload<{
  select: typeof productListSelect;
}>;
```
