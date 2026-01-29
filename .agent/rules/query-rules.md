---
trigger: always_on
---

# Query Rules (TanStack Query)

## Data Keys

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

---

## Usage in Hooks

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

## ❌ DO NOT

```typescript
// ❌ WRONG - inline query keys
useQuery({
  queryKey: ["products", search, page],
  queryFn: fetchProducts,
});

// ✅ CORRECT - use DataKeys
useQuery({
  queryKey: DataKeys.admin.products.list(search, page),
  queryFn: fetchProducts,
});
```
