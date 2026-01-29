import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { type UseQueryResult, useQuery } from '@repo/shared';
import { NewTaxonomyCategory } from '@repo/types';

export interface SimplifiedTaxonomyCategory {
  id: string;
  name: string;
  hasChildren: boolean;
  parentId: string | null;
}

const fetchCategoriesByParent = async (
  parentId: string | null,
): Promise<SimplifiedTaxonomyCategory[]> => {
  const url = parentId
    ? `/admin/products/google-categories/get-categories-by-parent-id?parentId=${parentId}`
    : `/admin/products/google-categories/get-categories-by-depth?depth=0`;
  const response = await fetchWrapper.get<NewTaxonomyCategory>(url);
  if (!response.success) {
    const errorMessage = response as ApiError;
    throw new Error(
      errorMessage.error || 'Failed to fetch Google Taxonomy categories',
    );
  }
  if (!response.data.success || !response.data.categories) {
    throw new Error('Failed to fetch Google Taxonomy categories');
  }
  const simplifiedData = response.data.categories.map((category) => ({
    id: category.id,
    name: category.originalName,
    hasChildren: category._count.children > 0,
    parentId: null,
  }));
  return simplifiedData;
};

const fetchCategoryBySearch = async (
  searchTerm: string,
): Promise<SimplifiedTaxonomyCategory[]> => {
  const response = await fetchWrapper.get<NewTaxonomyCategory>(
    `/admin/products/google-categories/search-categories?search=${encodeURIComponent(searchTerm)}`,
  );

  if (!response.success) {
    const errorMessage = response as ApiError;
    throw new Error(
      errorMessage.error || 'Failed to search Google Taxonomy categories',
    );
  }
  if (!response.data.success || !response.data.categories) {
    throw new Error('Failed to search Google Taxonomy categories');
  }

  const simplifiedData = response.data.categories.map((category) => ({
    id: category.id,
    name: category.originalName,
    hasChildren: category._count.children > 0,
    parentId: null,
  }));

  return simplifiedData;
};

const fetchAncestorIds = async (id: string): Promise<string[]> => {
  if (!id) return [];
  const response = await fetchWrapper.get<{ success: boolean; ids: string[] }>(
    `/admin/products/google-categories/get-ancestor-ids-by-id?id=${id}`,
  );
  if (!response.success || !response.data.ids) {
    throw new Error('Failed to fetch ancestor IDs');
  }
  return response.data.ids;
};

const fetchCategoryDetails = async (
  id: string,
): Promise<SimplifiedTaxonomyCategory> => {
  if (!id) throw new Error('ID required');
  const response = await fetchWrapper.get<{
    success: boolean;
    category: SimplifiedTaxonomyCategory;
  }>(`/admin/products/google-categories/get-category-details-by-id?id=${id}`);
  if (!response.success || !response.data.category) {
    throw new Error('Failed to fetch category details');
  }
  return response.data.category;
};

export const useGoogleTaxonomyCategories = (
  parentId: string | null,
): UseQueryResult<SimplifiedTaxonomyCategory[], Error> => {
  return useQuery({
    queryKey: DataKeys.googleTaxonomy.categories(parentId),
    queryFn: () => fetchCategoriesByParent(parentId),
  });
};

export const useGoogleTaxonomyDetails = (
  id: string | null,
): UseQueryResult<SimplifiedTaxonomyCategory, Error> => {
  return useQuery({
    queryKey: DataKeys.googleTaxonomy.details(id || ''),
    queryFn: () => fetchCategoryDetails(id!),
    enabled: !!id,
    staleTime: Infinity,
  });
};

export const useGoogleTaxonomyAncestors = (
  id: string | null,
  enabled: boolean,
): UseQueryResult<string[], Error> => {
  return useQuery({
    queryKey: DataKeys.googleTaxonomy.ancestors(id || ''),
    queryFn: () => fetchAncestorIds(id!),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGoogleTaxonomySearch = (
  term: string,
): UseQueryResult<SimplifiedTaxonomyCategory[], Error> => {
  return useQuery({
    queryKey: DataKeys.googleTaxonomy.search(term),
    queryFn: () => fetchCategoryBySearch(term),
    enabled: term.length > 0,
  });
};
