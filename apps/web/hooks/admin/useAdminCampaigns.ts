import { DataKeys } from '@lib/data-keys';
import fetchWrapper, { ApiError } from '@lib/wrappers/fetchWrapper';
import { CampaignStatus } from '@repo/database/client';
import { useQuery, type UseQueryResult } from '@repo/shared';
import { CampaignZodType, GetCampaignsReturnType } from '@repo/types';

interface UseAdminCampaignsProps {
  page?: number;
  search?: string;
  type?: CampaignStatus | null;
}

export const useAdminCampaigns = ({
  page = 1,
  search,
  type,
}: UseAdminCampaignsProps): UseQueryResult<
  {
    data: GetCampaignsReturnType['data'];
    pagination: GetCampaignsReturnType['pagination'];
  },
  Error
> => {
  return useQuery({
    queryKey: DataKeys.campaigns.list(search, type ?? undefined, page),
    queryFn: async () => {
      const res = await fetchWrapper.get<GetCampaignsReturnType>(
        `/admin/campaigns/campaigns`,
        {
          params: {
            page,
            ...(search ? { search } : {}),
            ...(type ? { type } : {}),
          },
        },
      );

      if (!res.success) {
        throw new Error('Failed to fetch campaigns');
      }

      if (!res.data.success || !res.data.data || !res.data.pagination) {
        throw new Error(res.data.message);
      }

      return { data: res.data.data, pagination: res.data.pagination };
    },
  });
};

export const useAdminCampaignDetail = (
  slug: string,
): UseQueryResult<CampaignZodType, Error> => {
  return useQuery({
    queryKey: DataKeys.campaigns.detail(slug),
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        success: boolean;
        data?: CampaignZodType;
        message?: string;
      }>(`/admin/campaigns/get-campaign/${slug}`);

      if (!res.success) {
        const errorResponse = res as ApiError;
        throw new Error(errorResponse.error || 'Failed to fetch campaign');
      }

      if (!res.data.success) {
        throw new Error(res.data.message || 'Failed to fetch campaign');
      }

      return res.data.data!;
    },
    enabled: slug !== 'new',
  });
};
