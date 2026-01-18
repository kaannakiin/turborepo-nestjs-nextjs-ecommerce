import { DataKeys } from '@lib/data-keys';
import { getBulkActionMessages } from '@lib/ui/bulk-action.helper';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@repo/shared';
import {
  AdminProductTableProductData,
  BaseProductZodType,
  Pagination,
  ProductBulkAction,
  SearchableProductModalData,
  SearchableProductModalResponseType,
  TaxonomyCategoryWithChildren,
  UpSellProductReturnType,
  VariantGroupZodType,
  VariantProductZodType,
} from '@repo/types';

type ProductsResponse = {
  products: AdminProductTableProductData[];
  pagination?: Pagination;
};
const fetchProducts = async (
  search?: string,
  page: number = 1,
  limit = 20,
): Promise<ProductsResponse> => {
  const response = await fetchWrapper.get<ProductsResponse>(`/admin/products`, {
    params: {
      search: search?.trim(),
      page,
      limit,
    },
  });

  if (!response.success) {
    throw new Error('Ürünler yüklenirken hata oluştu');
  }
  return response.data;
};

export const useProductList = (
  search?: string,
  page: number = 1,
  limit = 20,
) => {
  return useQuery({
    queryKey: DataKeys.admin.products.list(search, page),
    queryFn: () => fetchProducts(search, page, limit),
    refetchOnWindowFocus: false,
  });
};

export const useGetProduct = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: DataKeys.admin.products.detail(slug),
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
    queryKey: DataKeys.admin.products.variants,
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
    queryKey: DataKeys.admin.products.googleTaxonomy,
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
    mutationKey: [DataKeys.admin.products.createBasic],
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
    mutationKey: [DataKeys.admin.products.createVariant],
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
    mutationKey: [DataKeys.admin.products.uploadImage],
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
    mutationKey: [DataKeys.admin.products.uploadVariantFile],
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
    mutationKey: [DataKeys.admin.products.deleteAsset],
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
    mutationKey: [DataKeys.admin.products.deleteOptionAsset],
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

export interface BulkActionPayload {
  action: ProductBulkAction;
  productIds: string[];
  categoryId?: string;
  brandId?: string;
  tagIds?: string[];
  taxonomyId?: string;
  supplierId?: string;
  percent?: number;
  amount?: number;
  stock?: number;
  reason?: string;
}

interface BulkActionResult {
  success: boolean;
  affectedCount: number;
}

interface UseProductBulkActionOptions {
  needsRefresh?: boolean;
  onSuccess?: (data: BulkActionResult) => void;
  onError?: (error: Error) => void;
}

const productBulkAction = async (
  payload: BulkActionPayload,
): Promise<BulkActionResult> => {
  const response = await fetchWrapper.post<BulkActionResult>(
    '/admin/products/bulk-action',
    payload,
  );

  if (!response.success) {
    const error = response as ApiError;
    throw new Error(error.error || 'İşlem başarısız');
  }

  return response.data;
};

export const useProductBulkAction = (
  options: UseProductBulkActionOptions = {},
) => {
  const { needsRefresh = true, onSuccess, onError } = options;

  return useMutation({
    mutationKey: [DataKeys.admin.products.bulkAction],
    mutationFn: productBulkAction,
    onMutate: (payload) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.show({
        id: `bulk-action-${payload.action}`,
        loading: true,
        title: 'İşlem yapılıyor',
        message: messages.loading,
        autoClose: false,
      });
    },
    onSuccess: (data, payload, _, context) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.update({
        id: `bulk-action-${payload.action}`,
        loading: false,
        title: 'Başarılı',
        message: `${messages.success} (${data.affectedCount} ürün)`,
        color: 'green',
        autoClose: 3000,
      });

      if (needsRefresh) {
        context.client.invalidateQueries({
          queryKey: [DataKeys.admin.products.key],
        });
      }

      onSuccess?.(data);
    },
    onError: (error, payload) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.update({
        id: `bulk-action-${payload.action}`,
        loading: false,
        title: 'Hata',
        message: error instanceof Error ? error.message : messages.error,
        color: 'red',
        autoClose: 5000,
      });

      onError?.(error instanceof Error ? error : new Error('Bilinmeyen hata'));
    },
  });
};

export const useAdminUpsellPreview = (
  productId?: string,
  variantId?: string,
) => {
  return useQuery({
    queryKey: DataKeys.products.upsellPreview(variantId || productId || ''),
    queryFn: async () => {
      const res = await fetchWrapper.get<UpSellProductReturnType>(
        '/admin/products/get-product-variant-admin-overview-upsell-card-data',
        {
          params: {
            id: variantId || productId || '',
            iv: !!variantId,
          },
        },
      );
      if (!res.success) {
        throw new Error('Ürün verisi alınamadı.');
      }
      if (!res.data.success) {
        throw new Error(res.data.message);
      }
      return res.data.product;
    },
    enabled: !!(productId || variantId),
  });
};

export const useAdminSearchableProductsModal = ({
  search,
  opened,
  queryKey,
}: {
  search: string;
  opened: boolean;
  queryKey?: string[];
}) => {
  return useQuery({
    queryKey: queryKey || DataKeys.products.searchableModal(search),
    queryFn: async () => {
      const res = await fetchWrapper.post<SearchableProductModalData>(
        `/admin/products/get-admin-searchable-product-modal-data`,
        {
          ...(search ? { search } : {}),
          page: 1,
        },
      );
      if (!res.success) {
        throw new Error('Failed to fetch products');
      }
      return res.data;
    },
    enabled: opened,
  });
};

export const useAdminSelectableProducts = ({
  page,
  limit,
  search,
  enabled = true,
}: {
  page: number;
  limit: number;
  search?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: DataKeys.products.selectableModal(page, limit, search || ''),
    queryFn: async () => {
      const res = await fetchWrapper.get<SearchableProductModalResponseType>(
        '/admin/themev2/selectable-products',
        {
          params: { limit, page, search: search ? search.trim() : undefined },
        },
      );
      if (!res.success) throw new Error('Failed to fetch products');
      if (!res.data.success) throw new Error('Failed to fetch products data');
      return res.data;
    },
    enabled,
  });
};
