---
trigger: always_on
---

# Things You Must NOT Do

## 1. Import prisma in Client Components

```typescript
// ❌ WRONG – App will CRASH
'use client';
import { prisma } from "@repo/database";

// ✅ CORRECT – Types only
'use client';
import type { Product } from "@repo/database/client";
```

---

## 2. Import packages directly

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

## 3. Import PrismaClient directly

```typescript
// ❌ WRONG
import { PrismaClient } from "@prisma/client";

// ✅ CORRECT
import { prisma } from "@repo/database";
```

---

## 4. Use named exports

```typescript
// ❌ WRONG
export function ProductCard() {}
export const ProductCard = () => {};

// ✅ CORRECT
export default function ProductCard() {}
```

---

## 5. Add unnecessary prefixes to component names

```typescript
// ❌ WRONG (folder already defines scope)
AdminBrandSelect.tsx; // under (admin)/components
GlobalPagination.tsx; // under components

// ✅ CORRECT
BrandSelect.tsx;
Pagination.tsx;
```

---

## 6. Forget the 'use client' directive

```typescript
// ❌ WRONG – uses useState/useEffect
export default function Button() {
  const [state, setState] = useState(); // ERROR
}

// ✅ CORRECT
'use client';
export default function Button() {
  const [state, setState] = useState();
}
```

---

## 7. Define query keys inline

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
