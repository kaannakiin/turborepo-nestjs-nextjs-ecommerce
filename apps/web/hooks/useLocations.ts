import fetchWrapper from "@lib/wrappers/fetchWrapper";
import { useQuery, UseQueryOptions } from "@repo/shared";
import {
  GetAllCountryReturnType,
  GetAllCityReturnType,
  GetAllStateReturnType,
} from "@repo/types";
import { CountryType } from "@repo/database/client";

const LOCATION_STALE_TIME = 1000 * 60 * 60;

export const useCountries = (
  options?: Omit<
    UseQueryOptions<GetAllCountryReturnType[], Error>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ["locations", "countries"],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllCountryReturnType[]>(
        `/locations/get-all-countries`
      );
      if (!res.success) {
        throw new Error("Failed to fetch countries");
      }
      return res.data;
    },
    staleTime: LOCATION_STALE_TIME,
    ...options,
  });
};

interface UseStatesOptions {
  countryId: string;
  addressType?: CountryType;
  enabled?: boolean;
}

export const useStates = ({
  countryId,
  addressType,
  enabled = true,
}: UseStatesOptions) => {
  return useQuery({
    queryKey: ["locations", "states", countryId],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllStateReturnType[]>(
        `/locations/get-states-by-country/${countryId}`
      );
      if (!res.success) {
        throw new Error("Failed to fetch states");
      }
      return res.data;
    },
    staleTime: LOCATION_STALE_TIME,
    enabled:
      !!countryId && enabled && (addressType ? addressType === "STATE" : true),
  });
};

interface UseCitiesOptions {
  countryId: string;
  addressType?: CountryType;
  enabled?: boolean;
}

export const useCities = ({
  countryId,
  addressType,
  enabled = true,
}: UseCitiesOptions) => {
  return useQuery({
    queryKey: ["locations", "cities", countryId],
    queryFn: async () => {
      const res = await fetchWrapper.get<GetAllCityReturnType[]>(
        `/locations/get-cities-by-country/${countryId}`
      );
      if (!res.success) {
        throw new Error("Failed to fetch cities");
      }
      return res.data;
    },
    staleTime: LOCATION_STALE_TIME,
    enabled:
      !!countryId && enabled && (addressType ? addressType === "CITY" : true),
  });
};

interface UseDistrictsOptions {
  countryId: string;
  cityId: string;
  enabled?: boolean;
}

export const useDistricts = ({
  countryId,
  cityId,
  enabled = true,
}: UseDistrictsOptions) => {
  return useQuery({
    queryKey: ["locations", "districts", countryId, cityId],
    queryFn: async () => {
      const res = await fetchWrapper.get<{
        success: boolean;
        data: { id: string; name: string }[];
      }>(`/locations/get-districts-turkey-city/${countryId}/${cityId}`);
      if (!res.success) {
        throw new Error("Failed to fetch districts");
      }
      if (!res.data.success || !res.data.data) {
        return [];
      }
      return res.data.data;
    },
    staleTime: LOCATION_STALE_TIME,
    enabled: !!countryId && !!cityId && enabled,
  });
};
