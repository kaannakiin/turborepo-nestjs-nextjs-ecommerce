import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { FulfillmentStrategy } from '@repo/database/client';
import { useMutation, useQuery } from '@repo/shared';
import {
  FullfillmentStrategyInput,
  FullfillmentStrategyOutput,
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
    queryKey: ['inventory', 'list', { page, take, search }],
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
    queryKey: ['inventory', 'detail', id],
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
    mutationKey: ['inventory', 'upsert'],
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
      context.client.invalidateQueries({ queryKey: ['inventory', 'list'] });
      context.client.invalidateQueries({
        queryKey: ['inventory', 'detail', successData?.id],
      });
    },
  });
};
