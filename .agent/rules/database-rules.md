---
trigger: always_on
---

# Database Import Rules

## Why Two Different Exports?

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

## Usage Scenarios

| Scenario                 | Import Path             | Description             |
| ------------------------ | ----------------------- | ----------------------- |
| Client Component (React) | `@repo/database/client` | Types and enums only    |
| Server Component (Next)  | `@repo/database`        | prisma instance allowed |
| Server Action            | `@repo/database`        | prisma instance allowed |
| Backend (NestJS)         | `@repo/database`        | prisma instance allowed |
| packages/types           | `@repo/database/client` | Types only              |

---

## Example Usage

```typescript
// ✅ In Client Components
'use client';
import type { Product, User } from "@repo/database/client";
import { Locale, Currency } from "@repo/database/client"; // Enums OK
import { Prisma } from "@repo/database/client"; // Namespace OK

// ❌ NEVER in Client Components
'use client';
import { prisma } from "@repo/database"; // APP WILL CRASH!

// ✅ In Server Components / Server Actions
import { prisma } from "@repo/database";
import type { Product } from "@repo/database"; // both work here

// ✅ In Backend (NestJS) Services
import { prisma } from "@repo/database";
import type { User, Prisma } from "@repo/database";
```
