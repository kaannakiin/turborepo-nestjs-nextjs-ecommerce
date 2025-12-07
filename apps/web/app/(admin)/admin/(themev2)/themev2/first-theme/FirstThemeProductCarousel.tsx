"use client";

import fetchWrapper from "@lib/fetchWrapper";
import { useQuery } from "@repo/shared";
import {
  ProductCarouselComponentOutputType,
  ProductCarouselItemDataType,
} from "@repo/types";
import { useEffect, useMemo, useState } from "react";

interface FirstThemeProductCarouselProps {
  data: ProductCarouselComponentOutputType;
}

const FirstThemeProductCarousel = ({
  data,
}: FirstThemeProductCarouselProps) => {
  const [cachedItems, setCachedItems] = useState<{
    products: ProductCarouselItemDataType["products"];
    variants: ProductCarouselItemDataType["variants"];
  }>({
    products: [],
    variants: [],
  });

  const currentProductIds = useMemo(
    () =>
      data?.items
        .filter((item) => item.productId)
        .map((item) => item.productId!) || [],
    [data]
  );

  const currentVariantIds = useMemo(
    () =>
      data?.items
        .filter((item) => item.variantId)
        .map((item) => item.variantId!) || [],
    [data]
  );

  const missingProductIds = useMemo(() => {
    const existingIds = new Set(cachedItems.products.map((p) => p.id));
    return currentProductIds.filter((id) => !existingIds.has(id));
  }, [currentProductIds, cachedItems.products]);

  const missingVariantIds = useMemo(() => {
    const existingIds = new Set(cachedItems.variants.map((v) => v.id));
    return currentVariantIds.filter((id) => !existingIds.has(id));
  }, [currentVariantIds, cachedItems.variants]);

  const { data: newFetchedData, isLoading } = useQuery({
    queryKey: [
      "product-carousel-missing",
      { missingProductIds, missingVariantIds },
    ],
    queryFn: async () => {
      const response = await fetchWrapper.post<ProductCarouselItemDataType>(
        "/admin/themev2/product-carousel-products",
        {
          productIds: missingProductIds,
          variantIds: missingVariantIds,
        }
      );
      if (!response.success) {
        throw new Error("Ürün verileri alınamadı");
      }
      if (!response.data.success) {
        throw new Error("Ürün verileri işlenemedi");
      }
      return response.data;
    },

    enabled: missingProductIds.length > 0 || missingVariantIds.length > 0,

    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (newFetchedData) {
      const newProducts =
        (newFetchedData as unknown as ProductCarouselItemDataType).products ||
        [];
      const newVariants =
        (newFetchedData as unknown as ProductCarouselItemDataType).variants ||
        [];

      if (newProducts.length > 0 || newVariants.length > 0) {
        setCachedItems((prev) => ({
          products: [...prev.products, ...newProducts],
          variants: [...prev.variants, ...newVariants],
        }));
      }
    }
  }, [newFetchedData]);

  const displayProducts = cachedItems.products.filter((p) =>
    currentProductIds.includes(p.id)
  );

  const displayVariants = cachedItems.variants.filter((v) =>
    currentVariantIds.includes(v.id)
  );

  const isGlobalLoading =
    (missingProductIds.length > 0 || missingVariantIds.length > 0) && isLoading;

  if (isGlobalLoading) return <div>Yükleniyor...</div>;

  return (
    <div>
      <div>Ürün Sayısı: {displayProducts.length}</div>
      <div>Varyant Sayısı: {displayVariants.length}</div>
    </div>
  );
};

export default FirstThemeProductCarousel;
