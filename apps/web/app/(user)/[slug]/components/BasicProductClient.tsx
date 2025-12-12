"use client";

import ProductsCarousels from "@/(user)/components/ProductsCarousels";
import { Stack } from "@mantine/core";
import { GetProductPageReturnType } from "@repo/types";
import { AssetType } from "@repo/database/client";
import ProductAssetViewer from "./ProductAssetViewer";
import BasicProductRightSection from "./BasicProductRightSection";

interface BasicProductClientProps {
  productData: GetProductPageReturnType["data"];
}
const BasicProductClient = ({ productData }: BasicProductClientProps) => {
  const { assets, ...otherDetails } = productData;
  const productMedia: Array<{ url: string; type: AssetType }> = assets
    .sort((a, b) => a.order - b.order)
    .filter((asset) => asset.asset.url && asset.asset.type)
    .map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    }));

  return (
    <>
      <Stack
        gap={"lg"}
        className="w-full min-h-full max-w-[1500px] lg:mx-auto flex my-4"
      >
        <div className="min-w-full min-h-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="w-full lg:col-span-6 lg:px-4">
            <ProductAssetViewer assets={productMedia} />
          </div>
          <div className="w-full lg:col-span-6 px-4">
            <div className="lg:sticky lg:top-8">
              <BasicProductRightSection
                otherDetails={otherDetails}
                asset={productMedia[0] || null}
              />
            </div>
          </div>
        </div>
      </Stack>
      <ProductsCarousels
        title="Benzer Ürünler"
        stackClassName="px-4"
        productId={otherDetails.id}
      />
    </>
  );
};

export default BasicProductClient;
