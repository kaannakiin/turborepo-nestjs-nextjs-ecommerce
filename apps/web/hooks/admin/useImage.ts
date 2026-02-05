import { useMutation } from '@repo/shared';
import fetchWrapper, { ApiError } from '../../lib/wrappers/fetchWrapper';

interface DeleteAssetResponse {
  success: boolean;
  message: string;
}

export const useDeleteAsset = (): {
  deleteAsset: (url: string) => Promise<DeleteAssetResponse>;
  isPending: boolean;
  error: Error | null;
} => {
  const mutation = useMutation({
    mutationFn: async (url: string): Promise<DeleteAssetResponse> => {
      const response = await fetchWrapper.delete<DeleteAssetResponse>(
        `/asset?url=${encodeURIComponent(url)}`,
      );

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || 'Asset silinirken bir hata oluştu.');
      }

      return response.data;
    },
  });

  return {
    deleteAsset: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
};
