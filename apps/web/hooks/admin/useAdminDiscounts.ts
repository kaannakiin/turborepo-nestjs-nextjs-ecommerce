import { DataKeys } from '@lib/data-keys';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { DiscountConditionType } from '@repo/database/client';
import { useQuery } from '@repo/shared';
import {
  DiscountItem,
  GetAllDiscountReturnType,
  MainDiscount,
} from '@repo/types';

export const useAdminDiscounts = ({
  page = 1,
  type,
}: {
  page?: number;
  type?: string | null;
}) => {
  return useQuery({
    queryKey: DataKeys.discounts.list(type ?? undefined, page),
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllDiscountReturnType>(
        `/admin/discounts/get-discounts`,
        {
          params: {
            page,
            ...(type ? { type } : {}),
          },
        },
      );
      if (!res.success) {
        throw new Error('Failed to fetch discounts');
      }

      if (!res.data.success || !res.data.data || !res.data.pagination) {
        throw new Error(res.data.message);
      }

      return { data: res.data.data, pagination: res.data.pagination };
    },
  });
};

export const useDiscountConditionData = (type: DiscountConditionType) => {
  return useQuery({
    queryKey: DataKeys.discounts.conditionData(type),
    queryFn: async () => {
      let endpoint = '';
      if (type === DiscountConditionType.PRODUCT) {
        endpoint = '/admin/products/get-all-products-and-its-subs';
      } else if (type === DiscountConditionType.BRAND) {
        endpoint = '/admin/products/brands/get-all-brands-and-its-subs';
      } else if (type === DiscountConditionType.CATEGORY) {
        endpoint = '/admin/products/categories/get-all-category-and-its-subs';
      } else {
        return [];
      }

      const res = await fetchWrapper.get<DiscountItem[]>(endpoint);

      if (!res.success) {
        return [];
      }

      return res.data;
    },
    enabled: !!type,
  });
};

export const useAdminDiscountDetail = (slug: string) => {
  return useQuery({
    queryKey: DataKeys.discounts.detail(slug),
    queryFn: async () => {
      if (!slug || slug === 'new') {
        return null;
      }
      const res = await fetchWrapper.get<MainDiscount>(
        '/admin/discounts/' + slug,
      );
      if (!res.success) {
        return null;
      }
      return res.data;
    },
  });
};
