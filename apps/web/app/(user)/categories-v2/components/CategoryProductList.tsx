"use client";
import fetchWrapper from "@lib/fetchWrapper";
import { useQuery } from "@repo/shared";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface CategoryProductListProps {
  categoryIds: string[];
}

const CategoryProductList = ({ categoryIds }: CategoryProductListProps) => {
  const searchParams = useSearchParams();

  // searchParams'ı memoize et, her render'da yeni obje oluşturmasın
  const queryParams = useMemo(
    () => Object.fromEntries([...searchParams]),
    [searchParams]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "get-category-products",
      categoryIds, // Direkt array olarak ver
      queryParams, // Memoize edilmiş obje
    ],
    queryFn: async () => {
      const response = await fetchWrapper.post(
        "/user-page-v2/get-category-products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryIds,
            page: Number(queryParams.page) || 1,
            sort: Number(queryParams.sort) || 1,
            query: queryParams, // veya filterle sadece gerekli olanları al
          }),
        }
      );
      console.log("response", response);
      return response;
    },
  });

  if (isLoading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata oluştu</div>;

  return <div>{/* Ürünleri render et */}</div>;
};

export default CategoryProductList;
