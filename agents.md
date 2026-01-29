---
# B2C E-Commerce Turborepo – Agent Rules

This document defines **mandatory rules and guidelines** for all AI agents working on this project.
---

## 🏗️ Project Structure

```
b2c/
├── apps/
│   ├── backend/          # NestJS API
│   └── web/              # Next.js (Admin + User)
├── packages/
│   ├── database/         # Prisma schema + client
│   ├── types/            # Zod schemas + TypeScript types
│   ├── shared-packages/  # Shared utilities (RHF, TanStack, date-fns)
│   ├── eslint-config/
│   ├── typescript-config/
│   └── jest-config/
└── turbo.json
```

---

## 📦 Package Rules

### `@repo/types` – Zod & Types

> **RULE**: All Zod schemas and shared types must be defined **ONLY here**.

```typescript
// ✅ CORRECT
import { ProductSchema, type ProductZodType } from "@repo/types";
import { z, flattenError } from "@repo/types";

// ❌ WRONG – Do not import Zod directly
import { z } from "zod";
```

**File structure:**

```
packages/types/src/{domain}/
├── index.ts                    # Re-exports
├── {domain}-zod-schemas.ts     # Zod schemas
└── {domain}-prisma-types.ts    # Prisma select/include types
```

---

### `@repo/database` – Prisma

> **RULE**: Prisma types must be imported from `@repo/database/client`.

```typescript
// ✅ CORRECT
import { prisma } from "@repo/database";
import type { User, Product } from "@repo/database/client";
import { Locale, Currency } from "@repo/database/client"; // Enums

// ❌ WRONG
import { PrismaClient } from "@prisma/client";
```

---

### `@repo/shared` – Shared Libraries

> **RULE**: TanStack Query and React Hook Form must be imported **ONLY from here**.

```typescript
// ✅ CORRECT
import { useQuery, useMutation, useQueryClient } from "@repo/shared";
import { useForm, Controller, useFieldArray, zodResolver } from "@repo/shared";
import { createId } from "@repo/shared";
import { dateFns } from "@repo/shared";

// ❌ WRONG
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
```

---

## 🔧 Backend Rules

### Controller Pattern

```typescript
// Admin endpoint – always use /admin prefix
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(["ADMIN", "OWNER"])
@Controller("admin/products")
export class ProductsController {}

// Public endpoint – no prefix
@Controller("products")
export class PublicProductsController {}
```

---

### Zod Validation

```typescript
// Use Zod schemas with ZodValidationPipe in the backend
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ProductSchema, type ProductZodType } from '@repo/types';

@Post()
async create(
  @Body(new ZodValidationPipe(ProductSchema))
  data: ProductZodType,
) {}
```

---

### DTO Pattern (nestjs-zod)

> **RULE**: Backend DTOs must be created using `createZodDto` from `nestjs-zod`.
> This ensures OpenAPI / Swagger compatibility.

```typescript
// ✅ CORRECT – use nestjs-zod
import { CreateProductSchema, UpdateProductSchema } from "@repo/types";
import { createZodDto } from "nestjs-zod";

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

// ❌ WRONG – manual class definitions
export class CreateProductDto {
  name: string;
  price: number;
}
```

---

### API Endpoint Structure

| Prefix     | Usage          | Auth              |
| ---------- | -------------- | ----------------- |
| `/admin/*` | Admin panel    | JWT + ADMIN/OWNER |
| `/auth/*`  | Authentication | Public / JWT      |
| `/cart/*`  | Cart           | Optional JWT      |
| `/*`       | Public         | Public            |

---

## 🎨 Frontend Rules

### Server vs Client Components

```typescript
// Server Component (default)
// ❌ DO NOT use 'use client'
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
// ✅ Must start with 'use client'
'use client';

export default function Button() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>{state}</button>;
}
```

---

### Export Rule

> **RULE**: All components must use **default export**.

```typescript
// ✅ CORRECT
export default function ProductCard() {}

// ❌ WRONG
export function ProductCard() {}
export const ProductCard = () => {};
```

---

## 📁 Component Placement Rules

```
app/components/           → Global / Shared
app/(admin)/components/   → Admin-only
app/(user)/components/    → User-only
{feature}/components/     → Feature-specific
```

| Component Type   | Location              | Example                    |
| ---------------- | --------------------- | -------------------------- |
| Global/shared    | `app/components/`     | Pagination, SearchInput    |
| Admin-only       | `(admin)/components/` | BrandSelect, AdminLayout   |
| User-only        | `(user)/components/`  | ProductCard, CartDrawer    |
| Feature-specific | `feature/components/` | DiscountForm, ProductTable |

---

## ✏️ Naming Rules

### ❌ DO NOT

```typescript
// No prefixes for global components
GlobalDropzone.tsx; // ❌
CustomSearchInput.tsx; // ❌
BaseButton.tsx; // ❌

// No scope prefixes for scoped components
AdminBrandSelect.tsx; // ❌ (already under admin/components)
UserProductCard.tsx; // ❌ (already under user/components)

// No version suffixes
ComponentV2.tsx; // ❌
```

---

### ✅ DO

```typescript
// Global – direct naming
Dropzone.tsx;
SearchInput.tsx;
Pagination.tsx;

// Scoped – direct naming (folder already defines scope)
BrandSelect.tsx; // admin/components/form/
ProductCard.tsx; // user/components/

// Feature – feature-prefixed
ProductTable.tsx; // product-list/components/
DiscountForm.tsx; // discounts/components/
```

---

### Suffix Rules

| Type         | Suffix                      | Example                   |
| ------------ | --------------------------- | ------------------------- |
| Form input   | `Input`, `Select`, `Picker` | BrandSelect, DatePicker   |
| Display card | `Card`                      | ProductCard, FormCard     |
| Modal/Drawer | `Modal`, `Drawer`           | DiscountModal, CartDrawer |
| Layout       | `Layout`, `Shell`           | AdminLayout, AppShell     |
| Loading      | `Skeleton`, `Loader`        | TableSkeleton, Loader     |
| Button       | `Button`                    | AddCartButton             |

---

## 📝 Form Rules

### Pattern: React Hook Form + Controller + Zod

```typescript
'use client';

import { Controller, useForm, zodResolver } from '@repo/shared';
import { ProductSchema, type ProductZodType } from '@repo/types';

export default function ProductForm() {
  const { control, handleSubmit } = useForm<ProductZodType>({
    resolver: zodResolver(ProductSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <TextInput {...field} error={fieldState.error?.message} />
        )}
      />
    </form>
  );
}
```

---

## 🔑 Data Keys Rules

> **RULE**: All TanStack Query keys must be defined centrally in `data-keys.ts`.

```typescript
// apps/web/lib/data-keys.ts

export const DataKeys = {
  admin: {
    products: {
      key: "admin-products" as const, // Root key (for invalidation)
      list: (search?: string, page: number = 1) =>
        ["admin-products", search, page] as const,
      detail: (slug: string) => ["admin-product", slug] as const,
      create: "admin-product-create", // Mutation key
    },
  },
} as const;
```

### Usage in Hooks

```typescript
// Query
useQuery({
  queryKey: DataKeys.admin.products.list(search, page),
  queryFn: () => fetchProducts(search, page),
});

// Mutation
useMutation({
  mutationKey: [DataKeys.admin.products.create],
  mutationFn: createProduct,
  onSuccess: (_, __, ___, context) => {
    // Invalidate all product lists via root key
    context.client.invalidateQueries({
      queryKey: [DataKeys.admin.products.key],
    });
  },
});
```

---

## 🌍 i18n Rules

Translation files: `apps/web/i18n/messages/{locale}.json`

```typescript
// Server Component
import { getTranslations } from "next-intl/server";
const t = await getTranslations("Products");

// Client Component
("use client");
import { useTranslations } from "next-intl";
const t = useTranslations("Products");
```

---

## 📍 Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHERE DOES EVERYTHING GO?                     │
├─────────────────────────────────────────────────────────────────┤
│ Zod Schema        → packages/types/src/{domain}/                │
│ Prisma Type       → packages/types/src/{domain}/                │
│ Query Hook        → apps/web/hooks/ or hooks/admin/              │
│ Query Key         → apps/web/lib/data-keys.ts                   │
│ Global Component  → apps/web/app/components/                    │
│ Admin Component   → apps/web/app/(admin)/components/            │
│ User Component    → apps/web/app/(user)/components/             │
│ Feature Component → {feature}/components/                       │
│ Backend Endpoint  → apps/backend/src/{module}/                  │
│ Shared Utility    → packages/shared-packages/src/               │
│ Translation       → apps/web/i18n/messages/{locale}.json        │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ New Feature Checklist

Before adding a new feature, verify:

- [ ] Zod schema added to `@repo/types`
- [ ] Query key added to `data-keys.ts`
- [ ] Hook added under `apps/web/hooks/`
- [ ] Component placed in the correct folder
- [ ] Component follows naming conventions
- [ ] `'use client'` directive checked (needed or not)
- [ ] Error handling implemented
- [ ] Loading state implemented

---

## 🗄️ Database Import Pattern (Detailed)

### Why Two Different Exports?

Prisma generates two different entry points:

- `browser.js` – Types and enums only (browser-safe)
- `client.js` – Full PrismaClient (requires Node.js)

This project handles the separation as follows:

```typescript
// packages/database/src/client.ts (BROWSER-SAFE)
export * from "../generated/prisma/browser.js";
export * from "../generated/prisma/commonInputTypes.js";

// packages/database/src/index.ts (SERVER-ONLY)
import { PrismaClient } from "../generated/prisma/client.js";
export * from "../generated/prisma/client.js";
export const prisma = new PrismaClient({ adapter });
```

---

### Usage Scenarios

| Scenario                 | Import Path             | Description             |
| ------------------------ | ----------------------- | ----------------------- |
| Client Component (React) | `@repo/database/client` | Types and enums only    |
| Server Component (Next)  | `@repo/database`        | prisma instance allowed |
| Server Action            | `@repo/database`        | prisma instance allowed |
| Backend (NestJS)         | `@repo/database`        | prisma instance allowed |
| packages/types           | `@repo/database/client` | Types only              |

---

### Example Usage

```typescript
// ✅ In Client Components
"use client";
import type { Product, User } from "@repo/database/client";
import { Locale, Currency } from "@repo/database/client"; // Enums OK
import { Prisma } from "@repo/database/client"; // Namespace OK

// ❌ NEVER in Client Components
("use client");
import { prisma } from "@repo/database"; // APP WILL CRASH!

// ✅ In Server Components / Server Actions
import { prisma } from "@repo/database";
import type { Product } from "@repo/database"; // both work here

// ✅ In Backend (NestJS) Services
import { prisma } from "@repo/database";
import type { User, Prisma } from "@repo/database";
```

---

## 🔷 Prisma Type Patterns

### Pattern 1: Query Object + GetPayload

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

### Pattern 2: Function-Based Query Builder

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

### Pattern 3: Nested Type Extraction

Extract nested types from complex payloads:

```typescript
export type ProductVariant = AdminProductType["variants"][number];
export type VariantPrice = ProductVariant["prices"][number];
export type ProductAsset = AdminProductType["assets"][number]["asset"];
```

---

### Pattern 4: Lightweight Types with Select

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

---

## 🚀 Turbo Commands

### Development

```bash
bun run dev                    # Start all apps
bun run --filter=web dev       # Web only
bun run --filter=backend dev   # Backend only
```

---

### Build

```bash
bun run build                  # Build all packages (runs db:generate first)
bun run --filter=web build     # Web only
bun run --filter=backend build # Backend only
```

---

### Database

```bash
bun run db:generate            # Generate Prisma client
bun run db:migrate             # Create/apply migrations (dev)
bun run db:deploy              # Apply migrations (prod)
bun run db:prisma              # Open Prisma Studio
```

---

### Quality Checks

```bash
bun run check-types            # TypeScript type check
bun run lint                   # ESLint
```

> **IMPORTANT:** Always run
> `bun run check-types && bun run lint` after refactors!

---

## ❌ Things You Must NOT Do

### 1. Import prisma in Client Components

```typescript
// ❌ WRONG – App will CRASH
"use client";
import { prisma } from "@repo/database";

// ✅ CORRECT – Types only
("use client");
import type { Product } from "@repo/database/client";
```

---

### 2. Import packages directly

```typescript
// ❌ WRONG
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

// ✅ CORRECT
import { z } from "@repo/types";
import { useQuery, useForm } from "@repo/shared";
```

---

### 3. Import PrismaClient directly

```typescript
// ❌ WRONG
import { PrismaClient } from "@prisma/client";

// ✅ CORRECT
import { prisma } from "@repo/database";
```

---

### 4. Use named exports

```typescript
// ❌ WRONG
export function ProductCard() {}
export const ProductCard = () => {};

// ✅ CORRECT
export default function ProductCard() {}
```

---

### 5. Add unnecessary prefixes to component names

```typescript
// ❌ WRONG (folder already defines scope)
AdminBrandSelect.tsx; // under (admin)/components
GlobalPagination.tsx; // under components

// ✅ CORRECT
BrandSelect.tsx;
Pagination.tsx;
```

---

### 6. Forget the 'use client' directive

```typescript
// ❌ WRONG – uses useState/useEffect
export default function Button() {
  const [state, setState] = useState(); // ERROR
}

// ✅ CORRECT
("use client");
export default function Button() {
  const [state, setState] = useState();
}
```

---

### 7. Define query keys inline

```typescript
// ❌ WRONG
useQuery({
  queryKey: ["products", search, page],
  queryFn: fetchProducts,
});

// ✅ CORRECT
useQuery({
  queryKey: DataKeys.admin.products.list(search, page),
  queryFn: fetchProducts,
});
```

---

## 🎨 Design System Types

This project includes a new design system. Related types live here:

**Location:** `packages/types/src/design/`

---

### Component Type Enum

```typescript
// packages/types/src/common/enums.ts
export const DesignComponentType = {
  SLIDER: "SLIDER",
  MARQUEE: "MARQUEE",
  PRODUCT_CAROUSEL: "PRODUCT_CAROUSEL",
  CATEGORY_GRID: "CATEGORY_GRID",
} as const;

export type DesignComponentType =
  (typeof DesignComponentType)[keyof typeof DesignComponentType];
```

---

### Zod Schema Pattern

```typescript
// packages/types/src/design/design-zod-schemas.ts
import { z } from "zod";
import { DesignComponentType, MantineSize } from "../common";

export const DesignProductCarouselSchema = z.object({
  type: z.literal(DesignComponentType.PRODUCT_CAROUSEL),
  title: z.string().min(1).max(256).nullish(),
  products: z.array(DesignProductSchema).min(1),
  settings: z.object({
    mobileCount: z.number().int().min(1).max(12).default(2),
    desktopCount: z.number().int().min(1).max(12).default(6),
  }),
});

// Discriminated union for all components
export const DesignComponentsSchema = z.discriminatedUnion("type", [
  DesignProductCarouselSchema,
  DesignSliderSchema,
  DesignMarqueeSchema,
]);
```

---

_Last updated: 2026-01-24_
