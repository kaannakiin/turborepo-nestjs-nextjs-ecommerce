import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { User } from '@repo/database/client';
import { keepPreviousData, useQuery } from '@repo/shared';
import { AllUsersReturnType, Pagination } from '@repo/types';

export const useAdminSelectableUsers = ({
  page = 1,
  search = '',
  enabled = true,
}: {
  page?: number;
  search?: string;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: DataKeys.users.selectable(page, search),
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        users: User[];
        pagination?: Pagination;
      }>('/admin/users/get-user-infos', {
        params: {
          ...(page > 1 ? { page } : {}),
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      });
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(
          error.error || 'Kullanıcılar getirilirken bir hata oluştu.',
        );
      }
      return res.data;
    },
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useAllUsers = (enabled: boolean = true) => {
  return useQuery({
    queryKey: DataKeys.users.all,
    queryFn: async () => {
      const res = await fetchWrapper.get<AllUsersReturnType[]>(
        '/admin/users/all-users',
      );
      if (!res || !res.success) {
        return [];
      }
      return res.data;
    },
    enabled,
  });
};
