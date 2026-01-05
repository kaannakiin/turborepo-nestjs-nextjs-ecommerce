// hooks/useProductBulkAction.ts
import { ProductBulkAction } from "@repo/types";
import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { notifications } from "@mantine/notifications";
import { getBulkActionMessages } from "@lib/ui/bulk-action.helper";
import { useMutation, useQueryClient } from "@repo/shared";

export interface BulkActionPayload {
  action: ProductBulkAction;
  productIds: string[];
  // Extra data for specific actions
  categoryId?: string;
  brandId?: string;
  tagIds?: string[];
  taxonomyId?: string;
  supplierId?: string;
  percent?: number;
  amount?: number;
  stock?: number;
  reason?: string;
}

interface BulkActionResult {
  success: boolean;
  affectedCount: number;
}

interface UseProductBulkActionOptions {
  needsRefresh?: boolean;
  onSuccess?: (data: BulkActionResult) => void;
  onError?: (error: Error) => void;
}

export const useProductBulkAction = (
  options: UseProductBulkActionOptions = {}
) => {
  const { needsRefresh = true, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: BulkActionPayload
    ): Promise<BulkActionResult> => {
      const response = await fetchWrapper.post<BulkActionResult>(
        "/admin/products/bulk-action",
        payload
      );

      if (!response.success) {
        const error = response as ApiError;
        throw new Error(error.error || "İşlem başarısız");
      }

      return response.data;
    },
    onMutate: (payload) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.show({
        id: `bulk-action-${payload.action}`,
        loading: true,
        title: "İşlem yapılıyor",
        message: messages.loading,
        autoClose: false,
      });
    },
    onSuccess: (data, payload) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.update({
        id: `bulk-action-${payload.action}`,
        loading: false,
        title: "Başarılı",
        message: `${messages.success} (${data.affectedCount} ürün)`,
        color: "green",
        autoClose: 3000,
      });

      if (needsRefresh) {
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      }

      onSuccess?.(data);
    },
    onError: (error, payload) => {
      const messages = getBulkActionMessages(payload.action);
      notifications.update({
        id: `bulk-action-${payload.action}`,
        loading: false,
        title: "Hata",
        message: error instanceof Error ? error.message : messages.error,
        color: "red",
        autoClose: 5000,
      });

      onError?.(error instanceof Error ? error : new Error("Bilinmeyen hata"));
    },
  });
};
