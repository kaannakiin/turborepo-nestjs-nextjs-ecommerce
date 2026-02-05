# Design Component Quick Reference

## 1. File Locations
| What | Where |
|------|-------|
| Enum | `packages/types/src/common/enums.ts` → `DesignComponentType` |
| Schema | `packages/types/src/design/components/{name}.schema.ts` |
| Union | `packages/types/src/design/design-components.schema.ts` |
| Forms | `apps/web/app/(admin)/admin/theme/component-forms/{name}/` |
| Preview | `packages/ui/src/designs/modern/Modern{Name}.tsx` |
| Registry | `apps/web/app/(admin)/admin/theme/registry/component-registry.ts` |

## 2. Required Schemas

### Main Component
```typescript
z.object({
  uniqueId: z.cuid2(),                              // REQUIRED
  type: z.literal(DesignComponentType.XXX),         // REQUIRED
  breakPoints: componentBreakpointSchema,           // For grid/carousel
  // ... fields
})
```

### Nested Item
```typescript
z.object({
  uniqueId: z.cuid2(),                              // REQUIRED
  order: z.number().int().default(0),               // REQUIRED for sortable
  // ... fields
})
```

## 3. Common Field Patterns

| Type | Schema | Form Pattern |
|------|--------|--------------|
| Text | `z.string().nullish()` | `value={field.value \|\| ''} onChange={(e) => handleFieldChange(name, e.target.value \|\| null)}` |
| Color | `colorHex.nullish()` | `<ColorPickerInput value={field.value \|\| ''} onChange={(v) => handleFieldChange(name, v \|\| null)} />` |
| Number | `z.int().min().max()` | `<NumberInput value={field.value} onChange={(v) => handleFieldChange(name, v as number)} />` |
| Boolean | `z.boolean()` | `<Switch checked={field.value} onChange={(e) => handleFieldChange(name, e.currentTarget.checked)} />` |
| Image | `FileSchema({type: ["IMAGE"]}).nullish()` | Placeholder Box + Button |
| BreakPoints | `componentBreakpointSchema` | 3 NumberInputs (mobile/tablet/desktop) |

## 4. Form Component Template

```typescript
'use client';
import { Stack } from '@mantine/core';
import { Controller } from '@repo/shared';
import { ThemeFormCard } from '@repo/ui/cards';
import { Schema, SchemaInputType } from '@repo/types';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';

export default function XxxForm({ uniqueId }: ComponentFormProps) {
  const { control, handleFieldChange, data } = useComponentForm<typeof Schema>(Schema, uniqueId);
  if (!data) return null;
  const typedData = data as SchemaInputType;

  return (
    <Stack gap="md">
      {/* Fields with Controller + handleFieldChange */}
    </Stack>
  );
}
```

## 5. Item Form Template

```typescript
'use client';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

export default function XxxItemForm({ uniqueId, parentUniqueId }: ItemFormProps) {
  const { control, handleFieldChange, data } = useItemForm<typeof ItemSchema>(ItemSchema, uniqueId, parentUniqueId);
  if (!data) return null;
  // Same pattern as main form
}
```

## 6. Item List Template (with drag-drop)

```typescript
'use client';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { ItemDragData } from '../../components/dnd/DndProvider';
import { useDesignStore, useIsSelected } from '../../store/design-store';

// Key: dragData = { type: 'item', uniqueId, parentUniqueId, arrayKey: 'items', index }
// Key: e.stopPropagation() on delete click
```

## 7. Registry Entry Template

```typescript
const XxxEntry: ComponentRegistryEntry<XxxSchemaInputType> = {
  type: DesignComponentType.XXX,
  label: 'Label',
  description: 'Description',
  category: DesignComponentCategory.CONTENT,
  defaultValue: () => ({
    uniqueId: createId(),
    type: DesignComponentType.XXX,
    breakPoints: { mobile: 1, tablet: 2, desktop: 3 },
    items: [],
  }),
  FormComponent: XxxForm,
  PreviewComponent: ModernXxx,
  itemConfig: {  // Only if has items
    arrayKey: 'items',
    label: 'Öğe',
    sortable: true,
    FormComponent: XxxItemForm,
    PreviewComponent: XxxItemPreview,
    defaultValue: () => ({ uniqueId: createId(), order: 0, /* fields */ }),
    getItemLabel: (item, index) => item.title || `Öğe ${index + 1}`,
  },
};
```

## 8. BreakPoints Form Pattern

```typescript
<ThemeFormCard title="Sütun Sayıları">
  <Group grow>
    <Controller
      control={control}
      name="breakPoints.mobile"
      render={({ field }) => (
        <NumberInput
          label="Mobil"
          min={1}
          max={10}
          value={field.value || 1}
          onChange={(value) =>
            handleFieldChange('breakPoints', {
              ...typedData.breakPoints,
              mobile: value as number,
            })
          }
        />
      )}
    />
    {/* Repeat for tablet, desktop */}
  </Group>
</ThemeFormCard>
```

## 9. Critical Rules (NEVER violate)

1. **Always** use `handleFieldChange()` - NEVER direct `setValue()`
2. **Always** use `export default` for components
3. **Always** `'use client';` at top
4. **Always** `createId()` from `@repo/shared` for uniqueId
5. **Always** include `uniqueId` + `order` in item defaultValue
6. **Never** import zod from 'zod' - use from '@repo/types'
7. **Never** use named exports for components
8. **Turkish** validation messages

## 10. Checklist

- [ ] Enum added to `DesignComponentType`
- [ ] Schema created with uniqueId + type
- [ ] Schema added to discriminatedUnion
- [ ] Export added to design/index.ts
- [ ] Form components created (Form, ItemForm, ItemList, ItemPreview)
- [ ] Preview component created in UI package
- [ ] Registry entry added with defaultValue + itemConfig
- [ ] UI package export added
