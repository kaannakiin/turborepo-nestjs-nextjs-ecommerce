import { $Enums, Prisma } from "@repo/database";
import * as z from "zod";
import {
  FileSchema,
  htmlDescriptionSchema,
  ProductCardProps,
} from "./product-schemas";

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

export type Category = z.infer<typeof CategorySchema>;
export type CategoryTranslation = z.infer<typeof CategoryTranslationSchema>;

export type CategoryIdAndName = {
  id: string;
  name: string;
};

export type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: {
    translations: true;
    image: {
      select: {
        url: true;
        type: true;
      };
    };
  };
}>;
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

export type CategoryPageDataType = {
  id: string;
  level: number;
  translations: Prisma.CategoryTranslationGetPayload<{
    select: {
      locale: true;
      metaTitle: true;
      metaDescription: true;
      name: true;
      slug: true;
      description: true;
    };
  }>[];
  image: { url: string; type: $Enums.AssetType } | null;
  childCategories: CategoryPageChildCategories[];
  parentCategories: CategoryPageParentCategories[];
};

export type getCategoryParentsReturnType = Array<{
  id: string;
  parentCategoryId: string | null;
  level: number;
  name: string | null;
  slug: string | null;
  locale: $Enums.Locale | null;
  imageId: string | null;
  image_url: string | null;
  image_type: $Enums.AssetType | null;
}>;

export type CategoryPageData = Prisma.CategoryGetPayload<{
  include: {
    translations: true;
    products: { select: { productId: true } };

    image: {
      select: {
        url: true;
        type: true;
      };
    };
  };
}>;

export type CategoryPageBrandType = Prisma.BrandGetPayload<{
  select: {
    id: true;
    translations: true;
    image: { select: { url: true; type: true } };
  };
}>;

export type CategoryVariantGroupType = Prisma.VariantGroupGetPayload<{
  select: {
    id: true;
    type: true;
    translations: true;
    options: {
      select: {
        id: true;
        asset: { select: { url: true; type: true } };
        hexValue: true;
        translations: true;
      };
    };
  };
}>;

export type GetCategoryPageReturnType = {
  category: CategoryPageDataType;
  variantGroups: CategoryVariantGroupType[];
  brands: CategoryPageBrandType[];
};
export type CategoryPageProductsType = Prisma.ProductGetPayload<{
  include: {
    translations: true;
    assets: {
      orderBy: {
        order: "asc";
      };
      select: {
        asset: {
          select: {
            url: true;
            type: true;
          };
        };
      };
    };
    taxonomyCategory: true;
    prices: true;
    brand: {
      select: {
        translations: true;
        image: {
          select: {
            url: true;
            type: true;
          };
        };
      };
    };
    variantGroups: {
      orderBy: {
        order: "asc";
      };
      take: 1;
      include: {
        options: {
          orderBy: {
            order: "asc";
          };
          include: {
            combinations: {
              take: 1;
              orderBy: {
                productVariantOption: {
                  order: "asc";
                };
              };
              include: {
                combination: {
                  include: {
                    prices: true;
                    translations: true;
                    assets: {
                      orderBy: {
                        order: "asc";
                      };
                      select: {
                        asset: {
                          select: {
                            url: true;
                            type: true;
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
            variantOption: {
              select: {
                translations: true;
                hexValue: true;
                asset: {
                  select: {
                    url: true;
                    type: true;
                  };
                };
              };
            };
          };
        };
        variantGroup: {
          include: {
            translations: true;
          };
        };
      };
    };
  };
}>;

export type CategoryPageProductsReturnType = {
  products: ProductCardProps[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};
