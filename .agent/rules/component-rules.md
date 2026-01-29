---
trigger: always_on
---

# Component Rules

## Placement Rules

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

## Naming Rules

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

## Suffix Rules

| Type         | Suffix                      | Example                   |
| ------------ | --------------------------- | ------------------------- |
| Form input   | `Input`, `Select`, `Picker` | BrandSelect, DatePicker   |
| Display card | `Card`                      | ProductCard, FormCard     |
| Modal/Drawer | `Modal`, `Drawer`           | DiscountModal, CartDrawer |
| Layout       | `Layout`, `Shell`           | AdminLayout, AppShell     |
| Loading      | `Skeleton`, `Loader`        | TableSkeleton, Loader     |
| Button       | `Button`                    | AddCartButton             |
