import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { FulfillmentStrategy, LocationType } from '@repo/database/client';
import { useMutation, useQuery } from '@repo/shared';
import {
  AdminInventoryTableReturnType,
  FullfillmentStrategyInput,
  FullfillmentStrategyOutput,
  InventoryLocationZodSchemaType,
  Pagination,
  UpsertInventoryRuleFulfillmentStrategy,
} from '@repo/types';

interface InventoryProps {
  search?: string;
  page: number;
  take: number;
  enabled?: boolean;
}

export const useInvetoryRule = ({
  page = 1,
  take = 20,
  search,
  enabled = true,
}: InventoryProps) => {
  return useQuery({
    queryKey: DataKeys.admin.inventory.list(page, take, search),
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('take', take.toString());
      if (search) {
        params.append('search', search);
      }
      const res = await fetchWrapper.get<{
        data: FulfillmentStrategy[];
        pagination: Pagination;
      }>(
        `/admin/inventory/inventory-rule-fulfillment-strategies?${params.toString()}`,
      );
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res.data;
    },
  });
};

export const useInventoryRuleDetail = (
  id: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: DataKeys.admin.inventory.detail(id),
    enabled: options?.enabled ?? true,
    queryFn: async () => {
      const res = await fetchWrapper.get<FullfillmentStrategyInput>(
        `/admin/inventory/inventory-rule-fulfillment-strategy/${id}`,
      );
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res.data;
    },
  });
};

export const useUpsertInventoryRule = () => {
  return useMutation({
    mutationKey: DataKeys.admin.inventory.upsert,
    mutationFn: async (data: FullfillmentStrategyOutput) => {
      const res =
        await fetchWrapper.post<UpsertInventoryRuleFulfillmentStrategy>(
          '/admin/inventory/inventory-rule-fulfillment-strategy',
          data,
        );
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res.data;
    },
    onSuccess: (successData, variables, _s, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.inventory.key],
      });
    },
  });
};

interface InventoryLocationProps {
  page: number;
  limit: number;
  search?: string;
  type?: LocationType;
}

export const useInventoryLocations = ({
  page,
  limit,
  search,
  type,
}: InventoryLocationProps) => {
  return useQuery({
    queryKey: ['admin-inventory-location-list', page, limit, search, type],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (type) params.set('type', type);

      const res = await fetchWrapper.get<AdminInventoryTableReturnType>(
        `/admin/inventory/location?${params.toString()}`,
      );
      if (!res.success) {
        throw new Error('Failed to fetch inventory locations');
      }
      return res.data;
    },
  });
};

export const useInventoryLocationDetail = (
  slug: string,
  isEditMode: boolean,
) => {
  return useQuery({
    queryKey: ['inventory-location-detail', slug],
    queryFn: async () => {
      const response = await fetchWrapper.get<InventoryLocationZodSchemaType>(
        `/admin/inventory/location/${slug}`,
      );
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error);
      }
      return response.data;
    },
    enabled: !!isEditMode,
    retry: false,
  });
};

export const useUpsertInventoryLocation = (
  isEditMode: boolean,
  slug: string,
) => {
  return useMutation({
    mutationKey: ['upsert-inventory-location'],
    mutationFn: async (data: InventoryLocationZodSchemaType) => {
      const response = await fetchWrapper.post(
        '/admin/inventory/location',
        data,
      );
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error);
      }
      return response.data;
    },
    onSuccess: (_data, _variables, _result, context) => {
      context.client.invalidateQueries({
        queryKey: ['admin-inventory-location-list'],
      });
      if (isEditMode) {
        context.client.invalidateQueries({
          queryKey: ['inventory-location-detail', slug],
        });
      }
    },
  });
};
