import { $Enums, Prisma } from "@repo/database";
import * as z from "zod";
import { FileSchema, htmlDescriptionSchema } from "./product-schemas";

export const CategoryTranslationSchema = z.object({
  locale: z.enum($Enums.Locale),
  name: z
    .string()
    .min(1, "Kategori adı en az 1 karakter olabilir")
    .max(256, "Kategori adı en fazla 256 karakter olabilir"),
  slug: z
    .string()
    .min(1, "Kategori slug'ı en az 1 karakter olabilir")
    .max(256, "Kategori slug'ı en fazla 256 karakter olabilir"),
  description: htmlDescriptionSchema,
  metaTitle: z
    .string({ error: "Meta başlığı zorunludur" })
    .max(256, {
      error: " Meta başlığı en fazla 256 karakter olabilir",
    })
    .optional()
    .nullable(),
  metaDescription: z
    .string({ error: "Meta açıklaması zorunludur" })
    .max(512, { error: "Meta açıklaması en fazla 512 karakter olabilir" })
    .optional()
    .nullable(),
});

export const CategorySchema = z.object({
  uniqueId: z.cuid2("Geçersiz kategori kimliği"),
  translations: z
    .array(CategoryTranslationSchema)
    .refine(
      (val) => {
        const isTRLocaleExists = val.some((t) => t.locale === "TR");
        return isTRLocaleExists;
      },
      {
        error: "En az bir Türkçe (TR) çeviri eklemelisiniz",
      }
    )
    .refine(
      (val) => {
        const locales = val.map((t) => t.locale);
        const uniqueLocales = new Set(locales);
        return locales.length === uniqueLocales.size;
      },
      {
        error: "Her dil için yalnızca bir çeviri ekleyebilirsiniz",
      }
    ),
  parentId: z.cuid2().optional().nullable(),
  image: FileSchema({ type: "IMAGE" }).optional().nullable(),
  existingImage: z
    .url({ error: "Geçersiz resim URL'si" })
    .optional()
    .nullable(),
});

export type AdminCategoryTableData = Prisma.CategoryGetPayload<{
  include: {
    translations: {
      select: {
        name: true;
        locale: true;
        slug: true;
      };
    };
    image: {
      select: {
        url: true;
      };
    };
    parentCategory: {
      include: {
        translations: {
          select: {
            name: true;
            locale: true;
          };
        };
      };
    };
    _count: {
      select: {
        childCategories: true;
        products: true;
      };
    };
  };
}>;
export type CategorySelectType = Prisma.CategoryGetPayload<{
  select: {
    id: true;
    translations: {
      select: {
        locale: true;
        name: true;
      };
    };
  };
}>;
export interface TaxonomyCategoryWithChildren {
  id: string;
  googleId: string;
  parentId: string | null;
  path: string | null;
  pathNames: string | null;
  depth: number;
  originalName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  children?: TaxonomyCategoryWithChildren[];
}
export type GoogleTaxonomyCategory = Prisma.TaxonomyCategoryGetPayload<{
  select: {
    id: true;
    originalName: true;
    _count: {
      select: {
        children: true;
      };
    };
    children: {
      select: {
        id: true;
        originalName: true;
        _count: {
          select: {
            children: true;
          };
        };
      };
    };
  };
}>;

export type Category = z.infer<typeof CategorySchema>;
export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;

export type CategoryIdAndName = {
  id: string;
  name: string;
};

export type CategoryHeaderData = {
  id: string;
  translations: {
    locale: $Enums.Locale;
    name: string;
    slug: string;
  }[];
  allChildCategories?: {
    id: string;
    translations: {
      locale: $Enums.Locale;
      name: string;
      slug: string;
    }[];
  }[];
  productImages: Array<{
    url: string;
    type: $Enums.AssetType;
  }>;
};
export type CategoryPageChildCategories = {
  parentId: string;
  id: string;
  level: number;
  translations: Prisma.CategoryTranslationGetPayload<{
    select: {
      locale: true;
      name: true;
      slug: true;
    };
  }>[];
  image: { url: string; type: $Enums.AssetType } | null;
};
export type CategoryPageParentCategories = {
  parentId: string | null;
  id: string;
  level: number;
  translations: Prisma.CategoryTranslationGetPayload<{
    select: {
      locale: true;
      name: true;
      slug: true;
    };
  }>[];
  image: { url: string; type: $Enums.AssetType } | null;
};

export type CategoryHierarchyNode = {
  id: string;
  name: string;
  slug: string;
  level: number;
  type: "parent" | "child";
};
export interface ProductPrice {
  currency: $Enums.Currency;
  price: number;
  buyedPrice?: number;
  discountedPrice?: number;
}

export interface ProductTranslation {
  locale: $Enums.Locale;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductAsset {
  order: number;
  url: string;
  type: $Enums.AssetType;
}
export interface ProductUnifiedViewData {
  id: string;
  productId: string;
  combinationId?: string;
  // entryType: $Enums.EntryType;
  entryType: "product" | "variant";
  sku?: string;
  barcode?: string;
  type: $Enums.ProductType;
  stock: number;
  active: boolean;
  isProductActive: boolean;
  brandId?: string;
  taxonomyCategoryId?: string;
  prices: ProductPrice[];
  productTranslations: ProductTranslation[];
  productAssets: ProductAsset[];
  categories: Array<{ id: string; name: string; slug: string }>;
  variantTranslation?: ProductTranslation;
  variantAssets?: ProductAsset[];
  variantOptions?: Array<{
    variantGroupSlug: string;
    variantOptionSlug: string;
    name: string;
  }>;
}

export type GetCategoryProductsResponse = {
  success: boolean;
  message?: string;
  products?: ProductUnifiedViewData[];
  pagination?: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
};
