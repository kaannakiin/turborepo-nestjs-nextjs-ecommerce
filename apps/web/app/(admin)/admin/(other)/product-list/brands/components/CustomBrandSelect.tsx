"use client";

import fetchWrapper from "@lib/fetchWrapper";
import { Select, SelectProps } from "@mantine/core";
import { useQuery } from "@repo/shared";

interface CustomBrandSelectProps extends SelectProps {
  brandId?: string;
}
const CustomBrandSelect = ({ brandId, ...props }: CustomBrandSelectProps) => {
  const fetchParentBrands = async (brandId?: string) => {
    const endpoint = brandId
      ? `get-all-parent-brands/${brandId}`
      : "get-all-parent-brands";

    const result = await fetchWrapper.get<{
      success: boolean;
      data: { label: string; value: string }[];
    }>(`/admin/products/brands/${endpoint}`);

    if (!result.success) {
      throw new Error("Failed to fetch parent brands");
    }

    // Backend'den gelen data içinde zaten { success: true, data: brands } var
    return result.data.data; // İkinci .data backend'den geliyor
  };

  const useParentBrands = (currentBrandId?: string) => {
    return useQuery({
      queryKey: ["parentBrands", currentBrandId],
      queryFn: () => fetchParentBrands(currentBrandId),
      staleTime: 5 * 60 * 1000, // 5 dakika
      gcTime: 10 * 60 * 1000, // 10 dakika (eskiden cacheTime)
      refetchOnWindowFocus: false,
    });
  };

  const {
    data: parentBrands = [] as SelectProps["data"],
    isLoading: parentBrandsLoading,
  } = useParentBrands(brandId ? brandId : undefined);

  return (
    <>
      <Select
        {...props}
        clearable
        data={parentBrands}
        disabled={parentBrandsLoading}
      />
    </>
  );
};

export default CustomBrandSelect;
