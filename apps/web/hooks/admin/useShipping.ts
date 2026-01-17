import { DataKeys } from '@lib/data-keys';
import fetchWrapper from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery, useQueryClient } from '@repo/shared';
import { CargoZones, CargoZoneType } from '@repo/types';

export const useCargoZones = () => {
  return useQuery({
    queryKey: DataKeys.shipping.zones,
    queryFn: async () => {
      const req = await fetchWrapper.get<{
        success: boolean;
        cargoZones: Array<CargoZones>;
      }>(`/shipping/get-all-cargo-zones`, {});
      if (!req.success) {
        return null;
      }

      if (!req.data.success) {
        return null;
      }
      return req.data.cargoZones;
    },
    refetchOnMount: false,
  });
};

export const useCreateOrUpdateCargoZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [DataKeys.shipping.createOrUpdate],
    mutationFn: async (data: CargoZoneType) => {
      const req = await fetchWrapper.post<{
        success: boolean;
        message: string;
      }>(`/shipping/create-or-update-cargo-zone`, data);
      if (!req.success) {
        throw new Error('Failed to create or update cargo zone');
      }
      return req.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DataKeys.shipping.zones,
      });
    },
  });
};
