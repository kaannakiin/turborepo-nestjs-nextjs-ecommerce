import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { PaymentProvider } from '@repo/database/client';
import { useQuery } from '@repo/shared';
import { GetPaymentMethodResponseType, PaymentMethodType } from '@repo/types';

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: DataKeys.payments.methods,
    queryFn: async () => {
      const response = await fetchWrapper.get<PaymentMethodType[]>(
        `/admin/payments/payment-methods`,
      );
      if (!response.success) {
        const errorResponse = response as ApiError;
        throw new Error(
          errorResponse.error || 'Failed to fetch payment methods',
        );
      }
      return response.data;
    },
  });
};

export const usePaymentMethod = (paymentProvider: PaymentProvider | null) => {
  return useQuery({
    queryKey: DataKeys.payments.method(paymentProvider || ''),
    queryFn: async () => {
      if (!paymentProvider) return null;
      const res = await fetchWrapper.get<GetPaymentMethodResponseType>(
        `/admin/payments/payment-method/${paymentProvider}`,
      );
      if (!res.success) {
        throw new Error('Failed to fetch payment method');
      }
      if (!res.data.success || !res.data.data) {
        throw new Error(res.data.message);
      }
      return res.data.data;
    },
    enabled: !!paymentProvider,
    retry: false,
    refetchOnWindowFocus: false,
  });
};
