---
trigger: always_on
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
