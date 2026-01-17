import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { useMutation, useQuery } from '@repo/shared';
import { CargoZones, CargoZoneType, Pagination } from '@repo/types';

export const useCargoZones = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: DataKeys.shipping.zones(page, limit, search),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', limit.toString());
      if (search) {
        params.set('search', search);
      }

      const req = await fetchWrapper.get<{
        success: boolean;
        message: string;
        data?: CargoZones[];
        pagination?: Pagination;
      }>(`/admin/shipping/cargo-zones?${params.toString()}`, {});
      if (!req.success) {
        return null;
      }

      if (!req.data.success) {
        return null;
      }

      return req.data;
    },
    refetchOnMount: false,
  });
};

export const useCreateOrUpdateCargoZone = () => {
  return useMutation({
    mutationKey: [DataKeys.shipping.createOrUpdate],
    mutationFn: async (data: CargoZoneType) => {
      const req = await fetchWrapper.post<{
        success: boolean;
        message?: string;
      }>(`/admin/shipping/cargo-zone`, data);

      if (!req.success) {
        const error = req as ApiError;
        throw new Error(error.error || 'Failed to create or update cargo zone');
      }

      if (!req.data.success) {
        throw new Error(
          req.data.message || 'Failed to create or update cargo zone',
        );
      }

      return req.data;
    },
    onSuccess: (data, _, __, context) => {
      context.client.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === 'get-all-cargo-zones' ||
          query.queryKey[0] === 'get-cargo-zone',
      });
    },
  });
};

export const useGetCargoZone = (slug: string) => {
  return useQuery({
    queryKey: DataKeys.shipping.zone(slug),
    queryFn: async () => {
      const req = await fetchWrapper.get<{
        success: boolean;
        data?: CargoZoneType;
      }>(`/admin/shipping/cargo-zone/${slug}`, {});
      if (!req.success) {
        return null;
      }

      if (!req.data.success || !req.data.data) {
        return null;
      }
      return req.data.data;
    },
    refetchOnMount: false,
    enabled: !!slug && slug !== 'new',
  });
};
