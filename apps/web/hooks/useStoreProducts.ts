import { DataKeys } from '@lib/data-keys';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { useQuery } from '@repo/shared';
import { ProductDetailType, ProductPageDataType } from '@repo/types';

export const useProductDetail = (slug: string) => {
  return useQuery({
    queryKey: DataKeys.products.detail(slug),
    queryFn: async () => {
      const response = await fetchWrapper.get<ProductDetailType>(
        `/product/${slug}`,
      );
      if (!response.success) throw new Error('Ürün alınamadı');
      return response.data;
    },
    enabled: !!slug,
  });
};

export const useSimilarProducts = (productId: string) => {
  return useQuery({
    queryKey: DataKeys.products.similar(productId),
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        totalCount: number;
        products: ProductPageDataType[];
      }>('/users/products/similar-products/' + productId);
      if (!res.success) {
        return null;
      }
      return res.data;
    },
    enabled: !!productId,
  });
};
