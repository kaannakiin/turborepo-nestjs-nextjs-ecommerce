import { DataKeys } from '@lib/data-keys';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { useQuery, type UseQueryResult } from '@repo/shared';

type HierarchyType = 'brands' | 'categories' | 'tags';

type HierarchyItem = {
  nodeId: string;
  parentId: string | null;
  depth: number;
  name: string;
  slug: string;
  locale: string;
};

type SimplifiedHierarchyItem = {
  id: string;
  name: string;
  slug: string;
  depth: number;
  parentId: string | null;
};

const HIERARCHY_ENDPOINTS: Record<HierarchyType, string> = {
  brands: '/admin/hierarchy/brands-hierarchy',
  categories: '/admin/hierarchy/categories-hierarchy',
  tags: '/admin/hierarchy/tags-hierarchy',
};

const fetchHierarchy = async (
  type: HierarchyType,
  search?: string,
): Promise<SimplifiedHierarchyItem[]> => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('limit', '1000');

  const endpoint = HIERARCHY_ENDPOINTS[type];
  const response = await fetchWrapper.get<{
    data: HierarchyItem[];
  }>(`${endpoint}?${params}`);

  if (!response.success) {
    throw new Error(`${type} hierarchy fetch failed`);
  }

  return response.data.data.map((item) => ({
    id: item.nodeId,
    name: item.name,
    slug: item.slug,
    depth: item.depth,
    parentId: item.parentId,
  }));
};

export const useHierarchy = (
  type: HierarchyType,
  options?: {
    search?: string;
    enabled?: boolean;
  },
): UseQueryResult<SimplifiedHierarchyItem[], Error> => {
  const { search, enabled = true } = options || {};

  const getQueryKey = () => {
    switch (type) {
      case 'brands':
        return DataKeys.admin.hierarchy.brands(search);
      case 'categories':
        return DataKeys.admin.hierarchy.categories(search);
      case 'tags':
        return DataKeys.admin.hierarchy.tags(search);
      default:
        return DataKeys.admin.hierarchy.brands(search);
    }
  };

  return useQuery({
    queryKey: getQueryKey(),
    queryFn: () => fetchHierarchy(type, search),
    enabled,
  });
};
