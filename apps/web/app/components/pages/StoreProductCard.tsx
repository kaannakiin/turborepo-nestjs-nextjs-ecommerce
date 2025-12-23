"use client";

import { InfinityScrollPageReturnType } from "@repo/types";

type Product = InfinityScrollPageReturnType["products"][number];
type Variant = Product["variants"][number];

interface StoreProductCardProps {
  product: Product;
  variant: Variant;
}

const StoreProductCard = ({ product, variant }: StoreProductCardProps) => {
  const productName = product.translations?.[0]?.name || variant.sku;

  return <div className="h-96">StoreProductCard - {productName}</div>;
};

export default StoreProductCard;
