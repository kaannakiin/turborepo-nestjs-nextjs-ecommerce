'use client';

import { getSortProductPageLabel } from '@lib/helpers';
import { Button, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReservedKeysType, getParamKey } from '@repo/shared';
import { FiltersResponse, ProductPageSortOption, TreeNode } from '@repo/types';
import { IconAdjustments, IconArrowsSort } from '@tabler/icons-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import FilterDrawer from './FilterDrawer';
import SortDrawer from './SortDrawer';

export interface FilterData {
  categories?: string[];
  brands?: string[];
  tags?: string[];
  variants: Record<string, string[]>;
  priceRange?: {
    min?: number;
    max?: number;
  };
}
export type PageType = 'categories' | 'brands' | 'tags';

interface QueryFiltersProps {
  filters: FiltersResponse;
  currentSort: ProductPageSortOption;
  onFilterChange: (params: URLSearchParams) => void;
  pageType: PageType;
  treeNode?: TreeNode;
}

const QueryFilters = ({
  filters,
  currentSort,
  onFilterChange,
  pageType,
  treeNode,
}: QueryFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filterOpened, { open: openFilter, close: closeFilter }] =
    useDisclosure(false);
  const [sortOpened, { open: openSort, close: closeSort }] =
    useDisclosure(false);

  const getParamFromUrl = useCallback(
    (key: ReservedKeysType): string[] => {
      const paramKey = getParamKey(key);
      return searchParams.get(paramKey)?.split(',').filter(Boolean) || [];
    },
    [searchParams],
  );

  const setParamInUrl = useCallback(
    (params: URLSearchParams, key: ReservedKeysType, values?: string[]) => {
      const paramKey = getParamKey(key);
      if (values && values.length > 0) {
        params.set(paramKey, values.join(','));
      } else {
        params.delete(paramKey);
      }
    },
    [],
  );

  const getCurrentFilterData = useCallback((): FilterData => {
    const categories = getParamFromUrl('categories');
    const brands = getParamFromUrl('brands');
    const tags = getParamFromUrl('tags');

    const variants: Record<string, string[]> = {};
    filters.variantGroups?.forEach((group) => {
      const groupSlug = group.translations[0]?.slug;
      if (groupSlug) {
        const options =
          searchParams.get(groupSlug)?.split(',').filter(Boolean) || [];
        if (options.length > 0) {
          variants[groupSlug] = options;
        }
      }
    });

    const minPrice = searchParams.get(getParamKey('minPrice'));
    const maxPrice = searchParams.get(getParamKey('maxPrice'));

    return {
      categories: categories.length > 0 ? categories : undefined,
      brands: brands.length > 0 ? brands : undefined,
      tags: tags.length > 0 ? tags : undefined,
      variants,
      priceRange:
        minPrice || maxPrice
          ? {
              min: minPrice ? Number(minPrice) : undefined,
              max: maxPrice ? Number(maxPrice) : undefined,
            }
          : undefined,
    };
  }, [searchParams, filters, getParamFromUrl]);

  const handleFilterApply = useCallback(
    (filterData: FilterData) => {
      const params = new URLSearchParams(searchParams.toString());

      setParamInUrl(params, 'categories', filterData.categories);
      setParamInUrl(params, 'brands', filterData.brands);
      setParamInUrl(params, 'tags', filterData.tags);

      filters.variantGroups?.forEach((group) => {
        const groupSlug = group.translations[0]?.slug;
        if (groupSlug) params.delete(groupSlug);
      });

      Object.entries(filterData.variants).forEach(([groupSlug, options]) => {
        if (options.length > 0) {
          params.set(groupSlug, options.join(','));
        }
      });

      if (filterData.priceRange?.min) {
        params.set(
          getParamKey('minPrice'),
          filterData.priceRange.min.toString(),
        );
      } else {
        params.delete(getParamKey('minPrice'));
      }

      if (filterData.priceRange?.max) {
        params.set(
          getParamKey('maxPrice'),
          filterData.priceRange.max.toString(),
        );
      } else {
        params.delete(getParamKey('maxPrice'));
      }

      params.delete(getParamKey('page'));

      onFilterChange(params);
      closeFilter();
    },
    [searchParams, filters, onFilterChange, closeFilter, setParamInUrl],
  );

  const handleSortApply = useCallback(
    (sortValue: ProductPageSortOption) => {
      const params = new URLSearchParams(searchParams.toString());

      const index = Object.values(ProductPageSortOption).indexOf(sortValue);
      params.set(getParamKey('sort'), index.toString());
      params.delete(getParamKey('page'));

      router.push(`?${params.toString()}`, { scroll: false });
      closeSort();
    },
    [searchParams, router, closeSort],
  );

  const handleClearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const currentSort = searchParams.get(getParamKey('sort'));
    if (currentSort) params.set(getParamKey('sort'), currentSort);

    onFilterChange(params);
    closeFilter();
  }, [searchParams, onFilterChange, closeFilter]);

  return (
    <>
      <Group gap="sm" justify="flex-end">
        <Button
          variant="transparent"
          rightSection={<IconAdjustments size={18} />}
          onClick={openFilter}
          size="input-md"
          color="black"
        >
          Filtrele
        </Button>

        <Button
          variant="transparent"
          rightSection={<IconArrowsSort size={18} />}
          onClick={openSort}
          size="input-md"
          color="black"
        >
          {getSortProductPageLabel(currentSort)}
        </Button>
      </Group>

      <FilterDrawer
        opened={filterOpened}
        onClose={closeFilter}
        filters={filters}
        selectedData={getCurrentFilterData()}
        onApply={handleFilterApply}
        onClear={handleClearFilters}
        pageType={pageType}
        treeNode={treeNode}
      />

      <SortDrawer
        opened={sortOpened}
        onClose={closeSort}
        currentSort={currentSort}
        onApply={handleSortApply}
      />
    </>
  );
};

export default QueryFilters;
