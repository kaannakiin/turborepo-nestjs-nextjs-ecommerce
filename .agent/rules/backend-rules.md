---
trigger: always_on
---

# Backend Rules (NestJS)

## Controller Pattern

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

## Zod Validation

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

## DTO Pattern (nestjs-zod)

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

## API Endpoint Structure

| Prefix     | Usage          | Auth              |
| ---------- | -------------- | ----------------- |
| `/admin/*` | Admin panel    | JWT + ADMIN/OWNER |
| `/auth/*`  | Authentication | Public / JWT      |
| `/cart/*`  | Cart           | Optional JWT      |
| `/*`       | Public         | Public            |
