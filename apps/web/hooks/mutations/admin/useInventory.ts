import fetchWrapper, { ApiError } from "@lib/wrappers/fetchWrapper";
import { FulfillmentStrategy } from "@repo/database/client";
import { useQuery } from "@repo/shared";
import { Pagination } from "@repo/types";
interface InventoryProps {
  search?: string;
  page: number;
  take: number;
}

export const useInventory = ({
  page = 1,
  take = 20,
  search,
}: InventoryProps) => {
  return useQuery({
    queryKey: ["inventory", "list", { page, take, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("take", take.toString());
      if (search) {
        params.append("search", search);
      }
      const res = await fetchWrapper.get<{
        data: FulfillmentStrategy[];
        pagination: Pagination;
      }>(`/admin/inventory/fulfillment-strategies?${params.toString()}`);
      if (!res.success) {
        const error = res as ApiError;
        throw new Error(error.error);
      }
      return res.data;
    },
  });
};
