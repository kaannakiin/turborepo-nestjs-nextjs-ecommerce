import { useCartStore } from '@/context/cart-context/CartContext';
import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@repo/shared';
import { LoginSchemaType, RegisterSchemaType } from '@repo/types';

export const useSignOut = (): UseMutationResult<
  { success: boolean; message?: string },
  Error,
  void,
  unknown
> => {
  const clearCartState = useCartStore((state) => state.clearCartState);
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [DataKeys.auth.signOut],
    mutationFn: async () => {
      const res = await fetchWrapper.post<{
        success: boolean;
        message?: string;
      }>('/auth/sign-out', {});
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || 'Çıkış yaparken bir hata oluştu.');
      }
      return res.data;
    },
    onSuccess: () => {
      clearCartState();
      queryClient.removeQueries({ queryKey: DataKeys.cart.get });
    },
  });
};

export const useSignIn = (): UseMutationResult<
  { success: boolean; message: string },
  Error,
  LoginSchemaType,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.auth.signIn],
    mutationFn: async (data: LoginSchemaType) => {
      const res = await fetchWrapper.post<{
        success: boolean;
        message: string;
      }>('/auth/login', {
        username: data.type === 'email' ? data.email : data.phone,
        password: data.password,
      });
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || 'Giriş yaparken bir hata oluştu.');
      }
      return res.data;
    },
    onSuccess: async (_, __, ___, context) => {
      await context.client.invalidateQueries({ queryKey: DataKeys.cart.get });
    },
  });
};

export const useSignUp = (): UseMutationResult<
  { success: boolean; message: string },
  Error,
  RegisterSchemaType,
  unknown
> => {
  return useMutation({
    mutationKey: [DataKeys.auth.signUp],
    mutationFn: async (data: RegisterSchemaType) => {
      const res = await fetchWrapper.post<{
        success: boolean;
        message: string;
      }>('/auth/register', data);

      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error || 'Kayıt olurken bir hata oluştu.');
      }

      return res.data;
    },
  });
};
