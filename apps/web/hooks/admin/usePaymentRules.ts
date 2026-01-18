import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery, useQueryClient } from '@repo/shared';
import {
  CreatePaymentRuleZodOutput,
  PaymentRuleDetailResponse,
  PaymentRuleListResponse,
  PaymentRuleMutationResponse,
} from '@repo/types';
import { notifications } from '@mantine/notifications';

export const usePaymentRules = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: DataKeys.paymentRules.list(page, limit),
    queryFn: async () => {
      const response = await fetchWrapper.get<PaymentRuleListResponse>(
        `/admin/payment-rules?page=${page}&limit=${limit}`,
      );
      if (!response.success) {
        const errorResponse = response as ApiError;
        throw new Error(errorResponse.error || 'Failed to fetch payment rules');
      }
      return response.data;
    },
  });
};

export const usePaymentRule = (id: string | null) => {
  return useQuery({
    queryKey: DataKeys.paymentRules.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const response = await fetchWrapper.get<PaymentRuleDetailResponse>(
        `/admin/payment-rules/${id}`,
      );
      if (!response.success) {
        throw new Error('Failed to fetch payment rule');
      }
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    },
    enabled: !!id,
    retry: false,
  });
};

export const useCreatePaymentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DataKeys.paymentRules.create],
    mutationFn: async (data: CreatePaymentRuleZodOutput) => {
      const response = await fetchWrapper.post<PaymentRuleMutationResponse>(
        '/admin/payment-rules',
        data,
      );
      if (!response.success) {
        throw new Error('Failed to create payment rule');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: data.message,
          color: 'green',
        });
        queryClient.invalidateQueries({
          queryKey: [DataKeys.paymentRules.key],
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Hata',
        message: error.message,
        color: 'red',
      });
    },
  });
};

export const useUpdatePaymentRule = () => {
  return useMutation({
    mutationKey: [DataKeys.paymentRules.update],
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreatePaymentRuleZodOutput;
    }) => {
      const response = await fetchWrapper.put<PaymentRuleMutationResponse>(
        `/admin/payment-rules/${id}`,
        data,
      );
      if (!response.success) {
        throw new Error('Failed to update payment rule');
      }
      return response.data;
    },
    onSuccess: (data, variables, _, context) => {
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: data.message,
          color: 'green',
        });
        context.client.invalidateQueries({
          queryKey: [DataKeys.paymentRules.key],
        });
        context.client.invalidateQueries({
          queryKey: DataKeys.paymentRules.detail(variables.id),
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Hata',
        message: error.message,
        color: 'red',
      });
    },
  });
};

export const useDeletePaymentRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DataKeys.paymentRules.delete],
    mutationFn: async (id: string) => {
      const response = await fetchWrapper.delete<PaymentRuleMutationResponse>(
        `/admin/payment-rules/${id}`,
      );
      if (!response.success) {
        throw new Error('Failed to delete payment rule');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        notifications.show({
          title: 'Başarılı',
          message: data.message,
          color: 'green',
        });
        queryClient.invalidateQueries({
          queryKey: [DataKeys.paymentRules.key],
        });
      }
    },
    onError: (error) => {
      notifications.show({
        title: 'Hata',
        message: error.message,
        color: 'red',
      });
    },
  });
};
