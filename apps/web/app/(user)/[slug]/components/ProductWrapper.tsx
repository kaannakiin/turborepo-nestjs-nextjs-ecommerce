"use client";

import { Suspense } from "react";
import ProductPageClient from "./ProductPageClient";

export const ProductWrapper = ({ slug }: { slug: string }) => {
  return (
    <Suspense fallback={null}>
      <ProductPageClient slug={slug} />
    </Suspense>
  );
};
