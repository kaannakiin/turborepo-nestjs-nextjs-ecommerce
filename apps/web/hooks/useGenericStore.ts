import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { getParamKey, useInfiniteQuery, useQuery } from '@repo/shared';
import { CategoryProductsResponse, FiltersResponse } from '@repo/types';

interface UseStoreInfinityQueryProps {
  queryKey: string[];
  endPoint: string;
  slug: string;
  currentParams: string;
  staleTime?: number;
}

export const useStoreInfinityQuery = ({
  queryKey,
  endPoint,
  slug,
  currentParams,
  staleTime,
}: UseStoreInfinityQueryProps) => {
  return useInfiniteQuery({
    queryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const queryString = currentParams
        ? `${currentParams}&${getParamKey('page')}=${pageParam}`
        : `${getParamKey('page')}=${pageParam}`;

      const url = `/${endPoint}/${slug}?${queryString}`;
      const response = await fetchWrapper.get<CategoryProductsResponse>(url);

      if (!response.success) throw new Error('Veri alınamadı');
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    staleTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

interface UseStoreFiltersProps {
  queryKey: string[];
  endPoint: string;
  slug: string;
  currentParams: string;
  staleTime?: number;
}

export const useStoreFilters = ({
  queryKey,
  endPoint,
  slug,
  currentParams,
  staleTime,
}: UseStoreFiltersProps) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      const queryString = currentParams || '';
      const url = `/${endPoint}/${slug}/filters${queryString ? `?${queryString}` : ''}`;

      const response = await fetchWrapper.get<FiltersResponse>(url);

      if (!response.success) throw new Error('Filtreler alınamadı');
      return response.data;
    },
    staleTime,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
