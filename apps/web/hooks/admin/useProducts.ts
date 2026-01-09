import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery } from '@repo/shared';
import {
  BaseProductZodType,
  VariantProductZodType,
  VariantGroupZodType,
  TaxonomyCategoryWithChildren,
} from '@repo/types';

export const useGetProduct = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin-product', slug],
    queryFn: async () => {
      const response = await fetchWrapper.get<{
        success: boolean;
        product?: VariantProductZodType | BaseProductZodType;
      }>(`/admin/products/get-product/${slug}`);

      if (!response.success) {
        throw new Error('Failed to fetch product');
      }
      return response.data.product;
    },
    enabled: enabled && !!slug,
    retry: 1,
  });
};

export const useGetVariants = () => {
  return useQuery({
    queryKey: ['variants'],
    queryFn: async (): Promise<VariantGroupZodType[]> => {
      const response = await fetchWrapper.get<VariantGroupZodType[]>(
        `/admin/products/variants`,
      );
      if (!response.success) {
        throw new Error('Failed to fetch variants');
      }
      return response.data;
    },
  });
};

export const useGetGoogleTaxonomyCategories = () => {
  return useQuery({
    queryKey: ['googleTaxonomyCategoriesNoRoot'],
    queryFn: async (): Promise<TaxonomyCategoryWithChildren[]> => {
      const response = await fetchWrapper.get<TaxonomyCategoryWithChildren[]>(
        `/admin/products/google-categories/taxonomy`,
      );
      if (!response.success) {
        throw new Error(`Failed to fetch taxonomy categories`);
      }
      return response.data;
    },
    gcTime: Infinity,
    staleTime: Infinity,
    retryOnMount: false,
  });
};

export const useCreateOrUpdateBasicProduct = () => {
  return useMutation({
    mutationFn: async (
      productData: Omit<BaseProductZodType, 'images' | 'existingImages'>,
    ) => {
      const response = await fetchWrapper.post<{
        success: boolean;
        message: string;
        productId: string;
      }>(`/admin/products/basic-product`, productData);

      if (!response.success || !response.data.success) {
        throw new Error('Ürün işlemi sırasında bir hata oluştu.');
      }

      return response.data;
    },
  });
};

export const useCreateOrUpdateVariantProduct = () => {
  return useMutation({
    mutationFn: async (
      productData: Omit<VariantProductZodType, 'images' | 'existingImages'>,
    ) => {
      const response = await fetchWrapper.post<{
        productId: string;
        combinations: {
          id: string;
          sku: string | null;
        }[];
      }>(`/admin/products/variant-product`, productData);

      if (!response.success) {
        throw new Error(
          'Ürün kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.',
        );
      }

      return response.data;
    },
  });
};

export const useUploadProductImage = () => {
  return useMutation({
    mutationFn: async ({
      file,
      productId,
      order,
      variantId,
    }: {
      file: File;
      productId?: string;
      variantId?: string;
      order: number;
    }) => {
      const fd = new FormData();
      fd.append('file', file);
      if (productId) fd.append('productId', productId);
      if (variantId) fd.append('variantId', variantId);
      fd.append('order', String(order));

      return fetchWrapper.postFormData(
        `/admin/products/create-product-image`,
        fd,
      );
    },
  });
};

export const useUploadVariantOptionFile = () => {
  return useMutation({
    mutationFn: async ({
      file,
      uniqueId,
    }: {
      file: File;
      uniqueId: string;
    }) => {
      const fd = new FormData();
      fd.append('file', file);

      return fetchWrapper.postFormData(
        `/admin/products/variants/upload-variant-option-file/${uniqueId}`,
        fd,
      );
    },
  });
};

export const useDeleteProductAsset = () => {
  return useMutation({
    mutationFn: async (url: string) => {
      const response = await fetchWrapper.delete(
        `/admin/products/delete-product-asset?url=${encodeURIComponent(url)}`,
      );

      if (!response.success) {
        throw new Error('Resim silinemedi');
      }

      return response;
    },
  });
};

export const useDeleteOptionAsset = () => {
  return useMutation({
    mutationFn: async (imageUrl: string) => {
      const response = await fetchWrapper.delete(
        `/admin/products/delete-option-asset/${encodeURIComponent(imageUrl)}`,
      );

      if (!response.success) {
        throw new Error('Görsel silinirken bir hata oluştu.');
      }

      return response;
    },
  });
};
