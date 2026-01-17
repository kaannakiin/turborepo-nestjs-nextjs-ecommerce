import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery } from '@repo/shared';
import { StoreZodInputType, StoreZodOutputType } from '@repo/types';

export const useStoreUpsertMutation = () => {
  return useMutation({
    mutationKey: DataKeys.admin.store.upsert,
    mutationFn: async (data: StoreZodOutputType) => {
      const res = await fetchWrapper.post('/admin/store', data);
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res;
    },
    onSuccess: (data, variables, res, context) => {
      context.client.invalidateQueries({
        queryKey: DataKeys.admin.store.get,
      });
    },
  });
};

export const useStoreGetQuery = () => {
  return useQuery({
    queryKey: DataKeys.admin.store.get,
    queryFn: async () => {
      const res = await fetchWrapper.get<StoreZodInputType>('/admin/store');
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res.data;
    },
    retry: 1,
  });
};
