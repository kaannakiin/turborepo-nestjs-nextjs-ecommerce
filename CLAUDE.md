# B2C E-Commerce Turborepo

This file is a **quick reference guide for Claude Code**.
For detailed information, see the `agents.md` file.

---

## Quick Start Commands

```bash
bun install          # Install dependencies
bun run dev          # Start all applications
bun run build        # Build all packages
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run database migrations
bun run check-types  # Type checking
bun run lint         # Linting
```

---

## ⚠️ CRITICAL RULE: Database Imports

### Browser / Client Side (types only)

```typescript
import type { User, Product } from "@repo/database/client";
import { Locale, Currency, Prisma } from "@repo/database/client";
```

### Server Side (including PrismaClient)

```typescript
import { prisma } from "@repo/database";
import type { User } from "@repo/database";
```

### WHY?

- `/client` → exports `generated/prisma/browser.js` (**NO server code**)
- Main export → contains `PrismaClient` instance (requires Node.js APIs)
- **NEVER use `@repo/database` in client components!**

---

## Package Import Rules

| Package                 | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `@repo/types`           | Zod schemas, TypeScript types, `z` export             |
| `@repo/shared`          | useQuery, useMutation, useForm, zodResolver, createId |
| `@repo/ui/modals`       | Modal components                                      |
| `@repo/ui/cards`        | Card components                                       |
| `@repo/ui/inputs`       | Form input components                                 |
| `@repo/database/client` | Prisma types (browser-safe)                           |
| `@repo/database`        | PrismaClient instance (server-only)                   |

```typescript
// ✅ CORRECT
import { z, ProductSchema, type ProductZodType } from "@repo/types";
import { useQuery, useMutation, useForm, zodResolver } from "@repo/shared";
import { DataSelectModal } from "@repo/ui/modals";
import type { User } from "@repo/database/client";

// ❌ WRONG
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { PrismaClient } from "@prisma/client";
```

---

## Project Structure

```
apps/
  backend/     # NestJS API (localhost:3001)
  web/         # Next.js 16 (Admin + User)
packages/
  database/    # Prisma schema + client
  types/       # Zod + TypeScript types
  shared/      # RHF, React Query, utils
  ui/          # UI components
```

---

## File Placement

| What             | Where                              |
| ---------------- | ---------------------------------- |
| Zod Schema       | `packages/types/src/{domain}/`     |
| Prisma Type      | `packages/types/src/{domain}/`     |
| Query Key        | `apps/web/lib/data-keys.ts`        |
| Admin Hook       | `apps/web/hooks/admin/`            |
| User Hook        | `apps/web/hooks/`                  |
| Admin Component  | `apps/web/app/(admin)/components/` |
| User Component   | `apps/web/app/(user)/components/`  |
| Global Component | `apps/web/app/components/`         |
| Backend Module   | `apps/backend/src/{module}/`       |
| Admin Endpoint   | `apps/backend/src/admin/{module}/` |

---

## Component Rules

- All components must use `export default`
- Client components must start with `'use client';`
- Do not use prefixes (`Global-`, `Admin-`, `Custom-`)
- Allowed suffixes: `Card`, `Modal`, `Drawer`, `Table`, `Form`, `Select`, `Input`

```typescript
// ✅ CORRECT
"use client";
export default function ProductCard() {}

// ❌ WRONG
export function AdminProductCard() {}
export const ProductCard = () => {};
```

---

## Backend DTO Pattern

```typescript
import { createZodDto } from "nestjs-zod";
import { CreateProductSchema } from "@repo/types";

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
```

---

## Form Pattern

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

## Design Component Geliştirme (Theme Editor)

Yeni design component eklemek için **5 adım** izle:

1. **Enum'a ekle** → `packages/types/src/common/enums.ts` (`DesignComponentType`)
2. **Schema oluştur** → `packages/types/src/design/design-zod-schemas.ts`
3. **Form/Preview oluştur** → `apps/web/app/(admin)/admin/theme/component-forms/`
4. **Registry'ye kaydet** → `apps/web/app/(admin)/admin/theme/registry/component-registry.ts`
5. **Export güncelle** → `packages/types/src/design/index.ts`

### Zorunlu Schema Alanları

```typescript
// Component için ZORUNLU
{
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.XXX),
}

// Nested item için ZORUNLU
{
  uniqueId: z.cuid2(),
  order: z.number().int().default(0),
}
```

### Kritik Kurallar

- Schema'yı `DesignComponentsSchema` discriminatedUnion'a ekle
- `handleFieldChange` kullan (direkt `setValue` değil)
- CUID2 için `createId()` from `@repo/shared`
- Validation mesajları Türkçe olmalı

→ **Detaylı rehber:** `.agent/design-component-guide.md`

---

→ **For more details:** `agents.md`
