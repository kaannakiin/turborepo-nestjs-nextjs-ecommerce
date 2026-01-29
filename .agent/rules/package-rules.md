---
trigger: always_on
---

# Package Import Rules

## `@repo/types` – Zod & Types

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

## `@repo/database` – Prisma

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

## `@repo/shared` – Shared Libraries

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

## `@repo/ui` – UI Components

```typescript
// Subpath exports
import { DataSelectModal } from "@repo/ui/modals";
import { ProductCard } from "@repo/ui/cards";
import { SearchInput } from "@repo/ui/inputs";
import { Pagination } from "@repo/ui/common";
```
