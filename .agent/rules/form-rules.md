---
trigger: always_on
---

# Form Rules

## Pattern: React Hook Form + Controller + Zod

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

## Key Points

1. Always use `'use client'` directive for form components
2. Import `useForm`, `Controller`, `zodResolver` from `@repo/shared`
3. Import Zod schemas from `@repo/types`
4. Use `Controller` for controlled inputs with Mantine components
5. Access errors via `fieldState.error?.message`
