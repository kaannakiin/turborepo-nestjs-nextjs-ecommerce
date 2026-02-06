---
trigger: glob
description: Design Component development guide for Theme Editor
globs: **/theme/**,**/design/**,**/packages/types/src/design/**,**/packages/ui/src/designs/**
---

# Design Component Development Guide

Bu rehber, Theme Editor sistemine yeni design component eklemek icin gerekli tum adimlari aciklar.

## Genel Bakis

Sistem 5 ana bilesenden olusur:

1. **Enum** - Component tipi tanimlamasi
2. **Schema** - Zod validation schemasi
3. **Form/ItemForm** - Admin panel form componentleri
4. **Preview** - Canlı onizleme componentleri
5. **Registry** - Component kayit sistemi

---

## ADIM 1: Enum Tanimlamasi

**Dosya:** `packages/types/src/common/enums.ts`

```typescript
export const DesignComponentType = {
  SLIDER: "SLIDER",
  PRODUCT_CAROUSEL: "PRODUCT_CAROUSEL",
  YOUR_COMPONENT: "YOUR_COMPONENT", // <- Ekle
} as const;
```

**Kategori Secimi:** Component icin uygun kategori sec:

- `HERO` - Slider, banner gibi tam genislik componentler
- `CONTENT` - Email signup, metin bloklari
- `PRODUCT` - Urun carousel, grid
- `NAVIGATION` - Menu, breadcrumb
- `SOCIAL` - Sosyal medya, yorumlar
- `UTILITY` - Ayirac, bosluk

---

## ADIM 2: Schema Olusturma

**Dosya:** `packages/types/src/design/components/{component-name}.schema.ts`

### 2.1 Temel Schema Yapisi

Her component icin ZORUNLU alanlar:

```typescript
import { z } from "zod";
import { colorHex, DesignComponentType } from "../../common";

export const Design{Component}Schema = z.object({
  // ZORUNLU: Her componentin benzersiz kimlik
  uniqueId: z.cuid2(),

  // ZORUNLU: Component tipi (discriminatedUnion icin)
  type: z.literal(DesignComponentType.YOUR_COMPONENT),

  // Component ozel alanlari...
});

// Type exports
export type Design{Component}SchemaInputType = z.input<typeof Design{Component}Schema>;
export type Design{Component}SchemaOutputType = z.output<typeof Design{Component}Schema>;
```

### 2.2 Nested Item Schema (Listeli Componentler)

Slider slide, carousel product gibi alt ogeler icin:

```typescript
export const Design{Component}ItemSchema = z.object({
  // ZORUNLU: Benzersiz kimlik
  uniqueId: z.cuid2(),

  // ZORUNLU: Siralama icin
  order: z.number().int().default(0),

  // Item ozel alanlari...
});

export type Design{Component}ItemSchemaInputType = z.input<typeof Design{Component}ItemSchema>;
export type Design{Component}ItemSchemaOutputType = z.output<typeof Design{Component}ItemSchema>;
```

### 2.3 Sik Kullanilan Schema Yardimcilari

```typescript
import {
  colorHex,                    // HEX renk validasyonu (#RRGGBB)
  aspectRatioSchema,           // En-boy orani (16/9, 4/3, vb.)
  componentBreakpointSchema,   // Responsive breakpoint'ler
  FileSchema,                  // Dosya yukleme
  MantineSize,                 // xs, sm, md, lg, xl
} from "../../common";

// Renk alani (opsiyonel)
titleColor: colorHex.nullish(),

// Boyut alani
titleSize: z.enum(MantineSize).default("lg"),

// Breakpoint alani
breakPoints: componentBreakpointSchema,

// Dosya yukleme
image: FileSchema({ type: ["IMAGE"], error: "Gorsel yukleyin." }),

// Mevcut asset (sunucudaki dosya)
existingAsset: z.object({
  url: z.url({ error: "Gecersiz URL." }),
  type: z.enum(AssetType, { error: "Gecersiz tip." }),
}).nullish(),
```

### 2.4 Validation Mesajlari

Tum mesajlar **Turkce** olmali:

```typescript
title: z
  .string()
  .min(1, { error: "Baslik en az 1 karakter olmali." })
  .max(256, { error: "Baslik en fazla 256 karakter olabilir." })
  .nullish(),
```

### 2.5 Conditional Validation (refine)

```typescript
export const ItemSchema = z.object({...})
  .refine(
    (data) => {
      if (data.isCustomBadgeActive) {
        return data.customBadgeText;
      }
      return true;
    },
    { error: "Badge aktif oldugunda yazi gereklidir." }
  );
```

---

## ADIM 3: Schema Export ve Union

### 3.1 Index Export

**Dosya:** `packages/types/src/design/index.ts`

```typescript
export * from "./components/{component-name}.schema";
```

### 3.2 DiscriminatedUnion'a Ekleme

**Dosya:** `packages/types/src/design/design-components.schema.ts`

```typescript
import { Design{Component}Schema } from "./components/{component-name}.schema";

export const DesignComponentsSchema = z.discriminatedUnion("type", [
  DesignSliderSchema,
  DesignProductCarouselSchema,
  Design{Component}Schema, // <- Ekle
]);
```

---

## ADIM 4: Props Tanimlari

**Dosya:** `packages/types/src/design/design-component-props.ts`

```typescript
import type { Design{Component}SchemaInputType } from "./components/{component-name}.schema";

// Component preview props
export type {Component}PreviewProps = BaseComponentPreviewProps<Design{Component}SchemaInputType>;

// Item preview props (varsa)
export type {Component}ItemPreviewProps = BaseItemPreviewProps<Design{Component}ItemSchemaInputType>;
```

---

## ADIM 5: Form Componentleri

**Konum:** `apps/web/app/(admin)/admin/theme/component-forms/{component-name}/`

### 5.1 Ana Form Component

**Dosya:** `{Component}Form.tsx`

```typescript
'use client';

import { Stack, Switch, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import { Design{Component}Schema, Design{Component}SchemaInputType } from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { useComponentForm } from '../../hooks/useComponentForm';
import { ComponentFormProps } from '../../registry/registry-types';

const {Component}Form = ({ uniqueId }: ComponentFormProps) => {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof Design{Component}Schema
  >(Design{Component}Schema, uniqueId);

  if (!data) return null;

  const typedData = data as Design{Component}SchemaInputType;

  return (
    <Stack gap="md">
      <ThemeFormCard title="Genel Ayarlar">
        <Stack gap="xs">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextInput
                label="Baslik"
                value={field.value || ''}
                onChange={(e) => handleFieldChange('title', e.currentTarget.value)}
              />
            )}
          />
        </Stack>
      </ThemeFormCard>
    </Stack>
  );
};

export default {Component}Form;
```

**KRITIK:** `handleFieldChange` kullan, direkt `setValue` degil!

### 5.2 Item Form Component (Listeli componentler icin)

**Dosya:** `{Component}ItemForm.tsx`

```typescript
'use client';

import { Stack, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import { Design{Component}ItemSchema } from '@repo/types';
import { ThemeFormCard } from '@repo/ui/cards';
import { useItemForm } from '../../hooks/useComponentForm';
import { ItemFormProps } from '../../registry/registry-types';

const {Component}ItemForm = ({ uniqueId, parentUniqueId }: ItemFormProps) => {
  const { control, handleFieldChange } = useItemForm(
    Design{Component}ItemSchema,
    uniqueId,
    parentUniqueId,
  );

  return (
    <Stack gap="md">
      <ThemeFormCard title="Oge Ayarlari">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextInput
              label="Baslik"
              value={field.value || ''}
              onChange={(e) => handleFieldChange('title', e.currentTarget.value)}
            />
          )}
        />
      </ThemeFormCard>
    </Stack>
  );
};

export default {Component}ItemForm;
```

---

## ADIM 6: Preview Componentleri

**Konum:** `packages/ui/src/designs/modern/{component-name}/`

### 6.1 Ana Preview

**Dosya:** `Modern{Component}.tsx`

```typescript
"use client";

import { Box, Text } from "@mantine/core";
import { {Component}PreviewProps } from "@repo/types";

export default function Modern{Component}({ data, media }: {Component}PreviewProps) {
  if (!data) {
    return (
      <Box p="xl" ta="center">
        <Text c="dimmed">Veri bulunamadi</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Component render logic */}
    </Box>
  );
}
```

### 6.2 Item Preview (Listeli componentler icin)

**Dosya:** `{Component}ItemPreview.tsx`

```typescript
"use client";

import { Box, Text } from "@mantine/core";
import { {Component}ItemPreviewProps } from "@repo/types";

export default function {Component}ItemPreview({ data, index, isSelected }: {Component}ItemPreviewProps) {
  return (
    <Box
      p="md"
      style={{
        border: isSelected ? "2px solid var(--mantine-color-blue-5)" : "1px solid var(--mantine-color-gray-3)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <Text>{data.title || `Oge ${index + 1}`}</Text>
    </Box>
  );
}
```

### 6.3 Export Dosyasi

**Dosya:** `packages/ui/src/designs/modern/{component-name}/index.ts`

```typescript
export { default as Modern{Component} } from "./Modern{Component}";
export { default as {Component}ItemPreview } from "./{Component}ItemPreview";
```

**Dosya:** `packages/ui/src/designs/modern/index.ts`

```typescript
export * from "./{component-name}";
```

---

## ADIM 7: Registry Kaydi

**Dosya:** `apps/web/app/(admin)/admin/theme/registry/component-registry.ts`

```typescript
import { createId } from '@repo/shared';
import {
  DesignComponentCategory,
  DesignComponentType,
  Design{Component}SchemaInputType,
} from '@repo/types';
import { Modern{Component}, {Component}ItemPreview } from '@repo/ui/designs';
import {Component}Form from '../component-forms/{component-name}/{Component}Form';
import {Component}ItemForm from '../component-forms/{component-name}/{Component}ItemForm';
import { ComponentRegistryEntry } from './registry-types';

const {Component}Entry: ComponentRegistryEntry<Design{Component}SchemaInputType> = {
  type: DesignComponentType.YOUR_COMPONENT,
  label: 'Component Adi',
  description: 'Component aciklamasi',
  category: DesignComponentCategory.CONTENT,

  defaultValue: (): Design{Component}SchemaInputType => ({
    uniqueId: createId(),
    type: DesignComponentType.YOUR_COMPONENT,
    title: null,
    // Diger default degerler...
  }),

  FormComponent: {Component}Form,
  PreviewComponent: Modern{Component},

  // Listeli component icin (opsiyonel)
  itemConfig: {
    arrayKey: 'items',  // Schema'daki array alani
    label: 'Oge',
    sortable: true,
    FormComponent: {Component}ItemForm,
    PreviewComponent: {Component}ItemPreview,
    defaultValue: (): Design{Component}SchemaInputType['items'][number] => ({
      uniqueId: createId(),
      order: 0,
      // Diger default degerler...
    }),
    getItemLabel: (item, index) => item.title || `Oge ${index + 1}`,
  },
};

// Registry'ye ekle
export const componentRegistry = {
  // ...mevcut componentler
  YOUR_COMPONENT: {Component}Entry,
};
```

---

## Checklist

Yeni component eklerken tum adimlari kontrol et:

- [ ] `DesignComponentType` enum'a eklendi
- [ ] Schema dosyasi olusturuldu (`{component-name}.schema.ts`)
- [ ] `uniqueId: z.cuid2()` ve `type: z.literal(...)` eklendi
- [ ] Item schema'da `uniqueId` ve `order` var
- [ ] `design-components.schema.ts` discriminatedUnion'a eklendi
- [ ] `packages/types/src/design/index.ts` export eklendi
- [ ] Props tanimlari `design-component-props.ts` dosyasina eklendi
- [ ] Form component(ler) olusturuldu
- [ ] Preview component(ler) olusturuldu
- [ ] `packages/ui/src/designs/modern/` export'lari guncellendi
- [ ] Registry entry olusturuldu ve `componentRegistry`'ye eklendi
- [ ] Default value fonksiyonu `createId()` kullaniyor
- [ ] Validation mesajlari Turkce

---

## Ornek: Basit Component (Itemsiz)

Email Signup gibi tek parca componentler icin `itemConfig` gerekli degil.

## Ornek: Listeli Component

Slider, Product Carousel gibi alt ogeleri olan componentler icin `itemConfig` zorunlu:

- `arrayKey`: Schema'daki array alani ismi
- `sortable`: Siralama aktif mi
- `getItemLabel`: Liste gorunumunde gosterilecek etiket

---

## Debugging

**Schema validation hatasi:** Zod error mesajlarini kontrol et
**Form guncellenmiyorsa:** `handleFieldChange` kullanildigini dogrula
**Preview render edilmiyorsa:** Props tiplerini kontrol et
**Registry hatasi:** `type` alaninin enum ile eslestgini dogrula
