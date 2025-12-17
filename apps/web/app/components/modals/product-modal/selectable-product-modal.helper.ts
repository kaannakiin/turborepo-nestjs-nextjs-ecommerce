// utils/product-helpers.ts veya utils/carousel-helpers.ts

import { createId } from "@repo/shared";
import { CarouselItemInputType, ProductSelectResult } from "@repo/types";

/**
 * ProductSelectResult array'ini CarouselItem formatına dönüştürür.
 * - Varyant ise: productId = null, variantId = id
 * - Basit ürün ise: productId = id, variantId = null
 */
export const mapProductsToCarouselItems = (
  products: ProductSelectResult[]
): CarouselItemInputType[] => {
  return products.map((product) => ({
    itemId: createId(),
    productId: product.isVariant ? null : product.id,
    variantId: product.isVariant ? product.id : null,
    customTitle: product.name,
    badgeText: "",
  }));
};

/**
 * Mevcut carousel items ile yeni seçilen ürünleri karşılaştırıp
 * eklenecek ve silinecek item'ları hesaplar.
 */
export const diffCarouselItems = (
  currentItems: CarouselItemInputType[],
  selectedProducts: ProductSelectResult[]
): {
  toRemoveIndexes: number[];
  toAppend: CarouselItemInputType[];
} => {
  const selectedIdsSet = new Set(selectedProducts.map((p) => p.id));

  // Silinecekler: mevcut item'lardan artık seçili olmayanlart
  const toRemoveIndexes: number[] = [];
  currentItems.forEach((item, idx) => {
    const currentId = item.variantId || item.productId;
    if (currentId && !selectedIdsSet.has(currentId)) {
      toRemoveIndexes.push(idx);
    }
  });

  // Mevcut ID'ler
  const currentIds = currentItems
    .map((item) => item.variantId || item.productId || "")
    .filter(Boolean);

  // Eklenecekler: seçili ürünlerden mevcut olmayanlart
  const newProducts = selectedProducts.filter(
    (p) => !currentIds.includes(p.id)
  );
  const toAppend = mapProductsToCarouselItems(newProducts);

  return {
    toRemoveIndexes: toRemoveIndexes.sort((a, b) => b - a), // Büyükten küçüğe sırala (silme için)
    toAppend,
  };
};
