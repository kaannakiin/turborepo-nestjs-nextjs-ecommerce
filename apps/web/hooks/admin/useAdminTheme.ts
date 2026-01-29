import { DataKeys } from '@lib/data-keys';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { keepPreviousData, useQuery, type UseQueryResult } from '@repo/shared';
import { ProductCart } from '@repo/types';

export const useThemeCarouselProducts = ({
  componentId,
  productIds,
  variantIds,
}: {
  componentId: string;
  productIds: string[];
  variantIds: string[];
}): UseQueryResult<
  {
    success: boolean;
    products: ProductCart[];
    variants: ProductCart[];
  },
  Error
> => {
  return useQuery({
    queryKey: DataKeys.products.themeCarousel(
      componentId,
      productIds,
      variantIds,
    ),
    queryFn: async ({ client }) => {
      if (productIds.length === 0 && variantIds.length === 0) {
        return { success: true, products: [], variants: [] };
      }

      const existingQueries = client.getQueriesData<{
        products: ProductCart[];
        variants: ProductCart[];
      }>({ queryKey: ['theme-carousel'] });

      const foundInCache = existingQueries.find(([_, cachedData]) => {
        if (!cachedData) return false;
        const hasAllProducts = productIds.every((id) =>
          cachedData.products.some((p) => p.id === id),
        );
        const hasAllVariants = variantIds.every((id) =>
          cachedData.variants.some((v) => v.id === id),
        );
        return hasAllProducts && hasAllVariants;
      });

      if (foundInCache) {
        const cachedData = foundInCache[1];
        return {
          products: cachedData.products.filter((p) =>
            productIds.includes(p.id),
          ),
          variants: cachedData.variants.filter((v) =>
            variantIds.includes(v.id),
          ),
          success: true,
        };
      }

      const response = await fetchWrapper.post<{
        success: boolean;
        products: ProductCart[];
        variants: ProductCart[];
      }>('/admin/themev2/carousel-products', {
        productIds,
        variantIds,
      });

      if (!response.success) throw new Error('Hata oluştu.');
      return response.data;
    },
    enabled: productIds.length > 0 || variantIds.length > 0,
    placeholderData: keepPreviousData,
  });
};
