# Design Component Geliştirme Rehberi

Bu rehber, theme editor'a yeni design component eklemek için kapsamlı bir kılavuzdur.

---

## Zorunlu Schema Alanları

### Component Schema (ZORUNLU)

Her yeni component için **kesinlikle** olması gereken alanlar:

```typescript
{
  uniqueId: z.cuid2(),                           // ZORUNLU - Her objede olmalı
  type: z.literal(DesignComponentType.XXX),      // ZORUNLU - Discriminator
  // ... component'e özgü alanlar
}
```

### Nested Item Schema (ZORUNLU - eğer item varsa)

```typescript
{
  uniqueId: z.cuid2(),                           // ZORUNLU - Her item'da
  order: z.number().int().default(0),            // ZORUNLU - Sıralama için
  // ... item'a özgü alanlar
}
```

### Yaygın Kullanılan Alan Tipleri

| Alan Tipi | Zod Schema                                      | Açıklama           |
| --------- | ----------------------------------------------- | ------------------ |
| Görsel    | `FileSchema({ type: ["IMAGE"], error: "..." })` | Resim yükleme      |
| Renk      | `colorHex.nullish()`                            | #RRGGBB formatı    |
| Boyut     | `z.enum(MantineSize).default("lg")`             | xs, sm, md, lg, xl |
| Metin     | `z.string().min(1).max(256).nullish()`          | Opsiyonel metin    |
| Boolean   | `z.boolean({ error: "..." })`                   | Toggle alanı       |
| Sayı      | `z.int().min(1).max(100).default(5)`            | Sayısal değer      |

---

## 5 Adımlık Component Kayıt Süreci

### ADIM 1: Enum'a Ekle

**Dosya:** `packages/types/src/common/enums.ts`

```typescript
export const DesignComponentType = {
  SLIDER: "SLIDER",
  PRODUCT_CAROUSEL: "PRODUCT_CAROUSEL",
  HERO_BANNER: "HERO_BANNER", // ← YENİ COMPONENT
} as const;
```

---

### ADIM 2: Schema Oluştur

**Dosya:** `packages/types/src/design/design-zod-schemas.ts`

```typescript
// ==================== HERO BANNER SCHEMA ====================

// Item schema (varsa)
export const DesignHeroBannerSlideSchema = z.object({
  uniqueId: z.cuid2(),
  image: FileSchema({ type: ["IMAGE"], error: "Lütfen bir görsel yükleyin." }),
  title: z.string().min(1).max(256).nullish(),
  subtitle: z.string().min(1).max(512).nullish(),
  buttonText: z.string().min(1).max(64).nullish(),
  buttonLink: z.string().url({ error: "Geçerli bir URL giriniz." }).nullish(),
  order: z.number().int().default(0),
});

export type DesignHeroBannerSlideSchemaInputType = z.input<
  typeof DesignHeroBannerSlideSchema
>;

// Component schema
export const DesignHeroBannerSchema = z.object({
  uniqueId: z.cuid2(),
  type: z.literal(DesignComponentType.HERO_BANNER),
  height: z.int().min(200).max(1000).default(500),
  autoplay: z.boolean({ error: "Otomatik oynatma durumu gereklidir." }),
  autoplayInterval: z.int().min(1000).max(30000).default(5000),
  slides: z
    .array(DesignHeroBannerSlideSchema)
    .min(1, { error: "En az 1 slayt eklemelisiniz." }),
});

export type DesignHeroBannerSchemaInputType = z.input<
  typeof DesignHeroBannerSchema
>;
export type DesignHeroBannerSchemaOutputType = z.output<
  typeof DesignHeroBannerSchema
>;

// DiscriminatedUnion'a MUTLAKA ekle
export const DesignComponentsSchema = z.discriminatedUnion("type", [
  DesignProductCarouselSchema,
  DesignSliderSchema,
  DesignHeroBannerSchema, // ← YENİ EKLENEN
]);
```

---

### ADIM 3: Form/Preview Component'leri Oluştur

**Klasör:** `apps/web/app/(admin)/admin/theme/component-forms/hero-banner/`

#### 3.1 Ana Form Component (`HeroBannerForm.tsx`)

```typescript
'use client';

import { Card, NumberInput, Stack, Switch, Text } from '@mantine/core';
import { Controller } from '@repo/shared';
import {
  DesignHeroBannerSchema,
  type DesignHeroBannerSchemaInputType,
} from '@repo/types';

import { useComponentForm } from '../../hooks/useComponentForm';
import type { ComponentFormProps } from '../../registry/registry-types';
import HeroBannerSlideList from './HeroBannerSlideList';

export default function HeroBannerForm({ uniqueId }: ComponentFormProps) {
  const { control, handleFieldChange, data } = useComponentForm<
    typeof DesignHeroBannerSchema
  >(DesignHeroBannerSchema, uniqueId);

  if (!data) return null;
  const typedData = data as DesignHeroBannerSchemaInputType;

  return (
    <Stack gap="md">
      {/* Genel Ayarlar */}
      <Card withBorder>
        <Text size="sm" fw={500} mb="sm">
          Genel Ayarlar
        </Text>
        <Stack gap="xs">
          <Controller
            control={control}
            name="height"
            render={({ field, fieldState }) => (
              <NumberInput
                label="Yükseklik (px)"
                min={200}
                max={1000}
                {...field}
                onChange={(val) =>
                  handleFieldChange('height', val as number)
                }
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="autoplay"
            render={({ field }) => (
              <Switch
                label="Otomatik Oynat"
                checked={field.value}
                onChange={(e) =>
                  handleFieldChange('autoplay', e.currentTarget.checked)
                }
              />
            )}
          />
          {typedData.autoplay && (
            <Controller
              control={control}
              name="autoplayInterval"
              render={({ field, fieldState }) => (
                <NumberInput
                  label="Oynatma Aralığı (ms)"
                  min={1000}
                  max={30000}
                  step={500}
                  {...field}
                  onChange={(val) =>
                    handleFieldChange('autoplayInterval', val as number)
                  }
                  error={fieldState.error?.message}
                />
              )}
            />
          )}
        </Stack>
      </Card>

      {/* Slaytlar */}
      <Card withBorder>
        <Text size="sm" fw={500} mb="sm">
          Slaytlar ({typedData.slides?.length || 0})
        </Text>
        <HeroBannerSlideList parentUniqueId={uniqueId} />
      </Card>
    </Stack>
  );
}
```

#### 3.2 Preview Component (`HeroBannerPreview.tsx`)

```typescript
'use client';

import { Box, Image, Overlay, Text, Title } from '@mantine/core';

import type { ComponentPreviewProps } from '../../registry/registry-types';
import type { DesignHeroBannerSchemaInputType } from '@repo/types';

export default function HeroBannerPreview({
  data,
  isSelected,
  onSelect,
}: ComponentPreviewProps<DesignHeroBannerSchemaInputType>) {
  const firstSlide = data.slides?.[0];

  return (
    <Box
      onClick={onSelect}
      style={{
        cursor: 'pointer',
        outline: isSelected ? '2px solid var(--mantine-color-blue-5)' : 'none',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        height: data.height || 500,
        position: 'relative',
      }}
    >
      {firstSlide?.image && (
        <Image
          src={URL.createObjectURL(firstSlide.image)}
          alt={firstSlide.title || 'Hero Banner'}
          h="100%"
          fit="cover"
        />
      )}
      <Overlay gradient="linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)">
        <Box p="xl" style={{ position: 'absolute', bottom: 0, left: 0 }}>
          {firstSlide?.title && (
            <Title order={2} c="white">
              {firstSlide.title}
            </Title>
          )}
          {firstSlide?.subtitle && (
            <Text c="white" size="lg">
              {firstSlide.subtitle}
            </Text>
          )}
        </Box>
      </Overlay>
    </Box>
  );
}
```

#### 3.3 Item Form Component (`HeroBannerSlideForm.tsx`)

```typescript
'use client';

import { Card, ColorInput, Stack, Text, TextInput } from '@mantine/core';
import { Controller } from '@repo/shared';
import {
  DesignHeroBannerSlideSchema,
  type DesignHeroBannerSlideSchemaInputType,
} from '@repo/types';

import { useItemForm } from '../../hooks/useComponentForm';
import type { ItemFormProps } from '../../registry/registry-types';
import ImageUploadInput from '../common/ImageUploadInput';

export default function HeroBannerSlideForm({ uniqueId }: ItemFormProps) {
  const { control, handleFieldChange, data } = useItemForm<
    typeof DesignHeroBannerSlideSchema
  >(DesignHeroBannerSlideSchema, uniqueId);

  if (!data) return null;

  return (
    <Stack gap="md">
      <Card withBorder>
        <Text size="sm" fw={500} mb="sm">
          Görsel
        </Text>
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <ImageUploadInput
              value={field.value}
              onChange={(file) => handleFieldChange('image', file)}
              error={fieldState.error?.message}
            />
          )}
        />
      </Card>

      <Card withBorder>
        <Text size="sm" fw={500} mb="sm">
          İçerik
        </Text>
        <Stack gap="xs">
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }) => (
              <TextInput
                label="Başlık"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => handleFieldChange('title', e.target.value || null)}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="subtitle"
            render={({ field, fieldState }) => (
              <TextInput
                label="Alt Başlık"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => handleFieldChange('subtitle', e.target.value || null)}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="buttonText"
            render={({ field, fieldState }) => (
              <TextInput
                label="Buton Metni"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => handleFieldChange('buttonText', e.target.value || null)}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="buttonLink"
            render={({ field, fieldState }) => (
              <TextInput
                label="Buton Linki"
                placeholder="https://..."
                {...field}
                value={field.value ?? ''}
                onChange={(e) => handleFieldChange('buttonLink', e.target.value || null)}
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
```

#### 3.4 Item List Component (`HeroBannerSlideList.tsx`)

```typescript
'use client';

import { Stack, Text } from '@mantine/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { DesignHeroBannerSchemaInputType } from '@repo/types';

import { useDesignStore } from '../../store/design-store';
import HeroBannerSlidePreview from './HeroBannerSlidePreview';

interface Props {
  parentUniqueId: string;
}

export default function HeroBannerSlideList({ parentUniqueId }: Props) {
  const slides = useDesignStore((s) => {
    const parent = s.findByUniqueId<DesignHeroBannerSchemaInputType>(parentUniqueId);
    return parent?.slides ?? [];
  });

  const sortedSlides = [...slides].sort((a, b) => a.order - b.order);

  if (sortedSlides.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="md">
        Henüz slayt eklenmedi
      </Text>
    );
  }

  return (
    <SortableContext
      items={sortedSlides.map((s) => s.uniqueId)}
      strategy={verticalListSortingStrategy}
    >
      <Stack gap="xs">
        {sortedSlides.map((slide, index) => (
          <HeroBannerSlidePreview
            key={slide.uniqueId}
            slide={slide}
            index={index}
            parentUniqueId={parentUniqueId}
          />
        ))}
      </Stack>
    </SortableContext>
  );
}
```

#### 3.5 Item Preview Component (`HeroBannerSlidePreview.tsx`)

```typescript
'use client';

import { ActionIcon, Box, Group, Image, Text } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DesignHeroBannerSlideSchemaInputType } from '@repo/types';

import { useDesignStore, useIsSelected } from '../../store/design-store';
import type { ItemDragData } from '../../components/dnd/DndProvider';

interface Props {
  slide: DesignHeroBannerSlideSchemaInputType;
  index: number;
  parentUniqueId: string;
}

export default function HeroBannerSlidePreview({
  slide,
  index,
  parentUniqueId,
}: Props) {
  const isSelected = useIsSelected(slide.uniqueId);
  const select = useDesignStore((s) => s.select);
  const deleteByUniqueId = useDesignStore((s) => s.deleteByUniqueId);

  const dragData: ItemDragData = {
    type: 'item',
    uniqueId: slide.uniqueId,
    parentId: parentUniqueId,
    arrayKey: 'slides',
    index,
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: slide.uniqueId,
    data: dragData,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      onClick={() => select('item', slide.uniqueId, [parentUniqueId, slide.uniqueId])}
      sx={(theme) => ({
        padding: theme.spacing.sm,
        borderRadius: theme.radius.sm,
        border: `1px solid ${isSelected ? theme.colors.blue[5] : theme.colors.gray[3]}`,
        backgroundColor: isSelected ? theme.colors.blue[0] : 'white',
        cursor: 'pointer',
        '&:hover': {
          borderColor: theme.colors.blue[4],
        },
      })}
    >
      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="gray"
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab' }}
        >
          <IconGripVertical size={16} />
        </ActionIcon>

        {slide.image && (
          <Image
            src={URL.createObjectURL(slide.image)}
            alt={slide.title || 'Slide'}
            w={48}
            h={32}
            radius="sm"
            fit="cover"
          />
        )}

        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>
            {slide.title || 'Başlıksız Slayt'}
          </Text>
          {slide.subtitle && (
            <Text size="xs" c="dimmed" truncate>
              {slide.subtitle}
            </Text>
          )}
        </Box>

        <ActionIcon
          variant="subtle"
          color="red"
          onClick={(e) => {
            e.stopPropagation();
            deleteByUniqueId(slide.uniqueId);
          }}
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
```

---

### ADIM 4: Registry'ye Kaydet

**Dosya:** `apps/web/app/(admin)/admin/theme/registry/component-registry.ts`

```typescript
import { IconPhoto } from "@tabler/icons-react";
import { createId } from "@repo/shared";
import {
  DesignComponentType,
  DesignComponentCategory,
  type DesignHeroBannerSchemaInputType,
  type DesignHeroBannerSlideSchemaInputType,
} from "@repo/types";

import HeroBannerForm from "../component-forms/hero-banner/HeroBannerForm";
import HeroBannerPreview from "../component-forms/hero-banner/HeroBannerPreview";
import HeroBannerSlideForm from "../component-forms/hero-banner/HeroBannerSlideForm";
import HeroBannerSlidePreview from "../component-forms/hero-banner/HeroBannerSlidePreview";
import type { ComponentRegistryEntry } from "./registry-types";

const HeroBannerEntry: ComponentRegistryEntry<DesignHeroBannerSchemaInputType> =
  {
    type: DesignComponentType.HERO_BANNER,
    icon: IconPhoto,
    label: "Hero Banner",
    description: "Tam genişlik banner ile görsel ve metin",
    category: DesignComponentCategory.HERO,
    defaultValue: () => ({
      uniqueId: createId(),
      type: DesignComponentType.HERO_BANNER,
      height: 500,
      autoplay: true,
      autoplayInterval: 5000,
      slides: [
        {
          uniqueId: createId(),
          image: null as unknown as File,
          title: null,
          subtitle: null,
          buttonText: null,
          buttonLink: null,
          order: 0,
        },
      ],
    }),
    FormComponent: HeroBannerForm,
    PreviewComponent: HeroBannerPreview,
    itemConfig: {
      arrayKey: "slides",
      label: "Slayt",
      icon: IconPhoto,
      sortable: true,
      FormComponent: HeroBannerSlideForm,
      PreviewComponent: HeroBannerSlidePreview,
      defaultValue: (): DesignHeroBannerSlideSchemaInputType => ({
        uniqueId: createId(),
        image: null as unknown as File,
        title: null,
        subtitle: null,
        buttonText: null,
        buttonLink: null,
        order: 0,
      }),
    },
  };

// Registry'ye ekle
export const componentRegistry = {
  [DesignComponentType.SLIDER]: SliderEntry,
  [DesignComponentType.PRODUCT_CAROUSEL]: ProductCarouselEntry,
  [DesignComponentType.HERO_BANNER]: HeroBannerEntry, // ← YENİ
};
```

---

### ADIM 5: Export'ları Güncelle

**Dosya:** `packages/types/src/design/index.ts`

```typescript
export * from "./design-zod-schemas";
export * from "./design-default-values";
```

Yeni schema ve type'lar otomatik olarak export edilecektir.

---

## Kritik Kurallar

| Kural                  | Açıklama                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| **DiscriminatedUnion** | Yeni schema MUTLAKA `DesignComponentsSchema`'ya eklenMELİ            |
| **CUID2**              | ID için `createId()` from `@repo/shared` kullan                      |
| **Nullish**            | Opsiyonel alanlar için `.nullish()` kullan (null veya undefined)     |
| **Order Field**        | Sıralanabilir item'larda `order: z.number().int().default(0)`        |
| **handleFieldChange**  | Form + Store senkronizasyonu için (direkt `setValue` değil)          |
| **Turkish Messages**   | Tüm validation mesajları Türkçe olmalı                               |
| **Category**           | `DesignComponentCategory` enum'dan seç (HERO, CONTENT, PRODUCT, vb.) |
| **Complete Defaults**  | `defaultValue` factory tüm zorunlu alanları içermeli                 |

---

## Referans Dosyalar

| Dosya                               | Açıklama                                  |
| ----------------------------------- | ----------------------------------------- |
| `component-forms/slider/`           | Basit component örneği (tek seviye)       |
| `component-forms/product-carousel/` | Karmaşık component örneği (nested, modal) |
| `registry/component-registry.ts`    | Registry pattern                          |
| `store/design-store.ts`             | Zustand state management                  |
| `hooks/useComponentForm.ts`         | Form senkronizasyon hook'u                |
| `components/dnd/DndProvider.tsx`    | Drag-drop context                         |

---

## Form Input Tipleri

| Mantine Component     | Kullanım         |
| --------------------- | ---------------- |
| `TextInput`           | Metin alanları   |
| `NumberInput`         | Sayısal değerler |
| `ColorInput`          | Renk seçici      |
| `Switch`              | Boolean toggle   |
| `Select`              | Dropdown seçim   |
| `FileButton` / Custom | Dosya yükleme    |

---

## Checklist

Yeni component eklerken kontrol et:

- [ ] Enum'a eklendi mi? (`DesignComponentType`)
- [ ] Schema oluşturuldu mu? (`design-zod-schemas.ts`)
- [ ] Schema discriminatedUnion'a eklendi mi?
- [ ] Type export'ları yapıldı mı?
- [ ] Form component oluşturuldu mu?
- [ ] Preview component oluşturuldu mu?
- [ ] Item form/preview (varsa) oluşturuldu mu?
- [ ] Registry entry oluşturuldu mu?
- [ ] Default value tüm alanları içeriyor mu?
- [ ] itemConfig (varsa) tanımlandı mı?
- [ ] Turkish error messages eklendi mi?
