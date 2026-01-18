import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery } from '@repo/shared';
import {
  BrandIdAndName,
  BrandTableApiResponse,
  BrandZodType,
} from '@repo/types';

const fetchBrands = async (search?: string, page: number = 1) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('page', page.toString());

  const result = await fetchWrapper.get<BrandTableApiResponse>(
    `/admin/products/brands?${params}`,
  );

  if (!result.success) {
    throw new Error('Markalar yüklenirken bir hata oluştu');
  }

  return result.data;
};

const fetchBrandDetail = async (brandId: string) => {
  const res = await fetchWrapper.get<BrandZodType>(
    `/admin/products/brands/get-brand-form-value/${brandId}`,
  );

  if (!res.success) {
    const error = res as ApiError;
    throw new Error(error.error || 'Failed to fetch brand data');
  }

  return res.data;
};

const createOrUpdateBrand = async (data: Omit<BrandZodType, 'image'>) => {
  const result = await fetchWrapper.post<{ brandId: string }>(
    '/admin/products/brands/create-or-update-brand',
    data,
  );

  if (!result.success) {
    const error = result as ApiError;
    throw new Error(error.error || 'Marka kaydedilirken bir hata oluştu');
  }

  return result.data;
};

const uploadBrandImage = async ({
  file,
  brandId,
}: {
  file: File;
  brandId: string;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetchWrapper.postFormData(
    `/admin/products/brands/upload-brand-image/${brandId}`,
    formData,
  );

  if (!result.success) {
    const error = result as ApiError;
    throw new Error(error.error || 'Resim yüklenirken bir hata oluştu');
  }

  return result.data;
};

const deleteBrandImage = async (fileUrl: string) => {
  const result = await fetchWrapper.delete(
    `/admin/products/brands/delete-brand-image/${encodeURIComponent(fileUrl)}`,
  );

  if (!result.success) {
    throw new Error('Resim silinirken bir hata oluştu');
  }

  return result.data;
};

const deleteBrand = async (brandId: string) => {
  const result = await fetchWrapper.delete<{ message: string }>(
    `/admin/products/brands/delete-brand/${brandId}`,
  );

  if (!result.success) {
    throw new Error('Marka silinirken bir hata oluştu');
  }

  return result.data;
};

export const useBrands = (search?: string, page: number = 1) => {
  return useQuery({
    queryKey: DataKeys.admin.brands.list(search, page),
    queryFn: () => fetchBrands(search, page),
  });
};

export const useBrandDetail = (brandId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: DataKeys.admin.brands.detail(brandId),
    queryFn: () => fetchBrandDetail(brandId),
    enabled: enabled && !!brandId && brandId !== 'new',
  });
};

export const useCreateOrUpdateBrand = () => {
  return useMutation({
    mutationKey: [DataKeys.admin.brands.createOrUpdate],
    mutationFn: createOrUpdateBrand,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.brands.key],
      });
    },
  });
};

export const useUploadBrandImage = () => {
  return useMutation({
    mutationKey: [DataKeys.admin.brands.uploadImage],
    mutationFn: uploadBrandImage,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.brands.key],
      });
    },
  });
};

export const useDeleteBrandImage = () => {
  return useMutation({
    mutationKey: [DataKeys.admin.brands.deleteImage],
    mutationFn: deleteBrandImage,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.brands.key],
      });
    },
  });
};

export const useDeleteBrand = () => {
  return useMutation({
    mutationKey: [DataKeys.admin.brands.delete],
    mutationFn: deleteBrand,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.brands.key],
      });
    },
  });
};

export const useAllBrandsSimple = (enabled: boolean = true) => {
  return useQuery({
    queryKey: DataKeys.admin.brands.allSimple,
    queryFn: async () => {
      const response = await fetchWrapper.get<BrandIdAndName[]>(
        '/admin/products/brands/get-all-brands-only-id-and-name',
      );
      if (!response.success) {
        throw new Error('Veri alınamadı');
      }
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
