"use client";

import { Select, SelectProps, Text } from "@mantine/core";
import { useQuery } from "@repo/shared";

interface CustomBrandSelectProps extends SelectProps {
  brandId?: string;
}
const CustomBrandSelect = ({ brandId, ...props }: CustomBrandSelectProps) => {
  const fetchParentBrands = async (brandId?: string) => {
    const endpoint = brandId
      ? `get-all-parent-brands/${brandId}`
      : "get-all-parent-brands";

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/products/brands/${endpoint}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Parent brands getirilemedi");
    }

    const result = await response.json();
    return result.data;
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
