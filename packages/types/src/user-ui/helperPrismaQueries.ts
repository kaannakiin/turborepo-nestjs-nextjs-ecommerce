import { Prisma } from "@repo/database/client";
import * as z from "zod";
export const ProductAndVariantWhereInput: Prisma.ProductWhereInput = {
  OR: [
    {
      active: true,
      isVariant: false,
      stock: {
        gt: 0,
      },
      prices: {
        some: {
          price: {
            gt: 0,
          },
        },
      },
    },
    {
      active: true,
      isVariant: true,
      variantCombinations: {
        some: {
          active: true,
          stock: {
            gt: 0,
          },
          prices: {
            some: {
              price: {
                gt: 0,
              },
            },
          },
        },
      },
    },
  ],
};

export type CategoryPagePreparePageReturnData = {
  success: boolean;
  message: string;
  category: Prisma.CategoryTranslationGetPayload<{
    include: {
      category: {
        select: {
          image: {
            select: {
              url: true;
              type: true;
            };
          };
        };
      };
    };
  }> | null;
  variantGroups:
    | Prisma.VariantGroupGetPayload<{
        select: {
          translations: {
            select: {
              name: true;
              locale: true;
              slug: true;
            };
          };
          type: true;
          options: {
            where: {
              productVariantOptions: {
                some: {
                  combinations: {
                    some: {
                      combination: {
                        active: true;
                        stock: {
                          gt: 0;
                        };
                        product: {
                          active: true;
                          isVariant: true;
                          categories: {
                            some: {
                              categoryId: { in: string[] };
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
            };
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
      }>[]
    | null;
  brands:
    | Prisma.BrandGetPayload<{
        select: {
          translations: true;
          image: {
            select: {
              url: true;
              type: true;
            };
          };
        };
      }>[]
    | null;
  hiearchy: {
    parentCategories?: Array<{
      id: string;
      name: string;
      slug: string;
      level: number;
    }>;
    childrenCategories?: Array<{
      id: string;
      name: string;
      slug: string;
      level: number;
    }>;
  } | null;
};
export const GetCategoryProductsSchema = z.object({
  categoryIds: z.array(z.string()).catch([]),
  page: z.number().int().min(1).catch(1),
  sort: z.number().int().min(1).catch(1),
  query: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .default({}),
});

export type GetCategoryProductsZodType = z.infer<
  typeof GetCategoryProductsSchema
>;
