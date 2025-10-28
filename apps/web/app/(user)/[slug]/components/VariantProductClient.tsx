"use client";

import ProductsCarousels from "@/(user)/components/ProductsCarousels";
import { Stack } from "@mantine/core";
import { $Enums } from "@repo/database";
import { GetProductPageReturnType } from "@repo/types";
import { useSearchParams } from "next/navigation";
import ProductAssetViewer from "./ProductAssetViewer";
import ProductRightSection from "./ProductRightSection";

type VariantCombination =
  GetProductPageReturnType["data"]["variantCombinations"][0];

interface VariantProductClientProps {
  productData: GetProductPageReturnType["data"];
}

const getSelectedOptionsFromUrl = (searchParams: URLSearchParams) => {
  const selectedOptions: { [key: string]: string } = {};
  for (const [key, value] of searchParams.entries()) {
    selectedOptions[key] = value;
  }
  return selectedOptions;
};

const buildGroupAndOptionMap = (
  variantGroups: GetProductPageReturnType["data"]["variantGroups"]
) => {
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
  return groupAndOptionMap;
};

const getRequiredOptionIds = (
  selectedOptionsFromUrl: { [key: string]: string },
  groupAndOptionMap: Map<string, Map<string, string>>
) => {
  const requiredOptionIds = new Set<string>();
  for (const [groupSlug, optionSlug] of Object.entries(
    selectedOptionsFromUrl
  )) {
    const optionId = groupAndOptionMap.get(groupSlug)?.get(optionSlug);
    if (optionId) {
      requiredOptionIds.add(optionId);
    }
  }
  return requiredOptionIds;
};

const findSelectedCombination = (
  requiredOptionIds: Set<string>,
  variantCombinations: GetProductPageReturnType["data"]["variantCombinations"],
  searchParams: URLSearchParams
) => {
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
      combination = potentialMatches[0];
    }
  }

  if (!combination) {
    const fallbackCombination = variantCombinations[0];

    const isUrlEmpty = searchParams.toString().length === 0;
    return {
      selectedCombination: fallbackCombination || null,
      isFallback: isUrlEmpty,
    };
  }

  return { selectedCombination: combination, isFallback: false };
};

const VariantProductClient = ({ productData }: VariantProductClientProps) => {
  const { variantGroups, assets, variantCombinations, ...otherDetails } =
    productData;
  const searchParams = useSearchParams();

  const selectedOptionsFromUrl = getSelectedOptionsFromUrl(searchParams);
  const groupAndOptionMap = buildGroupAndOptionMap(variantGroups);
  const selectedOptionIds = getRequiredOptionIds(
    selectedOptionsFromUrl,
    groupAndOptionMap
  );
  const { selectedCombination, isFallback } = findSelectedCombination(
    selectedOptionIds,
    variantCombinations,
    searchParams
  );

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
                availableCombinations={variantCombinations}
                selectedOptionIdsFromUrl={selectedOptionIds}
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
