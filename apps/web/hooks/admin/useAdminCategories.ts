import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@repo/shared';
import {
  AdminCategoryTableReturnType,
  CategoryIdAndName,
  CategoryZodType,
} from '@repo/types';

interface CategoryGroup {
  group: string;
  items: Array<{ value: string; label: string; disabled?: boolean }>;
}

const fetchCategories = async (
  search: string,
  page: number,
  limit: number,
): Promise<AdminCategoryTableReturnType> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await fetchWrapper.get<AdminCategoryTableReturnType>(
    `/admin/products/categories?${params}`,
  );

  if (!response.success) {
    throw new Error('Kategoriler yüklenirken bir hata oluştu');
  }

  return response.data;
};

const fetchParentCategories = async (categoryId?: string) => {
  const params = categoryId ? { excludeId: categoryId } : {};

  const result = await fetchWrapper.get<CategoryGroup[]>(
    `/admin/products/categories/get-all-categories-for-select`,
    { params },
  );

  if (!result.success) {
    throw new Error('Üst kategoriler yüklenirken bir hata oluştu');
  }

  return result.data;
};

const fetchCategoryDetail = async (categoryId: string) => {
  const res = await fetchWrapper.get<CategoryZodType>(
    `/admin/products/categories/get-category-form-value/${categoryId}`,
  );

  if (!res.success) {
    const error = res as ApiError;
    throw new Error(error.error || 'Failed to fetch category data');
  }

  return res.data;
};

const createOrUpdateCategory = async (data: Omit<CategoryZodType, 'image'>) => {
  const result = await fetchWrapper.post<{ categoryId: string }>(
    '/admin/products/categories/create-or-update-category',
    data,
  );

  if (!result.success) {
    throw new Error('Kategori kaydedilirken bir hata oluştu');
  }

  return result.data;
};

const uploadCategoryImage = async ({
  file,
  uniqueId,
}: {
  file: File;
  uniqueId: string;
}) => {
  const formData = new FormData();
  formData.append('file', file);

  const result = await fetchWrapper.postFormData(
    `/admin/products/categories/upload-category-image/${uniqueId}`,
    formData,
  );

  if (!result.success) {
    throw new Error('Kategori resmi yüklenirken bir hata oluştu');
  }

  return result.data;
};

const deleteCategoryImage = async (fileUrl: string) => {
  const result = await fetchWrapper.delete(
    `/admin/products/categories/delete-category-image/${encodeURIComponent(fileUrl)}`,
  );

  if (!result.success) {
    throw new Error('Resim silinirken bir hata oluştu');
  }

  return result.data;
};

const deleteCategory = async (id: string) => {
  const response = await fetchWrapper.delete<{
    success: boolean;
    message: string;
  }>(`/admin/products/categories/delete-category/${id}`);

  if (!response.success) {
    const error = response as ApiError;
    throw new Error(error.error || 'Kategori silinirken bir hata oluştu');
  }

  return response.data;
};

export const useCategories = (
  search: string,
  page: number,
  limit: number = 20,
): UseQueryResult<AdminCategoryTableReturnType, Error> => {
  return useQuery({
    queryKey: DataKeys.admin.categories.list(search, page, limit),
    queryFn: () => fetchCategories(search, page, limit),
    refetchOnWindowFocus: false,
  });
};

export const useParentCategories = (
  currentCategoryId?: string,
): UseQueryResult<CategoryGroup[], Error> => {
  return useQuery({
    queryKey: DataKeys.admin.categories.parents(currentCategoryId),
    queryFn: () => fetchParentCategories(currentCategoryId),
  });
};

export const useCategoryDetail = (
  categoryId: string,
  enabled: boolean = true,
): UseQueryResult<CategoryZodType, Error> => {
  return useQuery({
    queryKey: DataKeys.admin.categories.detail(categoryId),
    queryFn: () => fetchCategoryDetail(categoryId),
    enabled: enabled && !!categoryId && categoryId !== 'new',
    retry: 1,
  });
};

export const useCreateOrUpdateCategory = (): UseMutationResult<
  { categoryId: string },
  Error,
  Omit<CategoryZodType, 'image'>,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.admin.categories.createOrUpdate],
    mutationFn: createOrUpdateCategory,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.categories.key],
      });
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.categories.parentKey],
      });
    },
  });
};

export const useUploadCategoryImage = (): UseMutationResult<
  unknown,
  Error,
  {
    file: File;
    uniqueId: string;
  },
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.admin.categories.uploadImage],
    mutationFn: uploadCategoryImage,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.categories.key],
      });
      context.client.invalidateQueries({
        queryKey: DataKeys.admin.categories.detail(variables.uniqueId),
      });
    },
  });
};

export const useDeleteCategoryImage = (): UseMutationResult<
  unknown,
  Error,
  string,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.admin.categories.deleteImage],
    mutationFn: deleteCategoryImage,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.categories.key],
      });
    },
  });
};

export const useDeleteCategory = (): UseMutationResult<
  {
    success: boolean;
    message: string;
  },
  Error,
  string,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.admin.categories.delete],
    mutationFn: deleteCategory,
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.categories.key],
      });
    },
  });
};

export const useAllCategoriesSimple = (
  enabled: boolean = true,
): UseQueryResult<CategoryIdAndName[], Error> => {
  return useQuery({
    queryKey: DataKeys.admin.categories.allSimple,
    queryFn: async () => {
      const response = await fetchWrapper.get<CategoryIdAndName[]>(
        '/admin/products/categories/get-all-categories-only-id-and-name',
      );
      if (!response.success) {
        throw new Error('Kategoriler alınamadı');
      }
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};
