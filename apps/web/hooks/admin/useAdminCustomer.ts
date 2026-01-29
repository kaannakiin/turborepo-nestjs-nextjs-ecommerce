import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { CustomerGroup, User } from '@repo/database/client';
import {
  useMutation,
  useQuery,
  type UseMutationResult,
  type UseQueryResult,
} from '@repo/shared';
import {
  createDefaultDecisionTree,
  CustomerGroupInputZodType,
  CustomerGroupOutputZodType,
  DecisionTreeSchema,
  Pagination,
  SortAdminUserTable,
} from '@repo/types';

type CustomerGroupUpsertResponse = {
  success: boolean;
  segmentId?: string;
};
type CustomerGroupResponse = {
  group: CustomerGroup;
  users: User[];
};

export const useCreateCustomerSegment = (): UseMutationResult<
  CustomerGroupUpsertResponse,
  Error,
  CustomerGroupOutputZodType,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.admin.customerGroups.create],
    mutationFn: async (data: CustomerGroupOutputZodType) => {
      const response = await fetchWrapper.post<CustomerGroupUpsertResponse>(
        '/admin/users/customer-group',
        data,
      );

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Segment kaydedilemedi');
      }

      if (!response.data.success) {
        throw new Error('Segment kaydedilemedi');
      }

      return response.data;
    },
    onSuccess: (data, variables, _, context) => {
      context.client.invalidateQueries({
        queryKey: [DataKeys.admin.customerGroups.key],
      });
    },
  });
};

export const useGetCustomerSegments = (
  page: number = 1,
  limit: number = 20,
  search?: string,
): UseQueryResult<
  {
    groups: (CustomerGroup & { _count: { users: number } })[];
    pagination: Pagination;
  },
  Error
> => {
  return useQuery({
    queryKey: DataKeys.admin.customerGroups.list(page, limit, search),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetchWrapper.get<{
        groups: (CustomerGroup & { _count: { users: number } })[];
        pagination: Pagination;
      }>(`/admin/users/customer-groups?${params.toString()}`);

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Segmentler alınamadı');
      }

      return response.data;
    },
  });
};

export const useGetCustomerSegment = (
  segmentId: string,
): UseQueryResult<CustomerGroupInputZodType, Error> => {
  return useQuery({
    queryKey: DataKeys.admin.customerGroups.detail(segmentId),

    queryFn: async () => {
      const response = await fetchWrapper.get<CustomerGroupResponse | null>(
        `/admin/users/customer-group/${segmentId}`,
      );

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Segment alınamadı');
      }
      if (!response.data) {
        throw new Error('Segment bulunamadı');
      }

      return response.data;
    },

    select: (data: CustomerGroupResponse): CustomerGroupInputZodType => {
      const { group, users } = data;

      const baseData = {
        uniqueId: group.id,
        name: group.name,
        description: group.description || '',
        isActive: true,
      };

      if (group.type === 'MANUAL') {
        return {
          ...baseData,
          type: 'MANUAL',
          conditions: null,
          users: users.map((user) => user.id),
        } as CustomerGroupInputZodType;
      }

      const parsedConditions = DecisionTreeSchema.safeParse(group.conditions);

      return {
        ...baseData,
        type: 'SMART',
        conditions: parsedConditions.success
          ? parsedConditions.data
          : createDefaultDecisionTree(),
      } as CustomerGroupInputZodType;
    },

    enabled: !!segmentId && segmentId !== 'new',
  });
};

export const useGetCustomerList = (
  page: number,
  limit: number,
  search?: string,
  sortBy?: SortAdminUserTable,
): UseQueryResult<{ users: User[]; pagination: Pagination }, Error> => {
  return useQuery({
    queryKey: DataKeys.admin.customers.list(page, limit, search, sortBy),
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {}),
        ...(sortBy ? { sortBy } : {}),
      });
      const response = await fetchWrapper.get<{
        users: User[];
        pagination: Pagination;
      }>(`/admin/users?${params.toString()}`);
      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Müşteriler alınamadı');
      }

      if (!response.data) {
        throw new Error('Müşteriler bulunamadı');
      }

      return response.data;
    },
  });
};

export const useCustomerGroups = (): UseQueryResult<CustomerGroup[], Error> => {
  return useQuery({
    queryKey: DataKeys.admin.customerGroups.all,
    queryFn: async () => {
      const response = await fetchWrapper.get<CustomerGroup[]>(
        `/admin/users/customer-groups`,
      );

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Müşteri grupları alınamadı');
      }

      return response.data;
    },
  });
};
