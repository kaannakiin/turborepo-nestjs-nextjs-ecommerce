"use client";

import ProductsCarousels from "@/(user)/components/ProductsCarousels";
import { Stack } from "@mantine/core";
import { $Enums, GetProductPageReturnType } from "@repo/types";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import ProductAssetViewer from "./ProductAssetViewer";
import ProductRightSection from "./ProductRightSection";

type VariantCombination =
  GetProductPageReturnType["data"]["variantCombinations"][0];

interface VariantProductClientProps {
  productData: GetProductPageReturnType["data"];
}

const VariantProductClient = ({ productData }: VariantProductClientProps) => {
  const { variantGroups, assets, variantCombinations, ...otherDetails } =
    productData;
  const searchParams = useSearchParams();

  const { selectedCombination, isFallback } = useMemo(() => {
    const selectedOptionsFromUrl: { [key: string]: string } = {};
    for (const [key, value] of searchParams.entries()) {
      selectedOptionsFromUrl[key] = value;
    }

    const groupAndOptionMap = new Map<string, Map<string, string>>();
    variantGroups.forEach((group) => {
      const groupTranslation = group.variantGroup.translations.find(
        (t) => t.locale === "TR"
      );
      if (!groupTranslation) return;
      const optionsMap = new Map<string, string>();
      group.options.forEach((opt) => {
        const optionTranslation = opt.variantOption.translations.find(
          (t) => t.locale === "TR"
        );
        if (optionTranslation) {
          optionsMap.set(optionTranslation.slug, opt.variantOption.id);
        }
      });
      groupAndOptionMap.set(groupTranslation.slug, optionsMap);
    });

    const requiredOptionIds = new Set<string>();
    for (const [groupSlug, optionSlug] of Object.entries(
      selectedOptionsFromUrl
    )) {
      const optionId = groupAndOptionMap.get(groupSlug)?.get(optionSlug);
      if (optionId) {
        requiredOptionIds.add(optionId);
      }
    }

    let combination: VariantCombination | null | undefined = null;

    if (requiredOptionIds.size > 0) {
      const potentialMatches = variantCombinations.filter((combo) => {
        const comboOptionIds = new Set(
          combo.options.map((opt) => opt.productVariantOption.variantOption.id)
        );
        for (const requiredId of requiredOptionIds) {
          if (!comboOptionIds.has(requiredId)) {
            return false;
          }
        }
        return true;
      });

      if (potentialMatches.length > 0) {
        combination = potentialMatches.find(
          (combo) => combo.active && combo.stock > 0
        );
      }
    }
    if (!combination) {
      const fallbackCombination = variantCombinations.find(
        (combo) => combo.active && combo.stock > 0
      );

      const isUrlEmpty = searchParams.toString().length === 0;
      return {
        selectedCombination: fallbackCombination || null,
        isFallback: isUrlEmpty,
      };
    }

    return { selectedCombination: combination, isFallback: false };
  }, [searchParams, variantCombinations, variantGroups]);

  const productMedia: Array<{ url: string; type: $Enums.AssetType }> = [
    ...(assets.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
    ...(selectedCombination?.assets.map((asset) => ({
      url: asset.asset.url,
      type: asset.asset.type,
    })) || []),
  ];
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
              <ProductRightSection
                selectedVariant={selectedCombination || null}
                variantGroups={variantGroups}
                otherDetails={otherDetails}
                firstAsset={productMedia[0] || null}
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

export default VariantProductClient;
