# B2C E-Commerce Turborepo - Agent Kuralları

Bu doküman, bu projede çalışan AI agent'lar için **zorunlu kurallar** ve **yönergelerdir**.

---

## 🏗️ Proje Yapısı

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

## 📦 Package Kuralları

### `@repo/types` - Zod ve Tipler

> **KURAL**: Tüm Zod şemaları ve paylaşılan tipler SADECE burada tanımlanır.

```typescript
// ✅ DOĞRU
import { ProductSchema, type ProductZodType } from "@repo/types";
import { z, flattenError } from "@repo/types";

// ❌ YANLIŞ - Zod'u direkt import etme
import { z } from "zod";
```

**Dosya yapısı:**

```
packages/types/src/{domain}/
├── index.ts                    # Re-exports
├── {domain}-zod-schemas.ts     # Zod şemaları
└── {domain}-prisma-types.ts    # Prisma select/include types
```

### `@repo/database` - Prisma

> **KURAL**: Prisma tipleri `@repo/database/client`'dan import edilir.

```typescript
// ✅ DOĞRU
import { prisma } from "@repo/database";
import type { User, Product } from "@repo/database/client";
import { Locale, Currency } from "@repo/database/client"; // Enums

// ❌ YANLIŞ
import { PrismaClient } from "@prisma/client";
```

### `@repo/shared` - Ortak Kütüphaneler

> **KURAL**: TanStack Query ve React Hook Form SADECE buradan import edilir.

```typescript
// ✅ DOĞRU
import { useQuery, useMutation, useQueryClient } from "@repo/shared";
import { useForm, Controller, useFieldArray, zodResolver } from "@repo/shared";
import { createId } from "@repo/shared";
import { dateFns } from "@repo/shared";

// ❌ YANLIŞ
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
```

---

## 🔧 Backend Kuralları

### Controller Pattern

```typescript
// Admin endpoint - her zaman /admin prefix
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(["ADMIN", "OWNER"])
@Controller("admin/products")
export class ProductsController {}

// Public endpoint - prefix yok
@Controller("products")
export class PublicProductsController {}
```

### Zod Validation

```typescript
// Backend'de Zod şemalarını ZodValidationPipe ile kullan
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ProductSchema, type ProductZodType } from '@repo/types';

@Post()
async create(
  @Body(new ZodValidationPipe(ProductSchema))
  data: ProductZodType,
) {}
```

### DTO Pattern (nestjs-zod)

> **KURAL**: Backend DTO'ları `nestjs-zod`'un `createZodDto` fonksiyonu ile oluşturulur. Bu OpenAPI/Swagger uyumluluğu sağlar.

```typescript
// ✅ DOĞRU - nestjs-zod kullan
import { CreateProductSchema, UpdateProductSchema } from "@repo/types";
import { createZodDto } from "nestjs-zod";

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

// ❌ YANLIŞ - Manuel class tanımlama
export class CreateProductDto {
  name: string;
  price: number;
}
```

### API Endpoint Yapısı

| Prefix     | Kullanım       | Auth              |
| ---------- | -------------- | ----------------- |
| `/admin/*` | Admin panel    | JWT + ADMIN/OWNER |
| `/auth/*`  | Authentication | Public / JWT      |
| `/cart/*`  | Sepet          | Optional JWT      |
| `/*`       | Public         | Public            |

---

## 🎨 Frontend Kuralları

### Server vs Client Components

```typescript
// Server Component (default)
// ❌ 'use client' KULLANMA
export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Client Component
// ✅ 'use client' ile başla
'use client';

export default function Button() {
  const [state, setState] = useState();
  return <button onClick={() => setState()}>{state}</button>;
}
```

### Export Kuralı

> **KURAL**: Tüm component'ler **default export** kullanır.

```typescript
// ✅ DOĞRU
export default function ProductCard() {}

// ❌ YANLIŞ
export function ProductCard() {}
export const ProductCard = () => {};
```

---

## 📁 Component Yerleştirme Kuralları

```
app/components/           → Global/Shared (her yerde kullanılan)
app/(admin)/components/   → Admin-only
app/(user)/components/    → User-only
{feature}/components/     → Feature-specific (sadece o sayfada)
```

| Component Tipi        | Konum                 | Örnek                      |
| --------------------- | --------------------- | -------------------------- |
| Her yerde kullanılan  | `app/components/`     | Pagination, SearchInput    |
| Sadece admin'de       | `(admin)/components/` | BrandSelect, AdminLayout   |
| Sadece user'da        | `(user)/components/`  | ProductCard, CartDrawer    |
| Sadece bir feature'da | `feature/components/` | DiscountForm, ProductTable |

---

## ✏️ İsimlendirme Kuralları

### ❌ YAPMA

```typescript
// Global component'lere prefix ekleme
GlobalDropzone.tsx; // ❌
CustomSearchInput.tsx; // ❌
BaseButton.tsx; // ❌

// Scoped component'lere scope prefix ekleme
AdminBrandSelect.tsx; // ❌ (zaten admin/components altında)
UserProductCard.tsx; // ❌ (zaten user/components altında)

// Versiyon suffix
ComponentV2.tsx; // ❌
```

### ✅ YAP

```typescript
// Global - direkt isim
Dropzone.tsx;
SearchInput.tsx;
Pagination.tsx;

// Scoped - direkt isim (klasör zaten belli ediyor)
BrandSelect.tsx; // admin/components/form/
ProductCard.tsx; // user/components/

// Feature - feature prefix
ProductTable.tsx; // product-list/components/
DiscountForm.tsx; // discounts/components/
```

### Suffix Kuralları

| Tip          | Suffix                      | Örnek                     |
| ------------ | --------------------------- | ------------------------- |
| Form input   | `Input`, `Select`, `Picker` | BrandSelect, DatePicker   |
| Display card | `Card`                      | ProductCard, FormCard     |
| Modal/Drawer | `Modal`, `Drawer`           | DiscountModal, CartDrawer |
| Layout       | `Layout`, `Shell`           | AdminLayout, AppShell     |
| Loading      | `Skeleton`, `Loader`        | TableSkeleton, Loader     |
| Button       | `Button`                    | AddCartButton             |

---

## 📝 Form Kuralları

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

## 🔑 Data Keys Kuralları

> **KURAL**: Tüm TanStack Query key'leri `data-keys.ts`'de merkezi olarak tanımlanır.

```typescript
// apps/web/lib/data-keys.ts

export const DataKeys = {
  admin: {
    products: {
      key: "admin-products" as const, // Root key (invalidation için)
      list: (search?: string, page: number = 1) =>
        ["admin-products", search, page] as const,
      detail: (slug: string) => ["admin-product", slug] as const,
      create: "admin-product-create", // Mutation key
    },
  },
} as const;
```

### Hook'larda Kullanım

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
    // Root key ile tüm product listelerini invalidate et
    context.client.invalidateQueries({
      queryKey: [DataKeys.admin.products.key],
    });
  },
});
```

---

## 🌍 i18n Kuralları

Çeviri dosyaları: `apps/web/i18n/messages/{locale}.json`

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

## 📍 Hızlı Referans

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEREYE NE EKLENİR?                        │
├─────────────────────────────────────────────────────────────────┤
│ Zod Schema        → packages/types/src/{domain}/                │
│ Prisma Type       → packages/types/src/{domain}/                │
│ Query Hook        → apps/web/hooks/ veya hooks/admin/           │
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

## ✅ Yeni Özellik Checklist

Yeni özellik eklerken kontrol et:

- [ ] Zod schema `@repo/types`'a eklendi mi?
- [ ] Query key `data-keys.ts`'e eklendi mi?
- [ ] Hook `apps/web/hooks/` altına eklendi mi?
- [ ] Component doğru klasöre yerleştirildi mi?
- [ ] Component isimlendirme kurallarına uyuyor mu?
- [ ] `'use client'` directive gerekli mi değil mi kontrol edildi mi?
- [ ] Error handling eklendi mi?
- [ ] Loading state var mı?
