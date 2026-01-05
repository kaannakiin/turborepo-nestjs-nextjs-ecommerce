import { Prisma } from "@repo/database/client";
import { Pagination } from "../common";

export type AdminBrandTableData = Prisma.BrandGetPayload<{
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
    parentBrand: {
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
        childBrands: true;
        products: true;
      };
    };
  };
}>;

export type BrandSelectType = Prisma.BrandGetPayload<{
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
export type BrandsResponse = {
  success: boolean;
  data: AdminBrandTableData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
};

export const adminBrandTableQuery = {
  translations: true,
  id: true,
  parentBrandId: true,
  image: { select: { url: true, type: true } },
  parentBrand: {
    select: {
      translations: true,
    },
  },
  _count: {
    select: {
      childBrands: true,
      products: true,
    },
  },
  createdAt: true,
} as const satisfies Prisma.BrandSelect;

export type AdminBrandTableBrandData = Prisma.BrandGetPayload<{
  select: typeof adminBrandTableQuery;
}>;
export type BrandTableApiResponse = {
  success: boolean;
  brands?: AdminBrandTableBrandData[];
  pagination?: Pagination;
};

export type BrandIdAndName = {
  id: string;
  name: string;
};
